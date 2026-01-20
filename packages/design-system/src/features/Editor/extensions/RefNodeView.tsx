/**
 * RefNodeView Component
 *
 * React component for rendering RefNode in the editor.
 * Uses custom styling with pseudo-element underline for smooth hover transitions.
 * Supports alias display and context menu for editing alias.
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
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from '../../../primitives/index.js';
import { Input } from '../../../primitives/index.js';

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

// Track editing state outside React to survive TipTap remounts
const editingNodes = new Set<string>();

export function RefNodeView({ node, extension, updateAttributes }: NodeViewProps) {
  const { objectId, objectType, displayTitle, color, alias } = node.attrs as {
    objectId: string;
    objectType: string;
    displayTitle: string;
    color?: string | null;
    alias?: string | null;
  };

  // Use external Set to track editing state (survives TipTap remounts)
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);
  const isEditingAlias = editingNodes.has(objectId);
  const [aliasValue, setAliasValue] = React.useState(alias ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  // Prevent blur from firing immediately after opening edit mode
  const blurEnabledRef = React.useRef(false);

  const setIsEditingAlias = (editing: boolean) => {
    if (editing) {
      editingNodes.add(objectId);
    } else {
      editingNodes.delete(objectId);
    }
    forceUpdate();
  };

  // Focus and select input when entering edit mode
  React.useEffect(() => {
    if (isEditingAlias && inputRef.current) {
      blurEnabledRef.current = false;
      inputRef.current.focus();
      inputRef.current.select();
      // Enable blur handler after a short delay to prevent immediate firing
      const timer = setTimeout(() => {
        blurEnabledRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditingAlias]);

  // Use provided color, fall back to type default, then to neutral
  const refColor = color ?? TYPE_COLORS[objectType] ?? '#71717A';
  const RefIcon = TYPE_ICONS[objectType] ?? File;

  // Display alias if set, otherwise displayTitle
  const displayText = alias ?? displayTitle ?? 'Untitled';

  const handleClick = (e: React.MouseEvent) => {
    // Don't navigate if we're editing
    if (isEditingAlias) {
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const onRefClick = extension.options.onRefClick as
      | ((attrs: {
          objectId: string;
          objectType: string;
          displayTitle: string;
          alias?: string | null;
        }) => void)
      | undefined;

    if (onRefClick) {
      onRefClick({ objectId, objectType, displayTitle, alias: alias ?? null });
    }
  };

  const handleEditAlias = () => {
    setAliasValue(alias ?? '');
    setIsEditingAlias(true);
  };

  const handleSaveAlias = () => {
    const trimmedAlias = aliasValue.trim();
    // Empty alias = null (revert to displayTitle)
    updateAttributes({ alias: trimmedAlias || null });
    setIsEditingAlias(false);
  };

  const handleBlur = () => {
    // Only save on blur if blur is enabled (prevents immediate firing)
    if (blurEnabledRef.current) {
      handleSaveAlias();
    }
  };

  const handleCancelEdit = () => {
    setAliasValue(alias ?? '');
    setIsEditingAlias(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAlias();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // If editing, show inline input
  if (isEditingAlias) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <span
          className="ref-node inline-flex items-center gap-1"
          style={{ '--ref-color': refColor } as React.CSSProperties}
        >
          <RefIcon className="h-3.5 w-3.5 shrink-0" weight="regular" style={{ color: refColor }} />
          <Input
            ref={inputRef}
            value={aliasValue}
            onChange={(e) => setAliasValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={displayTitle || 'Custom display text'}
            size="sm"
            className="h-5 min-w-[100px] max-w-[200px] px-1 py-0 text-sm"
          />
        </span>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" className="inline">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <span
            onClick={handleClick}
            className="ref-node inline-flex items-center gap-1 cursor-pointer"
            style={{ '--ref-color': refColor } as React.CSSProperties}
            data-object-id={objectId}
            data-object-type={objectType}
          >
            <RefIcon
              className="h-3.5 w-3.5 shrink-0"
              weight="regular"
              style={{ color: refColor }}
            />
            <span className="ref-node-text">{displayText}</span>
          </span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={handleEditAlias}>
            <PencilSimple className="h-4 w-4" />
            Edit alias...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </NodeViewWrapper>
  );
}
