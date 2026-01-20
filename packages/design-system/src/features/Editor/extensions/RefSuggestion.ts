/**
 * RefSuggestion Extension
 *
 * Enables autocomplete for object references triggered by `[[` or `@`.
 * Supports three modes:
 * - OBJECT: Search objects by title (default)
 * - HEADING: Search headings within an object (triggered by `#`)
 * - BLOCK: Search blocks within an object (triggered by `#^`)
 *
 * State Machine:
 * ```
 * OBJECT_SEARCH
 *   ├─→ (select object) → INSERT RefNode → IDLE
 *   ├─→ (type "Object#") → HEADING_SEARCH
 *   └─→ (type "Object#^") → BLOCK_SEARCH
 *
 * HEADING_SEARCH
 *   └─→ (select heading) → INSERT RefNode with headingText → IDLE
 *
 * BLOCK_SEARCH
 *   └─→ (select block) → INSERT RefNode with blockId → IDLE
 * ```
 */

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import type { RefNodeAttributes } from './RefNode.js';
import { generateBlockId } from './block-id-utils.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Suggestion modes representing the state machine states.
 */
export type SuggestionMode = 'object' | 'heading' | 'block';

/**
 * A suggestion item representing an object that can be referenced.
 */
export interface RefSuggestionItem {
  objectId: string;
  objectType: string;
  title: string;
  color?: string | null;
}

/**
 * A suggestion item representing a heading within an object.
 */
export interface HeadingSuggestionItem {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

/**
 * A suggestion item representing a block within an object.
 */
export interface BlockSuggestionItem {
  ksuid: string;
  alias?: string | null;
  preview: string;
  blockType: string;
}

/**
 * Union type for all suggestion items across modes.
 */
export type AnySuggestionItem = RefSuggestionItem | HeadingSuggestionItem | BlockSuggestionItem;

/**
 * Type guard for RefSuggestionItem.
 */
export function isRefItem(item: AnySuggestionItem): item is RefSuggestionItem {
  return 'objectId' in item;
}

/**
 * Type guard for HeadingSuggestionItem.
 */
export function isHeadingItem(item: AnySuggestionItem): item is HeadingSuggestionItem {
  return 'level' in item && 'text' in item;
}

/**
 * Type guard for BlockSuggestionItem.
 */
export function isBlockItem(item: AnySuggestionItem): item is BlockSuggestionItem {
  return 'ksuid' in item && 'preview' in item;
}

/**
 * Parsed query structure from user input.
 */
export interface ParsedQuery {
  /** The current suggestion mode */
  mode: SuggestionMode;
  /** Object search term (always present) */
  objectQuery: string;
  /** Selected object (if mode is heading or block) */
  selectedObject: RefSuggestionItem | undefined;
  /** Heading/block search term (if in those modes) */
  subQuery: string;
  /** Alias text from pipe syntax */
  alias: string | null;
}

/**
 * Parse a query string to extract mode, search terms, and alias.
 *
 * Syntax:
 * - "Page" → OBJECT mode, search "Page"
 * - "Page#" → HEADING mode, search headings in "Page"
 * - "Page#Intro" → HEADING mode, filter to "Intro"
 * - "Page#^" → BLOCK mode, search blocks in "Page"
 * - "Page#^abc" → BLOCK mode, filter to "abc"
 * - "Page|alias" → OBJECT mode with alias
 * - "Page#Heading|alias" → HEADING mode with alias
 */
export function parseQuery(query: string): Omit<ParsedQuery, 'selectedObject'> {
  // First check for alias (pipe syntax) - only applies to final result
  let alias: string | null = null;
  let mainQuery = query;

  const pipeIndex = query.lastIndexOf('|');
  if (pipeIndex !== -1) {
    alias = query.slice(pipeIndex + 1).trim() || null;
    mainQuery = query.slice(0, pipeIndex);
  }

  // Check for heading/block mode (# syntax)
  const hashIndex = mainQuery.indexOf('#');
  if (hashIndex === -1) {
    // OBJECT mode
    return {
      mode: 'object',
      objectQuery: mainQuery.trim(),
      subQuery: '',
      alias,
    };
  }

  const objectQuery = mainQuery.slice(0, hashIndex).trim();
  const afterHash = mainQuery.slice(hashIndex + 1);

  // Check for block mode (#^)
  if (afterHash.startsWith('^')) {
    return {
      mode: 'block',
      objectQuery,
      subQuery: afterHash.slice(1).trim(),
      alias,
    };
  }

  // HEADING mode
  return {
    mode: 'heading',
    objectQuery,
    subQuery: afterHash.trim(),
    alias,
  };
}

/**
 * Options for the RefSuggestion extension.
 */
export interface RefSuggestionOptions {
  /**
   * Search function for objects (OBJECT mode).
   */
  onSearch: (query: string) => RefSuggestionItem[] | Promise<RefSuggestionItem[]>;

  /**
   * Search function for headings within an object (HEADING mode).
   * If not provided, heading mode is disabled.
   */
  onHeadingSearch:
    | ((
        objectId: string,
        query: string
      ) => HeadingSuggestionItem[] | Promise<HeadingSuggestionItem[]>)
    | null;

  /**
   * Search function for blocks within an object (BLOCK mode).
   * If not provided, block mode is disabled.
   */
  onBlockSearch:
    | ((objectId: string, query: string) => BlockSuggestionItem[] | Promise<BlockSuggestionItem[]>)
    | null;

  /**
   * Callback when a block is selected that doesn't have an alias.
   * Used to insert a BlockIdNode at the source block.
   */
  onBlockIdInsert: ((objectId: string, blockKsuid: string, newAlias: string) => void) | null;

  /**
   * Optional callback when user wants to create a new object with the query text.
   * If not provided, the "Create" option won't appear.
   */
  onCreate: ((title: string) => RefSuggestionItem | Promise<RefSuggestionItem>) | null;

  /**
   * Custom render function for the suggestion popup.
   * Required to connect to React rendering.
   */
  render: () => {
    onStart: (props: SuggestionPropsWithMode) => void;
    onUpdate: (props: SuggestionPropsWithMode) => void;
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };

  /**
   * Character to insert after the reference (default: ' ').
   */
  insertSpacer?: string;
}

/**
 * Extended SuggestionProps that includes the current mode and parsed query.
 */
export interface SuggestionPropsWithMode extends SuggestionProps<AnySuggestionItem> {
  mode: SuggestionMode;
  parsedQuery: ParsedQuery;
}

// ============================================================================
// State Management
// ============================================================================

/**
 * Shared state for the suggestion system.
 * This allows coordination between the @ and [[ triggers.
 */
interface SuggestionState {
  mode: SuggestionMode;
  selectedObject: RefSuggestionItem | undefined;
  parsedQuery: ParsedQuery;
}

let currentState: SuggestionState = {
  mode: 'object',
  selectedObject: undefined,
  parsedQuery: {
    mode: 'object',
    objectQuery: '',
    subQuery: '',
    alias: null,
    selectedObject: undefined,
  },
};

/**
 * Reset state when suggestion closes.
 */
function resetState(): void {
  currentState = {
    mode: 'object',
    selectedObject: undefined,
    parsedQuery: {
      mode: 'object',
      objectQuery: '',
      subQuery: '',
      alias: null,
      selectedObject: undefined,
    },
  };
}

/**
 * Find matching object from search results by query.
 */
async function findObjectByQuery(
  query: string,
  onSearch: RefSuggestionOptions['onSearch']
): Promise<RefSuggestionItem | undefined> {
  const results = await onSearch(query);
  // Exact match (case-insensitive)
  return results.find((r) => r.title.toLowerCase() === query.toLowerCase());
}

// ============================================================================
// Extension
// ============================================================================

export const RefSuggestion = Extension.create<RefSuggestionOptions>({
  name: 'refSuggestion',

  addOptions() {
    return {
      onSearch: () => [],
      onHeadingSearch: null,
      onBlockSearch: null,
      onBlockIdInsert: null,
      onCreate: null,
      render: () => ({
        onStart: () => {},
        onUpdate: () => {},
        onKeyDown: () => false,
        onExit: () => {},
      }),
      insertSpacer: ' ',
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    const createSuggestionConfig = (
      char: string,
      isDoubleBracket: boolean
    ): Omit<SuggestionOptions<AnySuggestionItem>, 'editor'> => ({
      char,

      // For `[[`, only trigger when there are two brackets
      ...(isDoubleBracket
        ? {
            allow: ({ state, range }: { state: unknown; range: { from: number } }) => {
              const posBeforeTrigger = range.from - 2;
              if (posBeforeTrigger < 0) return false;
              const charBeforeTrigger = (
                state as {
                  doc: {
                    textBetween: (
                      from: number,
                      to: number,
                      blockSeparator?: string,
                      leafText?: string
                    ) => string;
                  };
                }
              ).doc.textBetween(posBeforeTrigger, posBeforeTrigger + 1, undefined, '\ufffc');
              return charBeforeTrigger === '[';
            },
          }
        : {}),

      allowSpaces: true,
      startOfLine: false,

      items: async ({ query: rawQuery }) => {
        // Strip leading `[` for double bracket trigger
        const query = isDoubleBracket && rawQuery.startsWith('[') ? rawQuery.slice(1) : rawQuery;

        // Parse the query to determine mode
        const parsed = parseQuery(query);
        currentState.parsedQuery = { ...parsed, selectedObject: currentState.selectedObject };

        // Handle mode transitions
        if (parsed.mode === 'heading' || parsed.mode === 'block') {
          // Try to find the object from the object query
          if (
            !currentState.selectedObject ||
            currentState.selectedObject.title.toLowerCase() !== parsed.objectQuery.toLowerCase()
          ) {
            const foundObject = await findObjectByQuery(parsed.objectQuery, options.onSearch);
            if (foundObject) {
              currentState.selectedObject = foundObject;
              currentState.parsedQuery.selectedObject = foundObject;
            } else {
              // Object not found, stay in object mode with the full query
              currentState.mode = 'object';
              currentState.parsedQuery.mode = 'object';
              return options.onSearch(parsed.objectQuery);
            }
          }

          currentState.mode = parsed.mode;
          currentState.parsedQuery.mode = parsed.mode;
          currentState.parsedQuery.selectedObject = currentState.selectedObject;

          // Fetch heading or block results
          if (parsed.mode === 'heading' && options.onHeadingSearch) {
            return options.onHeadingSearch(currentState.selectedObject.objectId, parsed.subQuery);
          } else if (parsed.mode === 'block' && options.onBlockSearch) {
            return options.onBlockSearch(currentState.selectedObject.objectId, parsed.subQuery);
          }

          // Mode not supported, fall back to object search
          return options.onSearch(parsed.objectQuery);
        }

        // OBJECT mode
        currentState.mode = 'object';
        currentState.selectedObject = undefined;
        return options.onSearch(parsed.objectQuery);
      },

      command: ({ editor, range, props: item }) => {
        const { parsedQuery } = currentState;
        const { alias } = parsedQuery;

        let attrs: RefNodeAttributes;

        if (isRefItem(item)) {
          // Object selected in OBJECT mode
          attrs = {
            objectId: item.objectId,
            objectType: item.objectType,
            displayTitle: item.title,
            color: item.color ?? null,
            alias,
          };
        } else if (isHeadingItem(item)) {
          // Heading selected in HEADING mode
          const obj = currentState.selectedObject;
          if (!obj) return; // Should not happen in heading mode
          attrs = {
            objectId: obj.objectId,
            objectType: obj.objectType,
            displayTitle: obj.title,
            color: obj.color ?? null,
            alias,
            headingText: item.text,
          };
        } else if (isBlockItem(item)) {
          // Block selected in BLOCK mode
          const obj = currentState.selectedObject;
          if (!obj) return; // Should not happen in block mode

          // Determine block ID to use
          let blockId = item.alias;
          if (!blockId) {
            // Generate new ID and notify parent
            blockId = generateBlockId();
            if (options.onBlockIdInsert) {
              options.onBlockIdInsert(obj.objectId, item.ksuid, blockId);
            }
          }

          attrs = {
            objectId: obj.objectId,
            objectType: obj.objectType,
            displayTitle: obj.title,
            color: obj.color ?? null,
            alias,
            blockId,
          };
        } else {
          // Unknown item type, shouldn't happen
          return;
        }

        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent([
            { type: 'refNode', attrs },
            { type: 'text', text: options.insertSpacer ?? ' ' },
          ])
          .run();

        // Reset state after insertion
        resetState();
      },

      render: () => {
        const renderFns = options.render();
        return {
          onStart: (props) => {
            resetState();
            renderFns.onStart({
              ...props,
              mode: currentState.mode,
              parsedQuery: currentState.parsedQuery,
            } as SuggestionPropsWithMode);
          },
          onUpdate: (props) => {
            renderFns.onUpdate({
              ...props,
              mode: currentState.mode,
              parsedQuery: currentState.parsedQuery,
            } as SuggestionPropsWithMode);
          },
          onKeyDown: renderFns.onKeyDown,
          onExit: () => {
            renderFns.onExit();
            resetState();
          },
        };
      },
    });

    return [
      // `@` trigger (single character)
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('@', false),
      }),
      // `[[` trigger (uses `[` as char with allow() check for double bracket)
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('[', true),
      }),
    ];
  },
});

// Re-export for backward compatibility
export { parseQuery as parseQueryWithAlias };
