/**
 * NoteEditor Component
 *
 * Displays a NotateDoc document using TipTap editor in read-only mode.
 * Fetches document via IPC and converts from NotateDoc format to TipTap JSON.
 */

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';

import { convertDocument } from '../lib/notateToTiptap.js';
import {
  RefNode,
  TagNode,
  CalloutNode,
  MathBlock,
  MathInline,
  Highlight,
} from '../extensions/index.js';
import { useDailyNoteInfo } from '../hooks/useDailyNoteInfo.js';
import { DailyNoteNavigation } from './DailyNoteNavigation.js';

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
  const { isDailyNote, dateKey } = useDailyNoteInfo(objectId);

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
      RefNode,
      TagNode,
      CalloutNode,
      MathBlock,
      MathInline,
      Highlight,
    ],
    editable: false, // Read-only for now
    immediatelyRender: false, // Important for Electron SSR concerns
  });

  useEffect(() => {
    async function loadDocument() {
      setState({ status: 'loading' });
      try {
        const result = await window.typenoteAPI.getDocument(objectId);
        if (result.success) {
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
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
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
        {/* Daily Note Navigation Header */}
        {isDailyNote && dateKey && onNavigate && (
          <div className="mb-4 pb-4 border-b">
            <DailyNoteNavigation dateKey={dateKey} onNavigate={onNavigate} />
          </div>
        )}
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  );
}
