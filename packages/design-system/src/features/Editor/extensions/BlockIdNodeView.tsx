/**
 * BlockIdNodeView Component
 *
 * React component for rendering BlockIdNode in the editor.
 * Shows a styled pill with the block ID.
 * Click to copy the full reference to clipboard.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

import { cn } from '../../../lib/utils.js';

export interface BlockIdNodeViewOptions {
  onCopy: ((id: string) => void) | null;
  objectTitle: string | null;
}

export function BlockIdNodeView({ node, selected, extension }: NodeViewProps) {
  const { id } = node.attrs as { id: string };
  const options = extension.options as BlockIdNodeViewOptions;

  const [copied, setCopied] = React.useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Build the reference string
    const title = options?.objectTitle ?? 'Untitled';
    const reference = `[[${title}#^${id}]]`;

    // Use custom callback or default clipboard
    if (options?.onCopy) {
      options.onCopy(id);
    } else {
      try {
        await navigator.clipboard.writeText(reference);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className={cn(
          // Base styles
          'inline-flex items-center',
          'text-xs font-mono',
          'px-1.5 py-0.5 rounded',
          'cursor-pointer select-none',
          // Colors
          'text-muted-foreground bg-muted/50',
          'hover:bg-muted hover:text-foreground',
          // Selection ring
          selected && 'ring-1 ring-primary ring-offset-1 ring-offset-background',
          // Copied state
          copied && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        )}
        title={copied ? 'Copied!' : `Click to copy [[...#^${id}]]`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <span className="opacity-60">^</span>
        {id}
      </span>
    </NodeViewWrapper>
  );
}
