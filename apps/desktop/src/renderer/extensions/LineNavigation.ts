/**
 * LineNavigation Extension
 *
 * Overrides Home/End key behavior to navigate within the current line
 * instead of the entire document.
 */

import { Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export const LineNavigation = Extension.create({
  name: 'lineNavigation',

  addKeyboardShortcuts() {
    return {
      Home: () => {
        // Move cursor to start of current line
        const { state, view } = this.editor;
        const { $from } = state.selection;

        // Get the position at the start of the current text block
        const start = $from.start();

        // Set selection to start of line
        const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(start)));
        view.dispatch(tr);
        return true;
      },

      'Shift-Home': () => {
        // Select from cursor to start of current line
        const { state, view } = this.editor;
        const { $from, $to } = state.selection;

        // Get the position at the start of the current text block
        const start = $from.start();

        // Create a text selection from start of line to current position
        const tr = state.tr.setSelection(TextSelection.create(state.doc, start, $to.pos));
        view.dispatch(tr);
        return true;
      },

      End: () => {
        // Move cursor to end of current line
        const { state, view } = this.editor;
        const { $from } = state.selection;

        // Get the position at the end of the current text block
        const end = $from.end();

        // Set selection to end of line
        const tr = state.tr.setSelection(TextSelection.near(state.doc.resolve(end)));
        view.dispatch(tr);
        return true;
      },

      'Shift-End': () => {
        // Select from cursor to end of current line
        const { state, view } = this.editor;
        const { $from, $to } = state.selection;

        // Get the position at the end of the current text block
        const end = $to.end();

        // Create a text selection from current position to end of line
        const tr = state.tr.setSelection(TextSelection.create(state.doc, $from.pos, end));
        view.dispatch(tr);
        return true;
      },
    };
  },
});
