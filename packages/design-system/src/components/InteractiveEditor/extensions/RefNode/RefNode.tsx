import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { RefNodeView } from './RefNodeView.js';

export interface RefNodeAttributes {
  id: string | null;
  label: string;
  type: 'note' | 'project' | 'task' | 'person' | 'resource';
}

/**
 * RefNode - TipTap Node extension for rendering wiki-link references.
 *
 * Creates inline atomic nodes that display as [[reference]] links
 * with type-specific icons and colors.
 */
export const RefNode = Node.create({
  name: 'ref',
  group: 'inline',
  inline: true,
  atom: true, // Cannot be edited directly - must be selected and deleted as a whole

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: '',
      },
      type: {
        default: 'note',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-ref]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-ref': '',
        'data-id': HTMLAttributes['id'] as string,
        'data-type': HTMLAttributes['type'] as string,
      }),
      HTMLAttributes['label'] as string,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RefNodeView);
  },
});
