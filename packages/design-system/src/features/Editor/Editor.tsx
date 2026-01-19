import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

import { cn } from '../../lib/utils.js';
import type { EditorProps, EditorRef } from './types.js';

// Editor typography styles
import './editor.css';

// ============================================================================
// Editor
// ============================================================================

/**
 * Block-based rich text editor built on TipTap/ProseMirror.
 *
 * Phase 1 features:
 * - Paragraphs and headings (h1-h6)
 * - Basic marks: bold, italic, code, strikethrough
 * - Keyboard shortcuts (Cmd+B, Cmd+I, etc.)
 * - Markdown input rules (# for heading, ** for bold, etc.)
 * - Placeholder text when empty
 *
 * Content format: TipTap JSONContent (converters to NotateDoc live in app layer)
 */
const Editor = React.forwardRef<EditorRef, EditorProps>(
  (
    {
      content,
      onChange,
      placeholder = 'Start writing...',
      readOnly = false,
      autoFocus = false,
      className,
    },
    ref
  ) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Included: document, paragraph, text, heading, bold, italic,
          // strike, code, blockquote, bulletList, orderedList, listItem,
          // codeBlock, horizontalRule, hardBreak, history (undo/redo)
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content: content ?? null,
      editable: !readOnly,
      autofocus: autoFocus,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getJSON());
      },
      editorProps: {
        attributes: {
          class: cn(
            // Focus outline handled at container level
            'outline-none',
            // Typography
            'text-foreground'
            // Padding/centering handled in editor.css
          ),
        },
      },
    });

    // Expose imperative handle
    React.useImperativeHandle(
      ref,
      () => ({
        editor,
        focus: () => editor?.commands.focus(),
        clear: () => editor?.commands.clearContent(),
      }),
      [editor]
    );

    // Sync content when it changes externally (controlled mode)
    React.useEffect(() => {
      if (editor && content && !editor.isDestroyed) {
        const currentContent = editor.getJSON();
        // Only update if content actually differs to avoid cursor jumps
        if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
          editor.commands.setContent(content);
        }
      }
    }, [editor, content]);

    // Sync editable state
    React.useEffect(() => {
      if (editor && !editor.isDestroyed) {
        editor.setEditable(!readOnly);
      }
    }, [editor, readOnly]);

    // Handle clicks on empty space below content to focus at end
    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!editor || readOnly) return;

      // Only handle clicks on the container itself, not on content
      // This catches clicks in the empty space below the content
      if (e.target === e.currentTarget) {
        editor.commands.focus('end');
      }
    };

    return (
      <div
        className={cn(
          // Container fills parent and allows clicking anywhere
          'h-full min-h-[200px] w-full',
          // Border and background (border useful in stories, override with className for seamless)
          'rounded-md border border-border bg-background',
          // Cursor for clickable area
          !readOnly && 'cursor-text',
          // Disabled state
          readOnly && 'cursor-not-allowed opacity-60',
          className
        )}
        onClick={handleContainerClick}
      >
        <EditorContent editor={editor} className="h-full w-full" />
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export { Editor };
