/**
 * RefNodeView Component
 *
 * React component for rendering RefNode in the editor.
 * Uses custom styling with pseudo-element underline for smooth hover transitions.
 */

import * as React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

// Default colors for built-in types (matches design system conventions)
const TYPE_COLORS: Record<string, string> = {
  Page: '#6366F1', // Indigo
  DailyNote: '#F59E0B', // Amber
  Person: '#EC4899', // Pink
  Event: '#8B5CF6', // Violet
  Place: '#10B981', // Emerald
  Task: '#EF4444', // Red
};

// Icons for built-in types
const TYPE_ICONS: Record<string, PhosphorIcon> = {
  Page: File,
  DailyNote: CalendarBlank,
  Person: User,
  Event: Calendar,
  Place: MapPin,
  Task: CheckSquare,
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
  const RefIcon = TYPE_ICONS[objectType] ?? File;

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
        className="ref-node inline-flex items-center gap-1 cursor-pointer"
        style={{ '--ref-color': refColor } as React.CSSProperties}
        data-object-id={objectId}
        data-object-type={objectType}
      >
        <RefIcon className="h-3.5 w-3.5 shrink-0" weight="regular" style={{ color: refColor }} />
        <span className="ref-node-text">{displayTitle || 'Untitled'}</span>
      </span>
    </NodeViewWrapper>
  );
}
