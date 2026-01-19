import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Sidebar as SidebarIcon } from '@phosphor-icons/react/dist/ssr/Sidebar';

import { cn } from '../../lib/utils.js';
import { Keycap } from '../../primitives/Keycap/Keycap.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';
import { useSidebarContext } from './SidebarContext.js';
import type { SidebarHeaderProps } from './types.js';

// ============================================================================
// SidebarHeader
// ============================================================================

export interface SidebarHeaderFullProps extends SidebarHeaderProps {
  /** Callback when collapse toggle is clicked */
  onCollapseToggle?: () => void;
}

function SidebarHeaderComponent({
  onSearchClick,
  searchShortcut = '⌘K',
  onNewClick,
  newLabel = 'New',
  onCollapseToggle,
  className,
}: SidebarHeaderFullProps) {
  const { collapsed } = useSidebarContext();

  // Collapsed mode: stack icon buttons vertically
  // Order: Expand toggle (top) → Search → New
  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center gap-1 px-2 py-2', className)}>
        {/* Expand toggle (topmost) */}
        <Tooltip content="Expand sidebar" side="right">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Expand sidebar"
            onClick={onCollapseToggle}
          >
            <SidebarIcon className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>

        {/* Search trigger */}
        <Tooltip content={`Search ${searchShortcut}`} side="right">
          <IconButton variant="ghost" size="sm" aria-label="Search" onClick={onSearchClick}>
            <MagnifyingGlass className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>

        {/* New action */}
        <Tooltip content={newLabel} side="right">
          <IconButton variant="ghost" size="sm" aria-label={newLabel} onClick={onNewClick}>
            <Plus className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  // Expanded mode: two rows
  // Row 1: Collapse toggle + Search trigger (competing for space)
  // Row 2: New action
  return (
    <div className={cn('flex flex-col gap-1 px-2 py-2', className)}>
      {/* Row 1: Collapse toggle + Search trigger */}
      <div className="flex items-center gap-1">
        <Tooltip content="Collapse sidebar" side="right">
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Collapse sidebar"
            onClick={onCollapseToggle}
          >
            <SidebarIcon className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>

        <button
          type="button"
          className={cn(
            'flex h-8 flex-1 items-center gap-2 rounded-md px-2',
            'text-sm text-muted-foreground',
            'transition-colors duration-150 ease-out',
            'hover:bg-muted hover:text-foreground',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring'
          )}
          onClick={onSearchClick}
        >
          <MagnifyingGlass className="h-4 w-4 shrink-0" weight="regular" />
          <span className="flex-1 text-left">Search</span>
          <Keycap size="sm">{searchShortcut}</Keycap>
        </button>
      </div>

      {/* Row 2: New action */}
      <button
        type="button"
        className={cn(
          'flex h-8 w-full items-center gap-2 rounded-md px-2',
          'text-sm text-muted-foreground',
          'transition-colors duration-150 ease-out',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring'
        )}
        onClick={onNewClick}
      >
        <Plus className="h-4 w-4 shrink-0" weight="regular" />
        <span>{newLabel}</span>
      </button>
    </div>
  );
}

SidebarHeaderComponent.displayName = 'SidebarHeader';

export const SidebarHeader = SidebarHeaderComponent;
