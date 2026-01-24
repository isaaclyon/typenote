import * as React from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';

import { cn } from '../../lib/utils.js';
import { Button } from '../../primitives/Button/Button.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Keycap } from '../../primitives/Keycap/Keycap.js';
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
 * - Expanded: Search + New note full-width buttons stacked vertically
 * - Collapsed: [🔍] and [+] stacked vertically with tooltips
 *
 * Note: The collapse toggle has moved to TitleBar.
 */
function SidebarHeaderComponent({
  onNewClick,
  newLabel = 'New note',
  newDisabled = false,
  newLoading = false,
  onSearchClick,
  searchShortcut,
  className,
}: SidebarHeaderProps) {
  const { collapsed } = useSidebarContext();
  const resolveSearchShortcut = React.useCallback((value?: string) => {
    if (value !== undefined) {
      return value;
    }

    if (typeof navigator === 'undefined') {
      return 'Ctrl+K';
    }

    return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
  }, []);

  const resolvedSearchShortcut = resolveSearchShortcut(searchShortcut);
  const showShortcut = Boolean(resolvedSearchShortcut);

  // Collapsed mode: stack icon buttons vertically
  // Order: Search (top) → New note
  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center gap-1 px-2 py-2', className)}>
        {/* Search trigger */}
        {onSearchClick && (
          <Tooltip content="Search" side="right">
            <IconButton variant="ghost" size="sm" aria-label="Search" onClick={onSearchClick}>
              <MagnifyingGlass className="h-4 w-4" weight="regular" />
            </IconButton>
          </Tooltip>
        )}

        {/* New note action */}
        <Tooltip content={newLabel} side="right">
          <IconButton
            variant="secondary"
            size="sm"
            aria-label={newLabel}
            onClick={onNewClick}
            disabled={newDisabled || newLoading}
          >
            <Plus className="h-4 w-4" weight="regular" />
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  // Expanded mode: full-width buttons stacked vertically
  return (
    <div className={cn('flex flex-col gap-1 px-2 py-2', className)}>
      {onSearchClick && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          className="justify-between border border-border/40 bg-transparent text-muted-foreground hover:text-foreground"
          onClick={onSearchClick}
        >
          <span className="flex items-center gap-2">
            <MagnifyingGlass className="h-4 w-4" weight="regular" />
            <span>Search</span>
          </span>
          {showShortcut && (
            <Keycap size="xs" className="text-muted-foreground">
              {resolvedSearchShortcut}
            </Keycap>
          )}
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        fullWidth
        className="justify-start bg-transparent"
        onClick={onNewClick}
        disabled={newDisabled}
        loading={newLoading}
      >
        <Plus className="h-4 w-4" weight="regular" />
        <span>{newLabel}</span>
      </Button>
    </div>
  );
}

SidebarHeaderComponent.displayName = 'SidebarHeader';

export const SidebarHeader = SidebarHeaderComponent;
