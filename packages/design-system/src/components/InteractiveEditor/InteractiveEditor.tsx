import { useEditor, EditorContent, type UseEditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { cn } from '../../utils/cn.js';
import type { InteractiveEditorProps } from './types.js';

/**
 * InteractiveEditor - A fully functional TipTap editor for design system stories.
 *
 * Provides real editing capabilities with mocked autocomplete data for
 * wiki-links, tags, and slash commands.
 */
export function InteractiveEditor({
  initialContent,
  placeholder = 'Start typing...',
  onChange,
  onBlur,
  onFocus,
  editable = true,
  autofocus = false,
  className,
  minHeight = '200px',
}: InteractiveEditorProps) {
  // Build options object - handle exactOptionalPropertyTypes for content
  const editorOptions: UseEditorOptions = {
    extensions: [
      StarterKit.configure({}),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    editable,
    autofocus,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON());
    },
    onBlur: () => {
      onBlur?.();
    },
    onFocus: () => {
      onFocus?.();
    },
  };

  // Only set content if provided (avoid undefined with exactOptionalPropertyTypes)
  if (initialContent !== undefined) {
    editorOptions.content = initialContent;
  }

  const editor = useEditor(editorOptions);

  return (
    <div className={cn('interactive-editor', className)} style={{ minHeight }}>
      <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none" />
    </div>
  );
}
