import * as React from 'react';
import { Sidebar as SidebarIcon } from '@phosphor-icons/react/dist/ssr/Sidebar';

import { cn } from '../../lib/utils.js';
import { Button } from '../../primitives/Button/Button.js';
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
  onNewClick,
  newLabel = 'New note',
  onCollapseToggle,
  className,
}: SidebarHeaderFullProps) {
  const { collapsed } = useSidebarContext();

  // Collapsed mode: stack icon buttons vertically
  // Order: New note (top) → Expand toggle
  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center gap-1 px-2 py-2', className)}>
        {/* New note action */}
        <Tooltip content={newLabel} side="right">
          <Button variant="secondary" size="sm" onClick={onNewClick} aria-label={newLabel}>
            +
          </Button>
        </Tooltip>

        {/* Expand toggle */}
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
      </div>
    );
  }

  // Expanded mode: single row with new note button + collapse toggle
  return (
    <div className={cn('flex items-center gap-2 px-2 py-2', className)}>
      {/* New note button */}
      <Button variant="secondary" size="sm" className="flex-1" onClick={onNewClick}>
        {newLabel}
      </Button>

      {/* Collapse toggle */}
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
    </div>
  );
}

SidebarHeaderComponent.displayName = 'SidebarHeader';

export const SidebarHeader = SidebarHeaderComponent;
