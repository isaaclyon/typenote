/**
 * TagNodeView Component
 *
 * React component for rendering TagNode in the editor.
 * Displays as a small inline pill/chip with the tag name.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

// Default tag color when none specified
const DEFAULT_TAG_COLOR = '#71717A'; // Neutral gray

export function TagNodeView({ node, extension }: NodeViewProps) {
  const { tagId, displayName, color } = node.attrs as {
    tagId: string;
    displayName: string;
    color?: string | null;
  };

  const tagColor = color ?? DEFAULT_TAG_COLOR;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const onTagClick = extension.options.onTagClick as
      | ((attrs: { tagId: string; displayName: string; color?: string | null }) => void)
      | undefined;

    if (onTagClick) {
      onTagClick({ tagId, displayName, color: color ?? null });
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className="tag-node inline-flex cursor-pointer"
        style={
          {
            '--tag-color': tagColor,
          } as React.CSSProperties
        }
        data-tag-id={tagId}
      >
        <span className="tag-node-pill">#{displayName || 'untitled'}</span>
      </span>
    </NodeViewWrapper>
  );
}
