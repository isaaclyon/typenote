/**
 * TagNode Extension for TipTap
 *
 * Custom inline node for hashtags like #project or #important.
 * Renders as a styled badge element.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Hash } from 'lucide-react';
import { cn } from '../lib/utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TagNodeAttrs {
  value: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function TagNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as TagNodeAttrs;
  const { value } = attrs;

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-sm',
          'bg-secondary text-secondary-foreground',
          'cursor-pointer transition-colors hover:bg-secondary/80'
        )}
      >
        <Hash className="h-3 w-3 shrink-0" />
        <span>{value}</span>
      </span>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const TagNode = Node.create({
  name: 'tag',
  group: 'inline',
  inline: true,
  atom: true, // Not editable content inside

  addAttributes() {
    return {
      value: {
        default: '',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-value') ?? '',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-value': attributes['value'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-tag]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-tag': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TagNodeView);
  },
});
