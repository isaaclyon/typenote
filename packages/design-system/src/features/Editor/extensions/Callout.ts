/**
 * Callout Extension
 *
 * Highlighted content blocks for drawing attention to important information.
 * Supports 4 types: info, warning, tip, error.
 *
 * Features:
 * - Color-coded backgrounds and borders
 * - Type-specific icons
 * - Full nested block support
 * - Type selector dropdown
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CalloutView } from './CalloutView.js';

// ============================================================================
// Types
// ============================================================================

export type CalloutType = 'info' | 'warning' | 'tip' | 'error';

export interface CalloutAttributes {
  calloutType: CalloutType;
}

export interface CalloutOptions {
  /** HTML attributes to add to the callout element */
  HTMLAttributes: Record<string, unknown>;
}

// ============================================================================
// Extension
// ============================================================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout node
       */
      setCallout: (attributes?: Partial<CalloutAttributes>) => ReturnType;
      /**
       * Toggle a callout node
       */
      toggleCallout: (attributes?: Partial<CalloutAttributes>) => ReturnType;
      /**
       * Update callout attributes
       */
      updateCallout: (attributes: Partial<CalloutAttributes>) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  // Allow any block content inside callouts
  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      calloutType: {
        default: 'info' as CalloutType,
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes: CalloutAttributes) => ({
          'data-callout-type': attributes.calloutType,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'callout',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
      updateCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes);
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  addKeyboardShortcuts() {
    return {
      // Enter at end of callout exits to new paragraph below
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're in a callout
        let calloutDepth: number | null = null;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === this.name) {
            calloutDepth = d;
            break;
          }
        }

        if (calloutDepth === null) return false;

        // Check if at end of callout
        const calloutNode = $from.node(calloutDepth);
        const calloutStart = $from.before(calloutDepth);
        const calloutEnd = calloutStart + calloutNode.nodeSize;
        const atEnd = $from.pos === calloutEnd - 2; // -2 for closing tags

        if (atEnd) {
          // Check if current block is empty
          const currentBlock = $from.parent;
          if (currentBlock.content.size === 0) {
            // Delete the empty block and insert paragraph after callout
            return editor
              .chain()
              .command(({ tr }) => {
                // Delete the empty paragraph
                tr.delete($from.before($from.depth), $from.after($from.depth));
                return true;
              })
              .insertContentAt(calloutEnd - 1, { type: 'paragraph' })
              .focus()
              .run();
          }
        }

        return false;
      },

      // Backspace at start of empty callout removes it
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from, empty } = selection;

        if (!empty) return false;

        // Check if we're at the start of a callout's first child
        let calloutDepth: number | null = null;
        for (let d = $from.depth; d > 0; d--) {
          if ($from.node(d).type.name === this.name) {
            calloutDepth = d;
            break;
          }
        }

        if (calloutDepth === null) return false;

        const calloutNode = $from.node(calloutDepth);
        const calloutStart = $from.before(calloutDepth);

        // Check if at very start of callout content
        const atStart = $from.pos === calloutStart + 2; // +2 for opening tags

        // Check if callout only has one empty paragraph
        if (atStart && calloutNode.content.childCount === 1) {
          const firstChild = calloutNode.content.firstChild;
          if (firstChild && firstChild.content.size === 0) {
            // Replace callout with empty paragraph
            const paragraphNode = state.schema.nodes['paragraph'];
            if (!paragraphNode) return false;
            return editor
              .chain()
              .command(({ tr }) => {
                tr.replaceWith(
                  calloutStart,
                  calloutStart + calloutNode.nodeSize,
                  paragraphNode.create()
                );
                return true;
              })
              .focus()
              .run();
          }
        }

        return false;
      },
    };
  },
});
