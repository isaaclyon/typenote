/**
 * MathInline Extension for TipTap
 *
 * Custom inline node for inline math (LaTeX).
 * For now, renders raw LaTeX in a styled code element.
 * Future: integrate KaTeX or MathJax for rendering.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../lib/utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MathInlineAttrs {
  latex: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function MathInlineView({ node }: NodeViewProps) {
  const attrs = node.attrs as MathInlineAttrs;
  const { latex } = attrs;

  return (
    <NodeViewWrapper as="span" className="inline">
      <code
        className={cn(
          'rounded bg-muted px-1.5 py-0.5',
          'font-mono text-sm',
          'text-purple-700 dark:text-purple-300'
        )}
        title="Inline math (LaTeX)"
      >
        {latex || '?'}
      </code>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true, // Not editable content inside

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-latex') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-latex': attributes['latex'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'code[data-math-inline]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['code', mergeAttributes(HTMLAttributes, { 'data-math-inline': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView);
  },
});
