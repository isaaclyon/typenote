/**
 * TagNode Extension
 *
 * A custom TipTap Node for inline hashtags.
 * Renders as a styled pill/chip with the tag name.
 *
 * Attributes:
 * - tagId: ULID of the tag
 * - displayName: The tag name to display (without #)
 * - color: Optional hex color for styling
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TagNodeView } from './TagNodeView.js';

export interface TagNodeAttributes {
  tagId: string;
  displayName: string;
  color?: string | null;
}

export interface TagNodeOptions {
  /**
   * Called when a tag is clicked.
   * Use this to handle navigation to the tag page.
   */
  onTagClick: ((attrs: TagNodeAttributes) => void) | undefined;
  /**
   * HTML attributes to add to the rendered element.
   */
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tagNode: {
      /**
       * Insert a tag node at the current position.
       */
      insertTag: (attrs: TagNodeAttributes) => ReturnType;
    };
  }
}

export const TagNode = Node.create<TagNodeOptions>({
  name: 'tagNode',

  group: 'inline',

  inline: true,

  atom: true, // Non-editable, treated as a single unit

  addOptions() {
    return {
      onTagClick: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      tagId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-tag-id'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-tag-id': attributes['tagId'] as string,
        }),
      },
      displayName: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-display-name'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-display-name': attributes['displayName'] as string,
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
        tag: 'span[data-tag-node]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-tag-node': '',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TagNodeView);
  },

  addCommands() {
    return {
      insertTag:
        (attrs: TagNodeAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
