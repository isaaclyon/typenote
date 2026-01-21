/**
 * FootnoteDefNode Extension
 *
 * Block footnote definition node for [^key]: syntax.
 */

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnoteDefNodeView } from './FootnoteDefNodeView.js';
import { isValidFootnoteKey } from './footnote-utils.js';

export interface FootnoteDefAttributes {
  key: string;
}

export const FOOTNOTE_DEF_REGEX = /^\[\^([A-Za-z0-9_-]+)\]:\s$/;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnoteDef: {
      /** Insert a footnote definition. */
      insertFootnoteDef: (key: string) => ReturnType;
    };
  }
}

export const FootnoteDefNode = Node.create({
  name: 'footnoteDef',

  group: 'block',

  content: 'inline*',

  defining: true,

  addAttributes() {
    return {
      key: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-footnote-key') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-footnote-key': attributes['key'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-footnote-def]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-footnote-def': '',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteDefNodeView);
  },

  addCommands() {
    return {
      insertFootnoteDef:
        (key: string) =>
        ({ commands }) => {
          if (!isValidFootnoteKey(key)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { key },
            content: [],
          });
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: FOOTNOTE_DEF_REGEX,
        handler: ({ range, match, chain }) => {
          const key = match[1];
          if (!key || !isValidFootnoteKey(key)) return;
          chain()
            .deleteRange(range)
            .insertContentAt(range.from, {
              type: this.name,
              attrs: { key },
              content: [],
            })
            .setTextSelection(range.from + 1)
            .run();
        },
      }),
    ];
  },
});
