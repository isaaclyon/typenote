/**
 * BlockIdNode Extension
 *
 * Inline node for block identifiers (^block-id syntax).
 * Used for referencing specific blocks via [[Page#^block-id]].
 *
 * Attributes:
 * - id: The block identifier (without the ^ prefix)
 *
 * Input Rule:
 * - Type ` ^valid-id` followed by space to create a BlockIdNode
 * - ID must start with letter/underscore, contain only alphanumeric/hyphen/underscore
 */

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BlockIdNodeView } from './BlockIdNodeView.js';

export interface BlockIdAttributes {
  id: string;
}

export interface BlockIdNodeOptions {
  /**
   * HTML attributes to add to the rendered element.
   */
  HTMLAttributes: Record<string, unknown>;
  /**
   * Callback when the block ID is clicked for copying.
   * Receives the block ID. Default behavior copies to clipboard.
   */
  onCopy: ((id: string) => void) | null;
  /**
   * The current object title (for generating full references).
   */
  objectTitle: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockIdNode: {
      /**
       * Insert a block ID node at the current position.
       */
      insertBlockId: (id: string) => ReturnType;
      /**
       * Remove a block ID node if one exists in the current block.
       */
      removeBlockId: () => ReturnType;
    };
  }
}

// Regex to match ` ^id ` pattern at end of input
// ID rules: starts with letter/underscore, followed by alphanumeric/hyphen/underscore, max 64 chars
// The full match (space + caret + id + space) gets replaced; capture group 1 is just the id
const BLOCK_ID_INPUT_REGEX = /\s\^([a-zA-Z_][a-zA-Z0-9_-]{0,63})\s$/;

/**
 * Validate a block ID string.
 * - Must start with letter or underscore
 * - Can contain alphanumeric, hyphen, underscore
 * - Max 64 characters
 */
export function isValidBlockId(id: string): boolean {
  if (!id || id.length > 64) return false;
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(id);
}

/**
 * Normalize a block ID to lowercase.
 */
export function normalizeBlockId(id: string): string {
  return id.toLowerCase();
}

export const BlockIdNode = Node.create<BlockIdNodeOptions>({
  name: 'blockIdNode',

  group: 'inline',

  inline: true,

  atom: true, // Non-editable, treated as a single unit

  selectable: true,

  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
      onCopy: null,
      objectTitle: null,
    };
  },

  addAttributes() {
    return {
      id: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-block-id') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-block-id': attributes['id'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-block-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-block-id': HTMLAttributes['data-block-id'],
        class: 'block-id-node',
      }),
      `^${HTMLAttributes['data-block-id']}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockIdNodeView);
  },

  addCommands() {
    return {
      insertBlockId:
        (id: string) =>
        ({ commands }) => {
          if (!isValidBlockId(id)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { id: normalizeBlockId(id) },
          });
        },
      removeBlockId:
        () =>
        ({ state, dispatch }) => {
          // Find and remove blockIdNode in current block
          const { selection } = state;
          const { $from } = selection;

          // Get the current block
          const blockStart = $from.start();
          const blockEnd = $from.end();

          // Search for blockIdNode in this block
          let found = false;
          state.doc.nodesBetween(blockStart, blockEnd, (node, pos) => {
            if (node.type.name === this.name) {
              if (dispatch) {
                const tr = state.tr.delete(pos, pos + node.nodeSize);
                dispatch(tr);
              }
              found = true;
              return false; // Stop iteration
            }
            return true;
          });

          return found;
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: BLOCK_ID_INPUT_REGEX,
        handler: ({ range, match, chain }) => {
          const id = match[1];
          if (!id) return;

          // Replace the entire match (space + caret + id + space) with just the node + trailing space
          chain()
            .deleteRange(range)
            .insertContentAt(range.from, [
              { type: this.name, attrs: { id: normalizeBlockId(id) } },
              { type: 'text', text: ' ' },
            ])
            .run();
        },
      }),
    ];
  },
});
