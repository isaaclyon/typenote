/**
 * RefNode Extension for TipTap
 *
 * Custom inline node for object/block references (Capacities-style wiki-links).
 * Renders as a styled inline element with icon and type-based coloring.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Link2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface RefTarget {
  kind: 'object' | 'block';
  objectId: string;
  blockId?: string;
}

interface RefNodeAttrs {
  mode: 'link' | 'embed';
  target: RefTarget | null;
  alias: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function RefNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as RefNodeAttrs;
  const { mode, target, alias } = attrs;

  // Display text: alias if provided, otherwise objectId (truncated), or placeholder
  const displayText = alias ?? target?.objectId.slice(0, 8) ?? 'Unknown';

  // Embed mode renders differently (slightly different styling)
  const isEmbed = mode === 'embed';

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-sm',
          'cursor-pointer transition-colors',
          isEmbed
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
        )}
        title={
          target
            ? `${target.kind}: ${target.objectId}${target.blockId ? `#${target.blockId}` : ''}`
            : undefined
        }
      >
        <Link2 className="h-3 w-3 shrink-0" />
        <span className="truncate max-w-[200px]">{displayText}</span>
      </span>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const RefNode = Node.create({
  name: 'ref',
  group: 'inline',
  inline: true,
  atom: true, // Not editable content inside

  addAttributes() {
    return {
      mode: {
        default: 'link',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-mode') ?? 'link',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-mode': attributes['mode'] as string,
        }),
      },
      target: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const targetStr = element.getAttribute('data-target');
          if (!targetStr) return null;
          try {
            return JSON.parse(targetStr) as RefTarget;
          } catch {
            return null;
          }
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-target': attributes['target'] ? JSON.stringify(attributes['target']) : undefined,
        }),
      },
      alias: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-alias'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-alias': attributes['alias'] as string | undefined,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-ref]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-ref': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RefNodeView);
  },
});
