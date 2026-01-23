import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { cn } from '../../lib/utils.js';
import { Button } from '../../primitives/Button/Button.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';
import { useSidebarContext } from './SidebarContext.js';
import type { SidebarHeaderProps } from './types.js';

// ============================================================================
// SidebarHeader
// ============================================================================

/**
 * Sidebar header with "New note" button and search trigger.
 *
 * In the Capacities-style layout:
 * - Expanded: [New note] + [🔍] buttons in a row
 * - Collapsed: [+] and [🔍] stacked vertically with tooltips
 *
 * Note: The collapse toggle has moved to TitleBar.
 */
function SidebarHeaderComponent({
  onNewClick,
  newLabel = 'New note',
  onSearchClick,
  className,
}: SidebarHeaderProps) {
  const { collapsed } = useSidebarContext();

  // Collapsed mode: stack icon buttons vertically
  // Order: New note (top) → Search
  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center gap-1 px-2 py-2', className)}>
        {/* New note action */}
        <Tooltip content={newLabel} side="right">
          <Button variant="secondary" size="sm" onClick={onNewClick} aria-label={newLabel}>
            +
          </Button>
        </Tooltip>

        {/* Search trigger */}
        {onSearchClick && (
          <Tooltip content="Search" side="right">
            <IconButton variant="ghost" size="sm" aria-label="Search" onClick={onSearchClick}>
              <MagnifyingGlass className="h-4 w-4" weight="regular" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    );
  }

  // Expanded mode: single row with new note button + search
  return (
    <div className={cn('flex items-center gap-2 px-2 py-2', className)}>
      {/* New note button */}
      <Button variant="secondary" size="sm" className="flex-1" onClick={onNewClick}>
        {newLabel}
      </Button>

      {/* Search trigger */}
      {onSearchClick && (
        <Tooltip content="Search ⌘K" side="bottom">
          <IconButton variant="ghost" size="sm" aria-label="Search" onClick={onSearchClick}>
            <MagnifyingGlass className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
}

SidebarHeaderComponent.displayName = 'SidebarHeader';

export const SidebarHeader = SidebarHeaderComponent;
