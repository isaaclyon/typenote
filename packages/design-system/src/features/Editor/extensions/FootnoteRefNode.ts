/**
 * FootnoteRefNode Extension
 *
 * Inline footnote reference node for [^key] syntax.
 */

import { Node, mergeAttributes, InputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FootnoteRefNodeView } from './FootnoteRefNodeView.js';
import { isValidFootnoteKey } from './footnote-utils.js';

export interface FootnoteRefAttributes {
  key: string;
}

export const FOOTNOTE_REF_REGEX = /\[\^([A-Za-z0-9_-]+)\]$/;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    footnoteRef: {
      /** Insert a footnote reference. */
      insertFootnoteRef: (key: string) => ReturnType;
    };
  }
}

export const FootnoteRefNode = Node.create({
  name: 'footnoteRef',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: true,

  draggable: false,

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
        tag: 'span[data-footnote-ref]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-footnote-ref': '',
      }),
      `[^${HTMLAttributes['data-footnote-key'] ?? ''}]`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteRefNodeView);
  },

  addCommands() {
    return {
      insertFootnoteRef:
        (key: string) =>
        ({ commands }) => {
          if (!isValidFootnoteKey(key)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { key },
          });
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: FOOTNOTE_REF_REGEX,
        handler: ({ range, match, chain }) => {
          const key = match[1];
          if (!key || !isValidFootnoteKey(key)) return;
          chain()
            .deleteRange(range)
            .insertContentAt(range.from, {
              type: this.name,
              attrs: { key },
            })
            .run();
        },
      }),
    ];
  },
});
