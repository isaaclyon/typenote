/**
 * MathBlock Extension
 *
 * Block-level math node for display equations rendered with KaTeX.
 * Triggered by $$ on its own line or /math slash command.
 *
 * Attributes:
 * - latex: The LaTeX string to render
 */

import { Node, mergeAttributes, textblockTypeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathBlockView } from './MathBlockView.js';

export interface MathBlockAttributes {
  latex: string;
}

export interface MathBlockOptions {
  /**
   * HTML attributes to add to the rendered element.
   */
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathBlock: {
      /**
       * Insert a math block at the current position.
       */
      insertMathBlock: (latex?: string) => ReturnType;
    };
  }
}

// Regex to match $$ at start of line (triggers math block)
const MATH_BLOCK_INPUT_REGEX = /^\$\$\s$/;

export const MathBlock = Node.create<MathBlockOptions>({
  name: 'mathBlock',

  group: 'block',

  content: 'text*',

  marks: '',

  defining: true,

  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-latex': attributes['latex'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-math-block': '',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },

  addCommands() {
    return {
      insertMathBlock:
        (latex = '') =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { latex },
          });
        },
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: MATH_BLOCK_INPUT_REGEX,
        type: this.type,
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Backspace at start of empty math block should convert to paragraph
      Backspace: () => {
        const { editor } = this;
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're in a math block
        if ($from.parent.type.name !== this.name) {
          return false;
        }

        // Check if at start of block and block is empty
        const isAtStart = $from.parentOffset === 0;
        const isEmpty = $from.parent.textContent === '';

        if (isAtStart && isEmpty) {
          return editor.commands.setNode('paragraph');
        }

        return false;
      },
    };
  },
});
