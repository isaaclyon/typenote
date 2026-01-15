/**
 * NoteEditor Component
 *
 * Displays a NotateDoc document using TipTap editor with auto-save.
 * Fetches document via IPC and converts from NotateDoc format to TipTap JSON.
 */

/// <reference path="../global.d.ts" />

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';

import type { DocumentBlock } from '@typenote/api';
import { convertDocument } from '../lib/notateToTiptap.js';
import {
  RefNode,
  TagNode,
  CalloutNode,
  MathBlock,
  MathInline,
  Highlight,
  RefSuggestion,
  AttachmentNode,
  SlashCommand,
  LineNavigation,
} from '../extensions/index.js';
import { useImageUpload } from '../hooks/useImageUpload.js';
import { useDailyNoteInfo } from '../hooks/useDailyNoteInfo.js';
import { useAutoSave } from '../hooks/useAutoSave.js';
import { DailyNoteNavigation } from './DailyNoteNavigation.js';
import { EditorBottomSections } from './EditorBottomSections.js';
import { Skeleton } from '@typenote/design-system';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface NoteEditorProps {
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

export function NoteEditor({ objectId, onNavigate }: NoteEditorProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [initialBlocks, setInitialBlocks] = useState<DocumentBlock[]>([]);
  const { isDailyNote, dateKey } = useDailyNoteInfo(objectId);

  // Search handler for wiki-link suggestions
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return [];
    const result = await window.typenoteAPI.listObjects();
    if (result.success) {
      return result.result
        .filter((obj) => obj.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10);
    }
    return [];
  }, []);

  // Create handler for "Create new" option in suggestions
  const handleCreate = useCallback(async (title: string) => {
    const result = await window.typenoteAPI.createObject('Page', title);
    if (result.success) {
      return {
        id: result.result.id,
        title: result.result.title,
        typeId: result.result.typeId,
        typeKey: result.result.typeKey,
        updatedAt: result.result.updatedAt,
      };
    }
    return null;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit includes most basic nodes/marks we need
        // We add custom extensions for NotateDoc-specific features
      }),
      Placeholder.configure({
        placeholder: 'This document is empty...',
        showOnlyWhenEditable: false, // Show placeholder even in read-only mode
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      // Custom NotateDoc extensions
      RefNode.configure({
        onNavigate,
      }),
      TagNode,
      CalloutNode,
      MathBlock,
      MathInline,
      Highlight,
      AttachmentNode,
      // Wiki-link and mention suggestions
      RefSuggestion.configure({
        onSearch: handleSearch,
        onCreate: handleCreate,
      }),
      // Slash command palette
      SlashCommand,
      // Line navigation (Home/End keys)
      LineNavigation,
    ],
    editable: true, // Enable editing
    immediatelyRender: false, // Important for Electron SSR concerns
  });

  // Callback to update initialBlocks after save
  const handleSaveSuccess = useCallback(async (savedObjectId: string) => {
    // Refetch document to get updated blocks
    const result = await window.typenoteAPI.getDocument(savedObjectId);
    if (result.success) {
      setInitialBlocks(result.result.blocks);
    }
  }, []);

  // Wire up auto-save hook
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave({
    editor,
    objectId,
    initialBlocks,
    onSaveSuccess: handleSaveSuccess,
  });

  // Wire up image upload handlers for drag-drop and paste
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

  useEffect(() => {
    async function loadDocument() {
      setState({ status: 'loading' });
      try {
        const result = await window.typenoteAPI.getDocument(objectId);
        if (result.success) {
          // Store initial blocks for diffing
          setInitialBlocks(result.result.blocks);
          const tiptapContent = convertDocument(result.result);
          editor?.commands.setContent(tiptapContent);
          // TODO: Extract title from object metadata or first heading
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

    if (editor) {
      void loadDocument();
    }
  }, [objectId, editor]);

  // Loading state
  if (state.status === 'loading') {
    return (
      <div className="h-full overflow-auto" data-testid="loading-skeleton">
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
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Save status indicator */}
        <div
          data-testid="save-status"
          className="flex items-center justify-end text-xs text-muted-foreground mb-2 h-4"
        >
          {isSaving && <span>Saving...</span>}
          {!isSaving && lastSaved && <span>Saved {lastSaved.toLocaleTimeString()}</span>}
          {saveError && <span className="text-destructive">{saveError}</span>}
        </div>

        {/* Daily Note Navigation Header */}
        {isDailyNote && dateKey && onNavigate && (
          <div className="mb-4 pb-4 border-b">
            <DailyNoteNavigation dateKey={dateKey} onNavigate={onNavigate} />
          </div>
        )}
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />

        {/* Bottom sections for backlinks and unlinked mentions */}
        <EditorBottomSections objectId={objectId} {...(onNavigate && { onNavigate })} />
      </div>
    </div>
  );
}
