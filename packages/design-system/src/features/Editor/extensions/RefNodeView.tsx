/**
 * RefNodeView Component
 *
 * React component for rendering RefNode in the editor.
 * Displays as a styled pill/chip with the object's title.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../../../lib/utils.js';

// Default colors for built-in types (matches design system conventions)
const TYPE_COLORS: Record<string, string> = {
  Page: '#6366F1', // Indigo
  DailyNote: '#F59E0B', // Amber
  Person: '#EC4899', // Pink
  Event: '#8B5CF6', // Violet
  Place: '#10B981', // Emerald
  Task: '#EF4444', // Red
};

export function RefNodeView({ node, extension }: NodeViewProps) {
  const { objectId, objectType, displayTitle, color } = node.attrs as {
    objectId: string;
    objectType: string;
    displayTitle: string;
    color?: string | null;
  };

  // Use provided color, fall back to type default, then to neutral
  const refColor = color ?? TYPE_COLORS[objectType] ?? '#71717A';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const onRefClick = extension.options.onRefClick as
      | ((attrs: { objectId: string; objectType: string; displayTitle: string }) => void)
      | undefined;

    if (onRefClick) {
      onRefClick({ objectId, objectType, displayTitle });
    }
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className={cn(
          // Base styles
          'inline-flex items-center gap-0.5',
          'rounded px-1 py-0.5',
          'text-sm font-medium',
          // Interactive states
          'cursor-pointer',
          'transition-colors duration-150',
          // Selection handling (TipTap adds .ProseMirror-selectednode)
          'outline-none'
        )}
        style={{
          backgroundColor: `${refColor}15`, // 15% opacity background
          color: refColor,
          // Hover handled via inline style since we need dynamic color
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = `${refColor}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = `${refColor}15`;
        }}
        data-object-id={objectId}
        data-object-type={objectType}
      >
        {displayTitle || 'Untitled'}
      </span>
    </NodeViewWrapper>
  );
}
