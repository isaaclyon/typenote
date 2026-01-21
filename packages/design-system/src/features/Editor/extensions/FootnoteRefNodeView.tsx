/**
 * FootnoteRefNodeView Component
 *
 * Renders inline footnote references as styled text.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils.js';

export function FootnoteRefNodeView({ node, editor }: NodeViewProps) {
  const { key } = node.attrs as { key: string };

  let hasDefinition = false;
  if (editor) {
    editor.state.doc.descendants((child) => {
      if (child.type.name === 'footnoteDef' && child.attrs['key'] === key) {
        hasDefinition = true;
        return false;
      }
      return true;
    });
  }

  const isMissing = !hasDefinition;

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'footnote-ref inline-flex items-center font-mono text-xs',
          'px-1 py-0.5 rounded',
          'bg-muted/40 text-muted-foreground',
          'border border-transparent',
          isMissing && 'border-amber-300 text-amber-700 bg-amber-50'
        )}
        data-footnote-key={key}
        title={isMissing ? `Missing definition for ${key}` : `Footnote ${key}`}
      >
        [^{key}]
      </span>
    </NodeViewWrapper>
  );
}

FootnoteRefNodeView.displayName = 'FootnoteRefNodeView';
