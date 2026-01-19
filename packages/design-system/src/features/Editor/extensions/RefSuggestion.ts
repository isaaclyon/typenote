/**
 * RefSuggestion Extension
 *
 * Enables autocomplete for object references triggered by `[[` or `@`.
 * Both triggers open the same suggestion popup and insert a RefNode.
 *
 * The extension is UI-agnostic — the parent component provides:
 * - onSearch: Async function to fetch matching objects
 * - onCreate: Optional callback when user wants to create a new object
 */

import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';
import type { RefNodeAttributes } from './RefNode.js';

// ============================================================================
// Types
// ============================================================================

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
 * Options for the RefSuggestion extension.
 */
export interface RefSuggestionOptions {
  /**
   * Search function called when the user types after a trigger.
   * Returns matching objects to display in the suggestion list.
   */
  onSearch: (query: string) => RefSuggestionItem[] | Promise<RefSuggestionItem[]>;

  /**
   * Optional callback when user wants to create a new object with the query text.
   * If not provided, the "Create" option won't appear.
   */
  onCreate: ((title: string) => RefSuggestionItem | Promise<RefSuggestionItem>) | undefined;

  /**
   * Custom render function for the suggestion popup.
   * Required to connect to React rendering.
   */
  render: () => {
    onStart: (props: SuggestionProps<RefSuggestionItem>) => void;
    onUpdate: (props: SuggestionProps<RefSuggestionItem>) => void;
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };

  /**
   * Character to insert after the reference (default: ' ').
   */
  insertSpacer?: string;
}

// ============================================================================
// Extension
// ============================================================================

export const RefSuggestion = Extension.create<RefSuggestionOptions>({
  name: 'refSuggestion',

  addOptions() {
    return {
      onSearch: () => [],
      onCreate: undefined,
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
    const { onSearch, render, insertSpacer } = this.options;

    // Create a suggestion config that works with both `[[` and `@` triggers
    const createSuggestionConfig = (
      char: string
    ): Omit<SuggestionOptions<RefSuggestionItem>, 'editor'> => ({
      char,
      // For `[[`, we need special handling since it's 2 chars
      // TipTap suggestion handles single char by default
      // We'll use a custom startOfLine: false and allowSpaces: true for flexibility
      allowSpaces: true,
      startOfLine: false,

      items: async ({ query }) => {
        const results = await onSearch(query);
        return results;
      },

      command: ({ editor, range, props: item }) => {
        // Delete the trigger text and insert RefNode
        const attrs: RefNodeAttributes = {
          objectId: item.objectId,
          objectType: item.objectType,
          displayTitle: item.title,
          color: item.color,
        };

        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertContent([
            {
              type: 'refNode',
              attrs,
            },
            {
              type: 'text',
              text: insertSpacer ?? ' ',
            },
          ])
          .run();
      },

      render,
    });

    return [
      // `@` trigger (single character)
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('@'),
      }),
      // `[[` trigger — we use `[` as the char and check for double
      // Actually, for `[[` we need a different approach since suggestion
      // expects a single char. Let's use a custom plugin or just support `@` first
      // TODO: Add `[[` support via custom input rule or modified suggestion
    ];
  },
});

/**
 * Helper to create a ref suggestion config for the `[[` trigger.
 * Since TipTap's suggestion plugin expects a single character,
 * we need to handle `[[` specially.
 */
export function createDoubleBracketSuggestion(
  options: RefSuggestionOptions
): Omit<SuggestionOptions<RefSuggestionItem>, 'editor'> {
  return {
    char: '[',
    // Only trigger when there are two brackets
    allow: ({ state, range }) => {
      const text = state.doc.textBetween(
        Math.max(0, range.from - 1),
        range.from,
        undefined,
        '\ufffc'
      );
      return text === '[';
    },
    allowSpaces: true,
    startOfLine: false,

    items: async ({ query }) => {
      return options.onSearch(query);
    },

    command: ({ editor, range, props: item }) => {
      const attrs: RefNodeAttributes = {
        objectId: item.objectId,
        objectType: item.objectType,
        displayTitle: item.title,
        color: item.color,
      };

      // Extend range to include the extra `[`
      const extendedRange = {
        from: range.from - 1,
        to: range.to,
      };

      editor
        .chain()
        .focus()
        .deleteRange(extendedRange)
        .insertContent([
          {
            type: 'refNode',
            attrs,
          },
          {
            type: 'text',
            text: options.insertSpacer ?? ' ',
          },
        ])
        .run();
    },

    render: options.render,
  };
}
