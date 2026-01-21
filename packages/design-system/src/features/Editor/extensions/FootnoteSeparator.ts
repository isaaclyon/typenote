/**
 * FootnoteSeparator Extension
 *
 * Custom horizontal rule used to separate footnote definitions.
 */

import { Node, mergeAttributes } from '@tiptap/core';

export const FootnoteSeparator = Node.create({
  name: 'footnoteSeparator',

  group: 'block',

  atom: true,

  selectable: false,

  draggable: false,

  parseHTML() {
    return [
      {
        tag: 'hr[data-footnote-separator]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'hr',
      mergeAttributes(HTMLAttributes, {
        'data-footnote-separator': '',
      }),
    ];
  },
});
