import * as React from 'react';
import { useEditor, EditorContent, type UseEditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { cn } from '../../lib/utils.js';
import type { InteractiveEditorProps, InteractiveEditorRef, WikiLinkItem } from './types.js';
import { RefNode } from './extensions/RefNode.js';
import { RefSuggestion, type RefSuggestionRenderProps } from './extensions/RefSuggestion.js';
import { SuggestionPopover } from './components/SuggestionPopover.js';
import { WikiLinkMenu } from './components/WikiLinkMenu.js';

/**
 * InteractiveEditor - A TipTap-based rich text editor for the design system.
 *
 * Built on shadcn/ui patterns with support for wiki-links, slash commands,
 * and other TypeNote-specific features.
 *
 * @example
 * ```tsx
 * <InteractiveEditor
 *   initialContent={doc}
 *   onChange={handleChange}
 *   placeholder="Start typing..."
 *   enableWikiLinks
 *   wikiLinkProvider={mockWikiLinkProvider}
 * />
 * ```
 */
export const InteractiveEditor = React.forwardRef<InteractiveEditorRef, InteractiveEditorProps>(
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
      hideTitle = false,
      // Feature toggles
      enableWikiLinks = false,
      wikiLinkProvider,
      onNavigateToRef,
      onEditorReady,
    },
    ref
  ) => {
    // State for wiki-link suggestion popup
    const [suggestionState, setSuggestionState] = React.useState<RefSuggestionRenderProps | null>(
      null
    );

    // Memoize extensions to prevent useEditor from reinitializing
    // Note: Using unknown[] with type assertion due to TipTap version conflicts in monorepo.
    // Multiple versions (3.14.0, 3.15.x) have incompatible Extension types.
    // TODO: Align all TipTap packages to same version and use proper Extensions type
    const extensions = React.useMemo(() => {
      const exts: unknown[] = [
        StarterKit.configure({}),
        Placeholder.configure({
          placeholder,
          showOnlyWhenEditable: false,
        }),
      ];

      // Add wiki-link extensions if enabled
      if (enableWikiLinks && wikiLinkProvider) {
        exts.push(
          RefNode.configure({
            onNavigate: onNavigateToRef,
          })
        );
        exts.push(
          RefSuggestion.configure({
            provider: wikiLinkProvider,
            onRender: (props) => setSuggestionState(props),
            onDismiss: () => setSuggestionState(null),
          })
        );
      }

      return exts;
    }, [placeholder, enableWikiLinks, wikiLinkProvider, onNavigateToRef]);

    // Build editor options
    const editorOptions: UseEditorOptions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TipTap version conflicts
      extensions: extensions as any,
      editable,
      autofocus,
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

    // Expose editor instance via ref for auto-save integration
    React.useImperativeHandle(ref, () => ({ editor }), [editor]);

    // Notify parent when editor becomes ready
    React.useEffect(() => {
      if (editor && onEditorReady) {
        onEditorReady(editor);
      }
    }, [editor, onEditorReady]);

    return (
      <div
        className={cn('interactive-editor', hideTitle && 'hide-title', className)}
        style={{ minHeight }}
        onClick={() => {
          // Click to focus: clicking empty space focuses the editor
          if (editor && editable) {
            editor.chain().focus('end').run();
          }
        }}
      >
        <style>{`
          .interactive-editor .tiptap,
          .interactive-editor .tiptap:focus-visible,
          .interactive-editor .ProseMirror,
          .interactive-editor .ProseMirror:focus-visible {
            outline: none;
            box-shadow: none;
          }
          .interactive-editor .ProseMirror {
            min-height: inherit;
          }
          .interactive-editor .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: var(--color-muted-foreground);
            pointer-events: none;
            height: 0;
          }
          .interactive-editor .ProseMirror > * + * {
            margin-top: 0.75em;
          }
          .interactive-editor .ProseMirror h1 {
            font-size: 1.5em;
            font-weight: 600;
            margin-top: 1em;
          }
          .interactive-editor .ProseMirror h2 {
            font-size: 1.25em;
            font-weight: 600;
            margin-top: 1em;
          }
          .interactive-editor .ProseMirror h3 {
            font-size: 1.1em;
            font-weight: 600;
            margin-top: 1em;
          }
          .interactive-editor .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5em;
          }
          .interactive-editor .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5em;
          }
          .interactive-editor .ProseMirror blockquote {
            border-left: 3px solid var(--color-border);
            padding-left: 1em;
            margin-left: 0;
            color: var(--color-muted-foreground);
          }
          .interactive-editor .ProseMirror code {
            background: var(--color-muted);
            padding: 0.125em 0.25em;
            border-radius: 0.25em;
            font-size: 0.875em;
            font-family: var(--font-mono);
          }
          .interactive-editor .ProseMirror pre {
            background: var(--color-card);
            color: var(--color-card-foreground);
            padding: 0.75em 1em;
            border-radius: 0.375em;
            overflow-x: auto;
          }
          .interactive-editor .ProseMirror pre code {
            background: none;
            padding: 0;
            color: inherit;
          }
          /* Hide first heading when hideTitle is enabled (for Daily Notes) */
          .interactive-editor.hide-title .ProseMirror > h1:first-child {
            display: none;
          }
        `}</style>

        <EditorContent editor={editor} />

        {/* Wiki-link suggestion popup */}
        {suggestionState && (
          <SuggestionPopover
            open={suggestionState.isActive}
            onClose={() => setSuggestionState(null)}
            position={suggestionState.position}
          >
            <WikiLinkMenu
              items={suggestionState.items}
              query={suggestionState.query}
              onSelect={(item: WikiLinkItem) => {
                // onSelect triggers command → onExit → clears state
                suggestionState.onSelect(item);
              }}
              onCreate={async (title: string) => {
                // Await async creation before command triggers onExit
                await suggestionState.onCreate(title);
              }}
            />
          </SuggestionPopover>
        )}
      </div>
    );
  }
);

InteractiveEditor.displayName = 'InteractiveEditor';
