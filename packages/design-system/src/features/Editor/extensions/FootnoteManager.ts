/**
 * FootnoteManager Extension
 *
 * Ensures footnote definitions are grouped at the end of the document,
 * ordered by first reference, with a separator before them.
 */

import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Fragment } from '@tiptap/pm/model';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

import { computeFootnoteOrdering } from './footnote-utils.js';

function nodesEqual(a: ProseMirrorNode[], b: ProseMirrorNode[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!a[i].eq(b[i])) {
      return false;
    }
  }
  return true;
}

export const FootnoteManager = Extension.create({
  name: 'footnoteManager',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction: (transactions, _oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          const { doc, schema } = newState;
          const footnoteDefType = schema.nodes['footnoteDef'];
          const footnoteRefType = schema.nodes['footnoteRef'];
          const footnoteSeparatorType = schema.nodes['footnoteSeparator'];
          if (!footnoteDefType || !footnoteRefType || !footnoteSeparatorType) return null;

          const refKeys: string[] = [];
          doc.descendants((node) => {
            if (node.type === footnoteRefType) {
              const key = node.attrs['key'];
              if (typeof key === 'string' && key.length > 0) {
                refKeys.push(key);
              }
            }
            return true;
          });

          const defNodes: ProseMirrorNode[] = [];
          const defKeys: string[] = [];
          const otherNodes: ProseMirrorNode[] = [];

          for (let i = 0; i < doc.childCount; i += 1) {
            const child = doc.child(i);
            if (child.type === footnoteDefType) {
              defNodes.push(child);
              const key = child.attrs['key'];
              defKeys.push(typeof key === 'string' ? key : '');
            } else if (child.type === footnoteSeparatorType) {
              // Drop existing separators to re-insert if needed
            } else {
              otherNodes.push(child);
            }
          }

          const ordering = computeFootnoteOrdering(refKeys, defKeys);
          const orderedDefNodes = ordering.orderedDefIndices.map((index) => defNodes[index]);

          const nextNodes = orderedDefNodes.length
            ? [...otherNodes, footnoteSeparatorType.create(), ...orderedDefNodes]
            : otherNodes;

          const currentNodes: ProseMirrorNode[] = [];
          for (let i = 0; i < doc.childCount; i += 1) {
            currentNodes.push(doc.child(i));
          }

          if (nodesEqual(currentNodes, nextNodes)) return null;

          const tr = newState.tr.replaceWith(0, doc.content.size, Fragment.fromArray(nextNodes));
          tr.setMeta('addToHistory', false);
          return tr;
        },
      }),
    ];
  },
});
