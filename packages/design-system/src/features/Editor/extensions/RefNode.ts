/**
 * RefNode Extension
 *
 * A custom TipTap Node for inline object references (wiki-links/mentions).
 * Renders as a styled inline element with the referenced object's title.
 *
 * Attributes:
 * - objectId: ULID of the referenced object
 * - objectType: Type key (Page, Person, DailyNote, etc.)
 * - displayTitle: The text to display (object title at time of reference)
 * - color: Optional hex color for styling (from object type)
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { RefNodeView } from './RefNodeView.js';

export interface RefNodeAttributes {
  objectId: string;
  objectType: string;
  displayTitle: string;
  color?: string | null;
}

export interface RefNodeOptions {
  /**
   * Called when a reference is clicked.
   * Use this to handle navigation to the referenced object.
   */
  onRefClick: ((attrs: RefNodeAttributes) => void) | undefined;
  /**
   * HTML attributes to add to the rendered element.
   */
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    refNode: {
      /**
       * Insert a reference node at the current position.
       */
      insertRef: (attrs: RefNodeAttributes) => ReturnType;
    };
  }
}

export const RefNode = Node.create<RefNodeOptions>({
  name: 'refNode',

  group: 'inline',

  inline: true,

  atom: true, // Non-editable, treated as a single unit

  addOptions() {
    return {
      onRefClick: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      objectId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-object-id'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-object-id': attributes['objectId'] as string,
        }),
      },
      objectType: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-object-type'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-object-type': attributes['objectType'] as string,
        }),
      },
      displayTitle: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-display-title'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-display-title': attributes['displayTitle'] as string,
        }),
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-color'),
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes['color']) return {};
          return { 'data-color': attributes['color'] as string };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-ref-node]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-ref-node': '',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RefNodeView);
  },

  addCommands() {
    return {
      insertRef:
        (attrs: RefNodeAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
