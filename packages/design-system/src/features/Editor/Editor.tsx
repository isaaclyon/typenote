import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';

import { cn } from '../../lib/utils.js';
import type { EditorProps, EditorRef } from './types.js';
import { RefNode } from './extensions/RefNode.js';
import { RefSuggestionList } from './extensions/RefSuggestionList.js';
import type { RefSuggestionItem } from './extensions/RefSuggestion.js';

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
 * Phase 2 features:
 * - RefNode: Inline object references
 * - RefSuggestion: Autocomplete via `[[` or `@` triggers
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
      // Phase 2: Refs
      enableRefs = false,
      onRefSearch,
      onRefClick,
      onRefCreate,
    },
    ref
  ) => {
    // Suggestion state
    const [suggestionState, setSuggestionState] = React.useState<{
      isOpen: boolean;
      items: RefSuggestionItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      command: ((item: RefSuggestionItem) => void) | null;
    }>({
      isOpen: false,
      items: [],
      query: '',
      selectedIndex: 0,
      position: null,
      command: null,
    });

    // Store refs in refs so they're available in extension callbacks
    const onRefSearchRef = React.useRef(onRefSearch);
    const onRefCreateRef = React.useRef(onRefCreate);
    React.useEffect(() => {
      onRefSearchRef.current = onRefSearch;
      onRefCreateRef.current = onRefCreate;
    }, [onRefSearch, onRefCreate]);

    // Create suggestion render callbacks
    const createSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<RefSuggestionItem>) => {
          const rect = props.clientRect?.();
          setSuggestionState({
            isOpen: true,
            items: props.items,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            command: props.command,
          });
        },
        onUpdate: (props: SuggestionProps<RefSuggestionItem>) => {
          const rect = props.clientRect?.();
          setSuggestionState((prev) => ({
            ...prev,
            items: props.items,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, props.items.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            command: props.command,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (event.key === 'ArrowUp') {
            setSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            setSuggestionState((prev) => {
              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Escape') {
            setSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setSuggestionState({
            isOpen: false,
            items: [],
            query: '',
            selectedIndex: 0,
            position: null,
            command: null,
          });
        },
      }),
      []
    );

    // Build extensions array - stable across renders
    const extensions = React.useMemo(() => {
      const baseExtensions: AnyExtension[] = [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4, 5, 6] },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
      ];

      if (enableRefs) {
        // Add RefNode
        baseExtensions.push(
          RefNode.configure({
            onRefClick,
          })
        );

        // Create suggestion extension for @ trigger
        const AtSuggestion = Extension.create({
          name: 'atSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                char: '@',
                allowSpaces: true,
                startOfLine: false,
                items: async ({ query }) => {
                  const search = onRefSearchRef.current;
                  return search ? search(query) : [];
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as RefSuggestionItem;
                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                      {
                        type: 'refNode',
                        attrs: {
                          objectId: typedItem.objectId,
                          objectType: typedItem.objectType,
                          displayTitle: typedItem.title,
                          color: typedItem.color,
                        },
                      },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createSuggestionRender,
              }),
            ];
          },
        });

        // Create suggestion extension for [[ trigger
        const BracketSuggestion = Extension.create({
          name: 'bracketSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                char: '[',
                allowSpaces: true,
                startOfLine: false,
                allow: ({ state, range }) => {
                  // Only trigger when there are two brackets
                  const text = state.doc.textBetween(
                    Math.max(0, range.from - 1),
                    range.from,
                    undefined,
                    '\ufffc'
                  );
                  return text === '[';
                },
                items: async ({ query }) => {
                  const search = onRefSearchRef.current;
                  return search ? search(query) : [];
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as RefSuggestionItem;
                  // Extend range to include the extra `[`
                  const extendedRange = { from: range.from - 1, to: range.to };
                  ed.chain()
                    .focus()
                    .deleteRange(extendedRange)
                    .insertContent([
                      {
                        type: 'refNode',
                        attrs: {
                          objectId: typedItem.objectId,
                          objectType: typedItem.objectType,
                          displayTitle: typedItem.title,
                          color: typedItem.color,
                        },
                      },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(AtSuggestion, BracketSuggestion);
      }

      return baseExtensions;
    }, [placeholder, enableRefs, onRefClick, createSuggestionRender]);

    const editor = useEditor({
      extensions,
      content: content ?? null,
      editable: !readOnly,
      autofocus: autoFocus,
      onUpdate: ({ editor: ed }) => {
        onChange?.(ed.getJSON());
      },
      editorProps: {
        attributes: {
          class: cn('outline-none', 'text-foreground'),
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
      if (e.target === e.currentTarget) {
        editor.commands.focus('end');
      }
    };

    // Handle suggestion item selection
    const handleRefSelect = React.useCallback(
      (item: RefSuggestionItem) => {
        if (suggestionState.command) {
          suggestionState.command(item);
        }
      },
      [suggestionState.command]
    );

    // Handle create new from suggestion
    const handleRefCreate = React.useCallback(
      async (title: string) => {
        if (!onRefCreate || !editor) return;
        const newItem = await onRefCreate(title);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'refNode',
              attrs: {
                objectId: newItem.objectId,
                objectType: newItem.objectType,
                displayTitle: newItem.title,
                color: newItem.color,
              },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
        setSuggestionState((prev) => ({ ...prev, isOpen: false }));
      },
      [onRefCreate, editor]
    );

    return (
      <div
        className={cn(
          'relative h-full min-h-[200px] w-full',
          'rounded-md border border-border bg-background',
          !readOnly && 'cursor-text',
          readOnly && 'cursor-not-allowed opacity-60',
          className
        )}
        onClick={handleContainerClick}
      >
        <EditorContent editor={editor} className="h-full w-full" />

        {/* Suggestion popup */}
        {suggestionState.isOpen && suggestionState.position && (
          <div
            className="fixed z-50"
            style={{
              top: suggestionState.position.top,
              left: suggestionState.position.left,
            }}
          >
            <RefSuggestionList
              items={suggestionState.items}
              query={suggestionState.query}
              selectedIndex={suggestionState.selectedIndex}
              onSelect={handleRefSelect}
              onCreate={onRefCreate ? handleRefCreate : undefined}
            />
          </div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export { Editor };
