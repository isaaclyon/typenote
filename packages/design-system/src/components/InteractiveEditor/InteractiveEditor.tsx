import * as React from 'react';
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
import {
  CalloutNode,
  SlashCommandExtension,
  SlashCommandPopup,
  useSlashCommand,
  RefNode,
  RefSuggestionExtension,
  RefSuggestionPopup,
  useRefSuggestion,
  TagNode,
  TagSuggestionExtension,
  TagSuggestionPopup,
  useTagSuggestion,
} from './extensions/index.js';

/**
 * InteractiveEditor - A fully functional TipTap editor for design system stories.
 *
 * Provides real editing capabilities with mocked autocomplete data for
 * wiki-links, tags, and slash commands.
 */
export const InteractiveEditor = React.forwardRef<HTMLDivElement, InteractiveEditorProps>(
  (
    {
      initialContent,
      placeholder = 'Start typing...',
      onChange,
      onBlur,
      onFocus,
      editable = true,
      autofocus = false,
      className,
      minHeight = '200px',
    },
    ref
  ) => {
    const slashCommand = useSlashCommand();
    const refSuggestion = useRefSuggestion();
    const tagSuggestion = useTagSuggestion();

    // Memoize extensions to prevent useEditor from reinitializing
    const extensions = React.useMemo(
      () => [
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
        CalloutNode,
        SlashCommandExtension.configure({
          suggestion: slashCommand.suggestionOptions,
        }),
        RefNode,
        RefSuggestionExtension.configure({
          suggestion: refSuggestion.suggestionOptions,
        }),
        TagNode,
        TagSuggestionExtension.configure({
          suggestion: tagSuggestion.suggestionOptions,
        }),
      ],
      [
        placeholder,
        slashCommand.suggestionOptions,
        refSuggestion.suggestionOptions,
        tagSuggestion.suggestionOptions,
      ]
    );

    // Build options - handle exactOptionalPropertyTypes for content
    const editorOptions: UseEditorOptions = {
      extensions,
      editable,
      autofocus,
      // Note: immediatelyRender defaults to true in client-only apps
      // Only set to false for SSR
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
      <div ref={ref} className={cn('interactive-editor', className)} style={{ minHeight }}>
        <style>{`
          .interactive-editor .ProseMirror {
            outline: none;
            min-height: inherit;
          }
          .interactive-editor .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #9ca3af;
            pointer-events: none;
            height: 0;
          }
          .interactive-editor .ProseMirror > * + * {
            margin-top: 0.75em;
          }
          .interactive-editor .ProseMirror h1 { font-size: 1.5em; font-weight: 600; margin-top: 1em; }
          .interactive-editor .ProseMirror h2 { font-size: 1.25em; font-weight: 600; margin-top: 1em; }
          .interactive-editor .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin-top: 1em; }
          .interactive-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; }
          .interactive-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; }
          .interactive-editor .ProseMirror blockquote { border-left: 3px solid #e5e7eb; padding-left: 1em; margin-left: 0; color: #6b7280; }
          .interactive-editor .ProseMirror code { background: #f3f4f6; padding: 0.125em 0.25em; border-radius: 0.25em; font-size: 0.875em; }
          .interactive-editor .ProseMirror pre { background: #1f2937; color: #f9fafb; padding: 0.75em 1em; border-radius: 0.375em; overflow-x: auto; }
          .interactive-editor .ProseMirror pre code { background: none; padding: 0; color: inherit; }
        `}</style>
        <EditorContent editor={editor} className="max-w-none focus:outline-none" />
        <SlashCommandPopup
          ref={slashCommand.setMenuRef}
          isOpen={slashCommand.state.isOpen}
          items={slashCommand.state.items}
          clientRect={slashCommand.state.clientRect}
          onSelect={slashCommand.state.onSelect}
        />
        <RefSuggestionPopup
          ref={refSuggestion.setMenuRef}
          isOpen={refSuggestion.state.isOpen}
          items={refSuggestion.state.items}
          clientRect={refSuggestion.state.clientRect}
          onSelect={refSuggestion.state.onSelect}
        />
        <TagSuggestionPopup
          ref={tagSuggestion.setMenuRef}
          isOpen={tagSuggestion.state.isOpen}
          items={tagSuggestion.state.items}
          clientRect={tagSuggestion.state.clientRect}
          onSelect={tagSuggestion.state.onSelect}
        />
      </div>
    );
  }
);

InteractiveEditor.displayName = 'InteractiveEditor';
