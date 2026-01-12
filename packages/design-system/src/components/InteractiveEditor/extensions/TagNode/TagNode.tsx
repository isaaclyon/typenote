import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TagNodeView } from './TagNodeView.js';

export interface TagNodeAttributes {
  id: string | null;
  value: string;
  color: string | null;
}

/**
 * TagNode - TipTap Node extension for rendering tags.
 *
 * Creates inline atomic nodes that display as #tag elements
 * with optional color indicators.
 */
export const TagNode = Node.create({
  name: 'tag',
  group: 'inline',
  inline: true,
  atom: true, // Cannot be edited directly - must be selected and deleted as a whole

  addAttributes() {
    return {
      id: {
        default: null,
      },
      value: {
        default: '',
      },
      color: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-tag]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-tag': '',
        'data-id': HTMLAttributes['id'] as string,
        'data-value': HTMLAttributes['value'] as string,
        'data-color': HTMLAttributes['color'] as string | null,
      }),
      `#${HTMLAttributes['value'] as string}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TagNodeView);
  },
});
