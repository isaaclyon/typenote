/**
 * Highlight Mark Extension for TipTap
 *
 * Simple mark extension for highlighted text, mapping to NotateDoc's 'highlight' mark.
 * Renders as a <mark> element with yellow background styling.
 */

import { Mark } from '@tiptap/core';

export const Highlight = Mark.create({
  name: 'highlight',

  parseHTML() {
    return [{ tag: 'mark' }];
  },

  renderHTML() {
    return ['mark', { class: 'bg-yellow-200 dark:bg-yellow-900/50' }, 0];
  },
});
