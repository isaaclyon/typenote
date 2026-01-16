/**
 * DocumentEditor Component
 *
 * Wrapper around InteractiveEditor from design-system that wires up
 * IPC callbacks for wiki-links, tags, and auto-save.
 *
 * This replaces NoteEditor with the design-system's InteractiveEditor,
 * keeping app-specific logic (IPC, auto-save, image upload) in the desktop app.
 */

/// <reference path="../global.d.ts" />

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DocumentBlock } from '@typenote/api';
import {
  InteractiveEditor,
  type InteractiveEditorRef,
  type MockNote,
  Skeleton,
  DailyNoteNav,
  DocumentHeader,
  SaveStatus,
  type SaveState,
} from '@typenote/design-system';
import { getPreviousDate, getNextDate, getTodayDateKey } from '@typenote/core';
import { convertDocument } from '../lib/notateToTiptap.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useDailyNoteInfo } from '../hooks/useDailyNoteInfo.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import { useSelectedObject } from '../hooks/useSelectedObject.js';
import { EditorBottomSections } from './EditorBottomSections.js';
import { getObjectTypeForKey } from '../config/typeMapping.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DocumentEditorProps {
  objectId: string;
  onNavigate?: (objectId: string) => void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; title: string };

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Formats a date key into the day name (e.g., "Thursday")
 */
function formatDayName(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

export function DocumentEditor({ objectId, onNavigate }: DocumentEditorProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [initialBlocks, setInitialBlocks] = useState<DocumentBlock[]>([]);
  const { isDailyNote, dateKey } = useDailyNoteInfo(objectId);
  const { object, refetch: refetchObject } = useSelectedObject(objectId);

  // Handle title change (for non-daily notes)
  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      const result = await window.typenoteAPI.updateObject({
        objectId,
        patch: { title: newTitle },
      });
      if (result.success) {
        await refetchObject();
      }
    },
    [objectId, refetchObject]
  );

  // Ref to access the InteractiveEditor's editor instance
  const editorRef = useRef<InteractiveEditorRef>(null);

  // Search handler for wiki-link suggestions (returns MockNote format)
  const handleRefSearch = useCallback(async (query: string): Promise<MockNote[]> => {
    if (!query.trim()) return [];
    const result = await window.typenoteAPI.listObjects();
    if (result.success) {
      return result.result
        .filter((obj) => obj.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((obj) => ({
          id: obj.id,
          title: obj.title,
          type: getObjectTypeForKey(obj.typeKey),
        }));
    }
    return [];
  }, []);

  // Create handler for "Create new" option in suggestions
  const handleRefCreate = useCallback(async (title: string): Promise<MockNote | null> => {
    const result = await window.typenoteAPI.createObject('Page', title);
    if (result.success) {
      return {
        id: result.result.id,
        title: result.result.title,
        type: getObjectTypeForKey(result.result.typeKey),
      };
    }
    return null;
  }, []);

  // Callback to update initialBlocks after save
  const handleSaveSuccess = useCallback(async (savedObjectId: string) => {
    // Refetch document to get updated blocks
    const result = await window.typenoteAPI.getDocument(savedObjectId);
    if (result.success) {
      setInitialBlocks(result.result.blocks);
    }
  }, []);

  // Wire up auto-save hook using editor from ref
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave({
    editor: editorRef.current?.editor ?? null,
    objectId,
    initialBlocks,
    onSaveSuccess: handleSaveSuccess,
  });

  // Compute save state for SaveStatus component
  const saveState: SaveState = (() => {
    if (isSaving) return 'saving';
    if (saveError) return 'error';
    if (lastSaved) return 'saved';
    return 'idle';
  })();

  // Wire up image upload handlers for drag-drop and paste
  const editor = editorRef.current?.editor ?? null;
  const { handleDrop, handlePaste } = useImageUpload(editor);

  useEffect(() => {
    if (editor === null) return;

    const editorElement = editor.view.dom;

    // Handle drop events
    const onDrop = (event: DragEvent) => {
      void handleDrop(event);
    };

    // Handle paste events
    const onPaste = (event: ClipboardEvent) => {
      void handlePaste(event);
    };

    editorElement.addEventListener('drop', onDrop);
    editorElement.addEventListener('paste', onPaste);

    return () => {
      editorElement.removeEventListener('drop', onDrop);
      editorElement.removeEventListener('paste', onPaste);
    };
  }, [editor, handleDrop, handlePaste]);

  // Initial content state for the editor
  const [initialContent, setInitialContent] = useState<
    import('@tiptap/react').JSONContent | undefined
  >(undefined);

  // Load document on mount or objectId change
  useEffect(() => {
    async function loadDocument() {
      setState({ status: 'loading' });
      setInitialContent(undefined);

      try {
        const result = await window.typenoteAPI.getDocument(objectId);
        if (result.success) {
          // Store initial blocks for diffing
          setInitialBlocks(result.result.blocks);
          const tiptapContent = convertDocument(result.result);
          setInitialContent(tiptapContent);
          setState({ status: 'loaded', title: 'Document' });
        } else {
          setState({ status: 'error', message: result.error.message });
        }
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    void loadDocument();
  }, [objectId]);

  // Update editor content when objectId changes (after initial load)
  useEffect(() => {
    const currentEditor = editorRef.current?.editor;
    if (currentEditor && initialContent) {
      currentEditor.commands.setContent(initialContent);
    }
  }, [initialContent]);

  // Loading state
  if (state.status === 'loading') {
    return (
      <div className="h-full" data-testid="loading-skeleton">
        <div className="max-w-3xl mx-auto p-8">
          {/* Save status placeholder */}
          <div className="flex items-center justify-end mb-2 h-4">
            <Skeleton className="h-3 w-16" />
          </div>
          {/* Title placeholder */}
          <Skeleton className="h-8 w-64 mb-6" />
          {/* Content placeholders */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error: {state.message}
      </div>
    );
  }

  // Loaded state - render editor
  return (
    <div className="h-full">
      <div className="max-w-3xl mx-auto p-8">
        {/* Save status indicator */}
        <div data-testid="save-status" className="flex items-center justify-end mb-2 h-4">
          <SaveStatus state={saveState} {...(saveError !== null && { errorText: saveError })} />
        </div>

        {/* Universal Document Header (editable for pages, immutable for daily notes) */}
        <DocumentHeader
          title={object?.title ?? ''}
          typeLabel={isDailyNote && dateKey ? formatDayName(dateKey) : (object?.typeKey ?? '')}
          {...(!isDailyNote && { onTitleChange: handleTitleChange })}
          {...(isDailyNote && dateKey !== null && { dailyNoteDateKey: dateKey })}
        />

        {/* Daily Note Navigation */}
        {isDailyNote && dateKey && onNavigate && (
          <div className="mb-6">
            <DailyNoteNav
              isToday={dateKey === getTodayDateKey()}
              onPrevious={async () => {
                const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(
                  getPreviousDate(dateKey)
                );
                if (result.success) onNavigate(result.result.dailyNote.id);
              }}
              onNext={async () => {
                const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(
                  getNextDate(dateKey)
                );
                if (result.success) onNavigate(result.result.dailyNote.id);
              }}
              onToday={async () => {
                const result =
                  await window.typenoteAPI.getOrCreateDailyNoteByDate(getTodayDateKey());
                if (result.success) onNavigate(result.result.dailyNote.id);
              }}
            />
          </div>
        )}

        {/* InteractiveEditor from design-system, wrapped for click-to-focus */}
        <div
          className="min-h-[300px] cursor-text"
          onClick={(e) => {
            // Only focus if clicking the wrapper itself (not editor content)
            if (e.target === e.currentTarget) {
              editorRef.current?.editor?.chain().focus('end').run();
            }
          }}
        >
          <InteractiveEditor
            ref={editorRef}
            {...(initialContent !== undefined && { initialContent })}
            placeholder="This document is empty..."
            className="prose prose-sm max-w-none"
            hideTitle
            refSuggestionCallbacks={{
              onSearch: handleRefSearch,
              onCreate: handleRefCreate,
            }}
            onNavigateToRef={onNavigate}
          />
        </div>

        {/* Bottom sections for backlinks and unlinked mentions */}
        <EditorBottomSections objectId={objectId} {...(onNavigate && { onNavigate })} />
      </div>
    </div>
  );
}
