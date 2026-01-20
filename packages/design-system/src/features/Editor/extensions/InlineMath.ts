/**
 * InlineMath Extension
 *
 * Inline math node for LaTeX formulas rendered with KaTeX.
 * Triggered by $...$ syntax (e.g., $x^2 + y^2 = z^2$).
 *
 * Attributes:
 * - latex: The LaTeX string to render
 */

import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { InlineMathView } from './InlineMathView.js';

export interface InlineMathAttributes {
  latex: string;
}

export interface InlineMathOptions {
  /**
   * HTML attributes to add to the rendered element.
   */
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMath: {
      /**
       * Insert an inline math node at the current position.
       */
      insertInlineMath: (latex?: string) => ReturnType;
    };
  }
}

// Regex to match $...$ inline math (non-greedy, no nested $)
// Matches: $x^2$ or $\frac{1}{2}$ but not $$block$$
const INLINE_MATH_INPUT_REGEX = /(?<!\$)\$([^$]+)\$$/;

export const InlineMath = Node.create<InlineMathOptions>({
  name: 'inlineMath',

  group: 'inline',

  inline: true,

  atom: true, // Non-editable, treated as a single unit

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
        tag: 'span[data-inline-math]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-inline-math': '',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineMathView);
  },

  addCommands() {
    return {
      insertInlineMath:
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
      nodeInputRule({
        find: INLINE_MATH_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => ({
          latex: match[1] ?? '',
        }),
      }),
    ];
  },
});
