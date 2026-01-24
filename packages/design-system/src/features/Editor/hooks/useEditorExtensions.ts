import * as React from 'react';
import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Highlight as HighlightExtension } from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';

import type { JSONContent } from '@tiptap/core';
import { RefNode } from '../extensions/RefNode.js';
import type { RefNodeAttributes } from '../extensions/RefNode.js';
import type {
  RefSuggestionItem,
  AnySuggestionItem,
  SuggestionMode,
  HeadingSuggestionItem,
  BlockSuggestionItem,
} from '../extensions/RefSuggestion.js';
import {
  parseQueryWithAlias,
  isRefItem,
  isHeadingItem,
  isBlockItem,
} from '../extensions/RefSuggestion.js';
import { generateBlockId } from '../extensions/block-id-utils.js';
import { getSlashCommandItems, filterSlashCommands } from '../extensions/SlashCommand.js';
import type { SlashCommandItem } from '../extensions/SlashCommand.js';
import { TagNode } from '../extensions/TagNode.js';
import type { TagNodeAttributes } from '../extensions/TagNode.js';
import type { TagSuggestionItem } from '../extensions/TagSuggestionList.js';
import type { EmbedNodeAttributes } from '../extensions/EmbedNode.types.js';
import { CodeBlock } from '../extensions/CodeBlock.js';
import { Callout } from '../extensions/Callout.js';
import { TableExtensions } from '../extensions/Table.js';
import { ResizableImage } from '../extensions/ResizableImage.js';
import { InlineMath } from '../extensions/InlineMath.js';
import { MathBlock } from '../extensions/MathBlock.js';
import { BlockIdNode } from '../extensions/BlockIdNode.js';
import { EmbedNode } from '../extensions/EmbedNode.js';
import { FootnoteRefNode } from '../extensions/FootnoteRefNode.js';
import { FootnoteDefNode } from '../extensions/FootnoteDefNode.js';
import { FootnoteSeparator } from '../extensions/FootnoteSeparator.js';
import { FootnoteManager } from '../extensions/FootnoteManager.js';

// ============================================================================
// Types
// ============================================================================

export interface SlashCommandIconBundle {
  TextT: React.ComponentType<{ className?: string }>;
  TextHOne: React.ComponentType<{ className?: string }>;
  TextHTwo: React.ComponentType<{ className?: string }>;
  TextHThree: React.ComponentType<{ className?: string }>;
  ListBullets: React.ComponentType<{ className?: string }>;
  ListNumbers: React.ComponentType<{ className?: string }>;
  ListChecks: React.ComponentType<{ className?: string }>;
  Quotes: React.ComponentType<{ className?: string }>;
  Code: React.ComponentType<{ className?: string }>;
  Minus: React.ComponentType<{ className?: string }>;
  Table: React.ComponentType<{ className?: string }>;
  Info: React.ComponentType<{ className?: string }>;
  Warning: React.ComponentType<{ className?: string }>;
  Lightbulb: React.ComponentType<{ className?: string }>;
  WarningCircle: React.ComponentType<{ className?: string }>;
  MathOperations: React.ComponentType<{ className?: string }>;
  StackSimple: React.ComponentType<{ className?: string }>;
  ImageSquare: React.ComponentType<{ className?: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

export interface UseEditorExtensionsOptions {
  // Basic options
  placeholder: string;
  readOnly: boolean;

  // Feature flags
  enableRefs: boolean;
  enableEmbeds: boolean;
  enableTags: boolean;
  enableSlashCommands: boolean;

  // Ref callbacks (refs for stable callbacks) - accepts sync or async
  onRefSearchRef: React.RefObject<
    ((query: string) => RefSuggestionItem[] | Promise<RefSuggestionItem[]>) | undefined
  >;
  onRefClick: ((attrs: RefNodeAttributes) => void) | undefined;
  onHeadingSearchRef: React.RefObject<
    | ((
        objectId: string,
        query: string
      ) => HeadingSuggestionItem[] | Promise<HeadingSuggestionItem[]>)
    | undefined
  >;
  onBlockSearchRef: React.RefObject<
    | ((objectId: string, query: string) => BlockSuggestionItem[] | Promise<BlockSuggestionItem[]>)
    | undefined
  >;
  onBlockIdInsertRef: React.RefObject<
    ((objectId: string, blockKsuid: string, blockId: string) => void) | undefined
  >;

  // Tag callbacks
  onTagSearchRef: React.RefObject<
    ((query: string) => TagSuggestionItem[] | Promise<TagSuggestionItem[]>) | undefined
  >;
  onTagClick: ((attrs: TagNodeAttributes) => void) | undefined;

  // Embed callbacks
  onEmbedResolve: ((target: EmbedNodeAttributes) => Promise<JSONContent>) | undefined;
  onEmbedOpen: ((target: EmbedNodeAttributes) => void) | undefined;
  onEmbedSubscribe:
    | ((target: EmbedNodeAttributes, onUpdate: (content: JSONContent) => void) => () => void)
    | undefined;

  // Image callbacks
  handleRetryUpload: (file: File, uploadId: string | null) => void;
  handleImageRemove: (uploadId: string | null) => void;

  // Suggestion render callbacks (use AnyFunction for TipTap compatibility)
  createRefSuggestionRender: AnyFunction;
  createEmbedSuggestionRender: AnyFunction;
  createSlashCommandRender: AnyFunction;
  createTagSuggestionRender: AnyFunction;

  // State setters for mode updates
  setRefSuggestionMode: (mode: SuggestionMode) => void;
  setEmbedSuggestionMode: (mode: SuggestionMode) => void;

  // Icons bundle
  slashCommandIcons: SlashCommandIconBundle;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Builds the TipTap extensions array based on enabled features.
 *
 * This hook encapsulates:
 * - Base extensions (StarterKit, Placeholder, Link, etc.)
 * - Ref/embed suggestion extensions with mode switching
 * - Slash commands
 * - Tag suggestions
 * - Tables, code blocks, callouts, math, footnotes
 */
export function useEditorExtensions(options: UseEditorExtensionsOptions): AnyExtension[] {
  const {
    placeholder,
    readOnly,
    enableRefs,
    enableEmbeds,
    enableTags,
    enableSlashCommands,
    onRefSearchRef,
    onRefClick,
    onHeadingSearchRef,
    onBlockSearchRef,
    onBlockIdInsertRef,
    onTagSearchRef,
    onTagClick,
    onEmbedResolve,
    onEmbedOpen,
    onEmbedSubscribe,
    handleRetryUpload,
    handleImageRemove,
    createRefSuggestionRender,
    createEmbedSuggestionRender,
    createSlashCommandRender,
    createTagSuggestionRender,
    setRefSuggestionMode,
    setEmbedSuggestionMode,
    slashCommandIcons,
  } = options;

  // Memoize slash command items
  const allSlashCommands = React.useMemo(
    () => getSlashCommandItems(slashCommandIcons),
    [slashCommandIcons]
  );

  return React.useMemo(() => {
    const baseExtensions: AnyExtension[] = [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: false, // Use custom CodeBlock with syntax highlighting
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      HighlightExtension,
      ResizableImage.configure({
        onRetryUpload: handleRetryUpload,
        onRemoveImage: handleImageRemove,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlock,
      Callout,
      ...TableExtensions,
      InlineMath,
      MathBlock,
      BlockIdNode,
      EmbedNode.configure({
        onResolve: onEmbedResolve ?? null,
        onOpen: onEmbedOpen ?? null,
        onSubscribe: onEmbedSubscribe ?? null,
        maxDepth: 1,
        embedDepth: 0,
      }),
      FootnoteRefNode,
      FootnoteDefNode,
      FootnoteSeparator,
      FootnoteManager,
    ];

    // Refs: @mention and [[wiki-link]] suggestions
    if (enableRefs) {
      baseExtensions.push(
        RefNode.configure({
          onRefClick,
        })
      );

      // @ trigger suggestion
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
                if (!search) return [];
                const { objectQuery } = parseQueryWithAlias(query);
                return search(objectQuery);
              },
              command: ({ editor: ed, range, props: item }) => {
                const typedItem = item as RefSuggestionItem;
                const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                const { alias } = parseQueryWithAlias(fullQuery);
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
                        alias,
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

      // [[ trigger suggestion (supports heading/block refs)
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
                const queryLength = range.to - range.from;
                if (queryLength < 1) return false;
                try {
                  const charBefore = state.doc.textBetween(
                    range.from - 1,
                    range.from,
                    undefined,
                    '\ufffc'
                  );
                  if (charBefore === '!') return false;
                  const secondChar = state.doc.textBetween(
                    range.from + 1,
                    range.from + 2,
                    undefined,
                    '\ufffc'
                  );
                  return secondChar === '[';
                } catch {
                  return false;
                }
              },
              items: async ({ query }) => {
                const search = onRefSearchRef.current;
                if (!search) return [];
                const cleanQuery = query.startsWith('[') ? query.slice(1) : query;
                const parsed = parseQueryWithAlias(cleanQuery);

                // Heading mode: [[Object#query
                if (parsed.mode === 'heading' && onHeadingSearchRef.current) {
                  const objects = await search(parsed.objectQuery);
                  const matchedObject = objects.find(
                    (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                  );
                  if (matchedObject) {
                    setRefSuggestionMode('heading');
                    const headings = await onHeadingSearchRef.current(
                      matchedObject.objectId,
                      parsed.subQuery
                    );
                    return headings.map((h) => ({
                      ...h,
                      _parentObject: matchedObject,
                    })) as unknown as AnySuggestionItem[];
                  }
                }

                // Block mode: [[Object#^query
                if (parsed.mode === 'block' && onBlockSearchRef.current) {
                  const objects = await search(parsed.objectQuery);
                  const matchedObject = objects.find(
                    (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                  );
                  if (matchedObject) {
                    setRefSuggestionMode('block');
                    const blocks = await onBlockSearchRef.current(
                      matchedObject.objectId,
                      parsed.subQuery
                    );
                    return blocks.map((b) => ({
                      ...b,
                      _parentObject: matchedObject,
                    })) as unknown as AnySuggestionItem[];
                  }
                }

                // Default: object mode
                setRefSuggestionMode('object');
                return search(parsed.objectQuery);
              },
              command: ({ editor: ed, range, props: item }) => {
                const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                const cleanQuery = fullQuery.startsWith('[') ? fullQuery.slice(1) : fullQuery;
                const { alias } = parseQueryWithAlias(cleanQuery);

                let attrs: Record<string, unknown>;

                if (isRefItem(item)) {
                  attrs = {
                    objectId: item.objectId,
                    objectType: item.objectType,
                    displayTitle: item.title,
                    color: item.color,
                    alias,
                  };
                } else if (isHeadingItem(item)) {
                  const parentObject = (
                    item as HeadingSuggestionItem & { _parentObject?: RefSuggestionItem }
                  )._parentObject;
                  if (!parentObject) return;
                  attrs = {
                    objectId: parentObject.objectId,
                    objectType: parentObject.objectType,
                    displayTitle: parentObject.title,
                    color: parentObject.color,
                    alias,
                    headingText: item.text,
                  };
                } else if (isBlockItem(item)) {
                  const parentObject = (
                    item as BlockSuggestionItem & { _parentObject?: RefSuggestionItem }
                  )._parentObject;
                  if (!parentObject) return;

                  let blockId = item.alias;
                  if (!blockId) {
                    blockId = generateBlockId();
                    if (onBlockIdInsertRef.current) {
                      onBlockIdInsertRef.current(parentObject.objectId, item.ksuid, blockId);
                    }
                  }

                  attrs = {
                    objectId: parentObject.objectId,
                    objectType: parentObject.objectType,
                    displayTitle: parentObject.title,
                    color: parentObject.color,
                    alias,
                    blockId,
                  };
                } else {
                  return;
                }

                ed.chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent([
                    { type: 'refNode', attrs },
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

    // Embeds: ![[...]] suggestions
    if (enableEmbeds) {
      const EmbedSuggestion = Extension.create({
        name: 'embedSuggestion',
        addProseMirrorPlugins() {
          return [
            Suggestion({
              editor: this.editor,
              pluginKey: new PluginKey('embedSuggestion'),
              char: '[',
              allowSpaces: true,
              startOfLine: false,
              allow: ({ state, range }) => {
                const queryLength = range.to - range.from;
                if (queryLength < 1) return false;
                try {
                  const charBefore = state.doc.textBetween(
                    range.from - 1,
                    range.from,
                    undefined,
                    '\ufffc'
                  );
                  const secondChar = state.doc.textBetween(
                    range.from + 1,
                    range.from + 2,
                    undefined,
                    '\ufffc'
                  );
                  return charBefore === '!' && secondChar === '[';
                } catch {
                  return false;
                }
              },
              items: async ({ query }) => {
                const search = onRefSearchRef.current;
                if (!search) return [];

                const cleanQuery = query.startsWith('[') ? query.slice(1) : query;
                const parsed = parseQueryWithAlias(cleanQuery);

                if (parsed.mode === 'heading' && onHeadingSearchRef.current) {
                  const objects = await search(parsed.objectQuery);
                  const matchedObject = objects.find(
                    (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                  );
                  if (matchedObject) {
                    setEmbedSuggestionMode('heading');
                    const headings = await onHeadingSearchRef.current(
                      matchedObject.objectId,
                      parsed.subQuery
                    );
                    return headings.map((h) => ({
                      ...h,
                      _parentObject: matchedObject,
                    })) as unknown as AnySuggestionItem[];
                  }
                }

                if (parsed.mode === 'block' && onBlockSearchRef.current) {
                  const objects = await search(parsed.objectQuery);
                  const matchedObject = objects.find(
                    (o) => o.title.toLowerCase() === parsed.objectQuery.toLowerCase()
                  );
                  if (matchedObject) {
                    setEmbedSuggestionMode('block');
                    const blocks = await onBlockSearchRef.current(
                      matchedObject.objectId,
                      parsed.subQuery
                    );
                    return blocks.map((b) => ({
                      ...b,
                      _parentObject: matchedObject,
                    })) as unknown as AnySuggestionItem[];
                  }
                }

                setEmbedSuggestionMode('object');
                return search(parsed.objectQuery);
              },
              command: ({ editor: ed, range, props: item }) => {
                const fullQuery = ed.state.doc.textBetween(range.from, range.to);
                const cleanQuery = fullQuery.startsWith('[') ? fullQuery.slice(1) : fullQuery;
                const { alias } = parseQueryWithAlias(cleanQuery);

                let attrs: Record<string, unknown>;

                if (isRefItem(item)) {
                  attrs = {
                    objectId: item.objectId,
                    objectType: item.objectType,
                    displayTitle: item.title,
                    alias,
                  };
                } else if (isHeadingItem(item)) {
                  const parentObject = (
                    item as HeadingSuggestionItem & { _parentObject?: RefSuggestionItem }
                  )._parentObject;
                  if (!parentObject) return;
                  attrs = {
                    objectId: parentObject.objectId,
                    objectType: parentObject.objectType,
                    displayTitle: parentObject.title,
                    alias,
                    headingText: item.text,
                  };
                } else if (isBlockItem(item)) {
                  const parentObject = (
                    item as BlockSuggestionItem & { _parentObject?: RefSuggestionItem }
                  )._parentObject;
                  if (!parentObject) return;

                  let blockId = item.alias;
                  if (!blockId) {
                    blockId = generateBlockId();
                    if (onBlockIdInsertRef.current) {
                      onBlockIdInsertRef.current(parentObject.objectId, item.ksuid, blockId);
                    }
                  }

                  attrs = {
                    objectId: parentObject.objectId,
                    objectType: parentObject.objectType,
                    displayTitle: parentObject.title,
                    alias,
                    blockId,
                  };
                } else {
                  return;
                }

                ed.chain()
                  .focus()
                  .deleteRange(range)
                  .insertContent([{ type: 'embedNode', attrs }, { type: 'paragraph' }])
                  .run();
              },
              render: createEmbedSuggestionRender,
            }),
          ];
        },
      });

      baseExtensions.push(EmbedSuggestion);
    }

    // Slash commands
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
                return filterSlashCommands(allSlashCommands, query);
              },
              command: ({ editor: ed, range, props: item }) => {
                const typedItem = item as SlashCommandItem;
                typedItem.command(ed, range);
              },
              render: () => createSlashCommandRender(allSlashCommands, filterSlashCommands),
            }),
          ];
        },
      });

      baseExtensions.push(SlashCommandExtension);
    }

    // Tags
    if (enableTags) {
      baseExtensions.push(
        TagNode.configure({
          onTagClick,
        })
      );

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
    readOnly,
    enableRefs,
    enableEmbeds,
    enableTags,
    enableSlashCommands,
    onRefSearchRef,
    onRefClick,
    onHeadingSearchRef,
    onBlockSearchRef,
    onBlockIdInsertRef,
    onTagSearchRef,
    onTagClick,
    onEmbedResolve,
    onEmbedOpen,
    onEmbedSubscribe,
    handleRetryUpload,
    handleImageRemove,
    createRefSuggestionRender,
    createEmbedSuggestionRender,
    createSlashCommandRender,
    createTagSuggestionRender,
    setRefSuggestionMode,
    setEmbedSuggestionMode,
    allSlashCommands,
  ]);
}
