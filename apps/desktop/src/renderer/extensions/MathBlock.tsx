/**
 * MathBlock Extension for TipTap
 *
 * Custom block node for display math (LaTeX).
 * For now, renders raw LaTeX in a styled pre element.
 * Future: integrate KaTeX or MathJax for rendering.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../lib/utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MathBlockAttrs {
  latex: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function MathBlockView({ node }: NodeViewProps) {
  const attrs = node.attrs as MathBlockAttrs;
  const { latex } = attrs;

  return (
    <NodeViewWrapper className="my-4">
      <div className={cn('rounded border bg-muted/50 p-4', 'flex flex-col items-center')}>
        <div className="text-xs text-muted-foreground mb-2 self-start">Display Math</div>
        <pre className={cn('font-mono text-sm whitespace-pre-wrap', 'text-center w-full')}>
          {latex || '(empty)'}
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true, // Not editable content inside (for now)

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
    return [{ tag: 'div[data-math-block]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-math-block': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView);
  },
});
