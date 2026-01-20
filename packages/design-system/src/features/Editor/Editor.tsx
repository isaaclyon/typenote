import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { AnyExtension, Range } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';

// Phosphor icons for slash commands
import { TextT } from '@phosphor-icons/react/dist/ssr/TextT';
import { TextHOne } from '@phosphor-icons/react/dist/ssr/TextHOne';
import { TextHTwo } from '@phosphor-icons/react/dist/ssr/TextHTwo';
import { TextHThree } from '@phosphor-icons/react/dist/ssr/TextHThree';
import { ListBullets } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { ListNumbers } from '@phosphor-icons/react/dist/ssr/ListNumbers';
import { ListChecks } from '@phosphor-icons/react/dist/ssr/ListChecks';
import { Quotes } from '@phosphor-icons/react/dist/ssr/Quotes';
import { Code } from '@phosphor-icons/react/dist/ssr/Code';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { Table } from '@phosphor-icons/react/dist/ssr/Table';
// Callout icons
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle';

import { cn } from '../../lib/utils.js';
import type { EditorProps, EditorRef } from './types.js';
import { RefNode } from './extensions/RefNode.js';
import { RefSuggestionList } from './extensions/RefSuggestionList.js';
import type { RefSuggestionItem } from './extensions/RefSuggestion.js';
import { getSlashCommandItems, filterSlashCommands } from './extensions/SlashCommand.js';
import type { SlashCommandItem } from './extensions/SlashCommand.js';
import { SlashCommandList } from './extensions/SlashCommandList.js';
import { TagNode } from './extensions/TagNode.js';
import { TagSuggestionList } from './extensions/TagSuggestionList.js';
import type { TagSuggestionItem } from './extensions/TagSuggestionList.js';
import { CodeBlock } from './extensions/CodeBlock.js';
import { Callout } from './extensions/Callout.js';
import { TableExtensions } from './extensions/Table.js';

// Editor typography styles
import './editor.css';

// Slash command icons bundle
const slashCommandIcons = {
  TextT,
  TextHOne,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  ListChecks,
  Quotes,
  Code,
  Minus,
  Table,
  // Callout icons
  Info,
  Warning,
  Lightbulb,
  WarningCircle,
};

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
      // Phase 2: Slash Commands
      enableSlashCommands = true,
      // Phase 2: Refs
      enableRefs = false,
      onRefSearch,
      onRefClick,
      onRefCreate,
      // Phase 2b: Tags
      enableTags = false,
      onTagSearch,
      onTagCreate,
      onTagClick,
    },
    ref
  ) => {
    // Ref suggestion state
    const [refSuggestionState, setRefSuggestionState] = React.useState<{
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

    // Slash command state
    const [slashCommandState, setSlashCommandState] = React.useState<{
      isOpen: boolean;
      items: SlashCommandItem[];
      filteredItems: SlashCommandItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      range: Range | null;
    }>({
      isOpen: false,
      items: [],
      filteredItems: [],
      query: '',
      selectedIndex: 0,
      position: null,
      range: null,
    });

    // Tag suggestion state
    const [tagSuggestionState, setTagSuggestionState] = React.useState<{
      isOpen: boolean;
      items: TagSuggestionItem[];
      query: string;
      selectedIndex: number;
      position: { top: number; left: number } | null;
      command: ((item: TagSuggestionItem) => void) | null;
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

    // Store tag callbacks in refs
    const onTagSearchRef = React.useRef(onTagSearch);
    const onTagCreateRef = React.useRef(onTagCreate);
    React.useEffect(() => {
      onTagSearchRef.current = onTagSearch;
      onTagCreateRef.current = onTagCreate;
    }, [onTagSearch, onTagCreate]);

    // Create ref suggestion render callbacks
    const createRefSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<RefSuggestionItem>) => {
          const rect = props.clientRect?.();
          setRefSuggestionState({
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
          setRefSuggestionState((prev) => ({
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
            setRefSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setRefSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            setRefSuggestionState((prev) => {
              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Escape') {
            setRefSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setRefSuggestionState({
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

    // Create slash command render callbacks
    const allSlashCommands = React.useMemo(() => getSlashCommandItems(slashCommandIcons), []);

    const createSlashCommandRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
          const rect = props.clientRect?.();
          const filtered = filterSlashCommands(allSlashCommands, props.query);
          setSlashCommandState({
            isOpen: true,
            items: allSlashCommands,
            filteredItems: filtered,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            range: props.range,
          });
        },
        onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
          const rect = props.clientRect?.();
          const filtered = filterSlashCommands(allSlashCommands, props.query);
          setSlashCommandState((prev) => ({
            ...prev,
            filteredItems: filtered,
            query: props.query,
            selectedIndex: Math.min(prev.selectedIndex, Math.max(0, filtered.length - 1)),
            position: rect ? { top: rect.bottom + 4, left: rect.left } : prev.position,
            range: props.range,
          }));
        },
        onKeyDown: ({ event }: { event: KeyboardEvent }) => {
          if (event.key === 'ArrowUp') {
            setSlashCommandState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.filteredItems.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setSlashCommandState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.filteredItems.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            // Execute command is handled by handleSlashCommandSelect
            return true;
          }
          if (event.key === 'Escape') {
            setSlashCommandState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setSlashCommandState({
            isOpen: false,
            items: [],
            filteredItems: [],
            query: '',
            selectedIndex: 0,
            position: null,
            range: null,
          });
        },
      }),
      [allSlashCommands]
    );

    // Create tag suggestion render callbacks
    const createTagSuggestionRender = React.useCallback(
      () => ({
        onStart: (props: SuggestionProps<TagSuggestionItem>) => {
          const rect = props.clientRect?.();
          setTagSuggestionState({
            isOpen: true,
            items: props.items,
            query: props.query,
            selectedIndex: 0,
            position: rect ? { top: rect.bottom + 4, left: rect.left } : null,
            command: props.command,
          });
        },
        onUpdate: (props: SuggestionProps<TagSuggestionItem>) => {
          const rect = props.clientRect?.();
          setTagSuggestionState((prev) => ({
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
            setTagSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex <= 0 ? prev.items.length - 1 : prev.selectedIndex - 1,
            }));
            return true;
          }
          if (event.key === 'ArrowDown') {
            setTagSuggestionState((prev) => ({
              ...prev,
              selectedIndex:
                prev.selectedIndex >= prev.items.length - 1 ? 0 : prev.selectedIndex + 1,
            }));
            return true;
          }
          if (event.key === 'Enter') {
            setTagSuggestionState((prev) => {
              const item = prev.items[prev.selectedIndex];
              if (item && prev.command) {
                prev.command(item);
              }
              return { ...prev, isOpen: false };
            });
            return true;
          }
          if (event.key === 'Escape') {
            setTagSuggestionState((prev) => ({ ...prev, isOpen: false }));
            return true;
          }
          return false;
        },
        onExit: () => {
          setTagSuggestionState({
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
          // Disable built-in code block - we use our custom one with syntax highlighting
          codeBlock: false,
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        // Task lists (not included in StarterKit)
        TaskList,
        TaskItem.configure({
          nested: true, // Allow nesting task items
        }),
        // Custom code block with Shiki syntax highlighting
        CodeBlock,
        // Callout blocks
        Callout,
        // Tables
        ...TableExtensions,
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
                pluginKey: new PluginKey('atSuggestion'),
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
                render: createRefSuggestionRender,
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
                pluginKey: new PluginKey('bracketSuggestion'),
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
                render: createRefSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(AtSuggestion, BracketSuggestion);
      }

      // Slash commands (when enabled and not readOnly)
      if (enableSlashCommands && !readOnly) {
        const SlashCommandExtension = Extension.create({
          name: 'slashCommand',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('slashCommand'),
                char: '/',
                allowSpaces: false,
                startOfLine: true,
                items: ({ query }) => {
                  // Return filtered items for the suggestion plugin
                  return filterSlashCommands(allSlashCommands, query);
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as SlashCommandItem;
                  typedItem.command(ed, range);
                },
                render: createSlashCommandRender,
              }),
            ];
          },
        });

        baseExtensions.push(SlashCommandExtension);
      }

      // Tags (when enabled)
      if (enableTags) {
        // Add TagNode
        baseExtensions.push(
          TagNode.configure({
            onTagClick,
          })
        );

        // Create suggestion extension for # trigger
        const HashtagSuggestion = Extension.create({
          name: 'hashtagSuggestion',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                editor: this.editor,
                pluginKey: new PluginKey('hashtagSuggestion'),
                char: '#',
                allowSpaces: false,
                startOfLine: false,
                items: async ({ query }) => {
                  const search = onTagSearchRef.current;
                  return search ? search(query) : [];
                },
                command: ({ editor: ed, range, props: item }) => {
                  const typedItem = item as TagSuggestionItem;
                  ed.chain()
                    .focus()
                    .deleteRange(range)
                    .insertContent([
                      {
                        type: 'tagNode',
                        attrs: {
                          tagId: typedItem.tagId,
                          displayName: typedItem.name,
                          color: typedItem.color,
                        },
                      },
                      { type: 'text', text: ' ' },
                    ])
                    .run();
                },
                render: createTagSuggestionRender,
              }),
            ];
          },
        });

        baseExtensions.push(HashtagSuggestion);
      }

      return baseExtensions;
    }, [
      placeholder,
      enableRefs,
      onRefClick,
      createRefSuggestionRender,
      enableSlashCommands,
      readOnly,
      allSlashCommands,
      createSlashCommandRender,
      enableTags,
      onTagClick,
      createTagSuggestionRender,
    ]);

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

    // Handle ref suggestion item selection
    const handleRefSelect = React.useCallback(
      (item: RefSuggestionItem) => {
        if (refSuggestionState.command) {
          refSuggestionState.command(item);
        }
      },
      [refSuggestionState.command]
    );

    // Handle create new from ref suggestion
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
        setRefSuggestionState((prev) => ({ ...prev, isOpen: false }));
      },
      [onRefCreate, editor]
    );

    // Handle slash command selection
    const handleSlashCommandSelect = React.useCallback(
      (item: SlashCommandItem) => {
        if (editor && slashCommandState.range) {
          item.command(editor, slashCommandState.range);
          setSlashCommandState((prev) => ({ ...prev, isOpen: false }));
        }
      },
      [editor, slashCommandState.range]
    );

    // Handle tag suggestion item selection
    const handleTagSelect = React.useCallback(
      (item: TagSuggestionItem) => {
        if (tagSuggestionState.command) {
          tagSuggestionState.command(item);
        }
      },
      [tagSuggestionState.command]
    );

    // Handle create new from tag suggestion
    const handleTagCreate = React.useCallback(
      async (name: string) => {
        if (!onTagCreate || !editor) return;
        const newItem = await onTagCreate(name);
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'tagNode',
              attrs: {
                tagId: newItem.tagId,
                displayName: newItem.name,
                color: newItem.color,
              },
            },
            { type: 'text', text: ' ' },
          ])
          .run();
        setTagSuggestionState((prev) => ({ ...prev, isOpen: false }));
      },
      [onTagCreate, editor]
    );

    // Handle Enter key for slash commands (since TipTap suggestion handles navigation but not selection)
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (slashCommandState.isOpen && e.key === 'Enter') {
          e.preventDefault();
          const item = slashCommandState.filteredItems[slashCommandState.selectedIndex];
          if (item) {
            handleSlashCommandSelect(item);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown, true);
      return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [
      slashCommandState.isOpen,
      slashCommandState.filteredItems,
      slashCommandState.selectedIndex,
      handleSlashCommandSelect,
    ]);

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

        {/* Ref suggestion popup */}
        {refSuggestionState.isOpen && refSuggestionState.position && (
          <div
            className="fixed z-50"
            style={{
              top: refSuggestionState.position.top,
              left: refSuggestionState.position.left,
            }}
          >
            <RefSuggestionList
              items={refSuggestionState.items}
              query={refSuggestionState.query}
              selectedIndex={refSuggestionState.selectedIndex}
              onSelect={handleRefSelect}
              onCreate={onRefCreate ? handleRefCreate : undefined}
            />
          </div>
        )}

        {/* Slash command popup */}
        {slashCommandState.isOpen && slashCommandState.position && (
          <div
            className="fixed z-50"
            style={{
              top: slashCommandState.position.top,
              left: slashCommandState.position.left,
            }}
          >
            <SlashCommandList
              items={slashCommandState.filteredItems}
              selectedIndex={slashCommandState.selectedIndex}
              onSelect={handleSlashCommandSelect}
            />
          </div>
        )}

        {/* Tag suggestion popup */}
        {tagSuggestionState.isOpen && tagSuggestionState.position && (
          <div
            className="fixed z-50"
            style={{
              top: tagSuggestionState.position.top,
              left: tagSuggestionState.position.left,
            }}
          >
            <TagSuggestionList
              items={tagSuggestionState.items}
              query={tagSuggestionState.query}
              selectedIndex={tagSuggestionState.selectedIndex}
              onSelect={handleTagSelect}
              onCreate={onTagCreate ? handleTagCreate : undefined}
            />
          </div>
        )}
      </div>
    );
  }
);

Editor.displayName = 'Editor';

export { Editor };
