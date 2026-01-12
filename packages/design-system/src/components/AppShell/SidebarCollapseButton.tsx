import * as React from 'react';
import { PanelLeft, PanelLeftClose, PanelRight, PanelRightClose } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { SidebarCollapseButtonProps } from './types.js';

/**
 * Collapse button with hover-reveal behavior.
 *
 * Hidden by default, visible on sidebar hover for a calm interface.
 * Always visible when collapsed (user needs to be able to expand).
 *
 * Uses sidebar panel icons that indicate the action:
 * - Expanded: PanelLeftClose/PanelRightClose (click to close)
 * - Collapsed: PanelLeft/PanelRight (click to open)
 */
const SidebarCollapseButton = React.forwardRef<HTMLButtonElement, SidebarCollapseButtonProps>(
  ({ collapsed, onClick, side, className }, ref) => {
    // Icon shows the action: close icon when expanded, open icon when collapsed
    const Icon =
      side === 'left'
        ? collapsed
          ? PanelLeft
          : PanelLeftClose
        : collapsed
          ? PanelRight
          : PanelRightClose;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          // Base styles
          'flex items-center justify-center',
          'w-7 h-7 rounded',
          // Subtle appearance
          'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          // Hover-reveal: hidden by default, visible on sidebar hover
          // Always visible when collapsed (user needs to expand)
          collapsed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-150',
          // Focus styles (consistent with codebase pattern)
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Positioning: inside sidebar at top corner, centered when collapsed
          'absolute top-2 z-10',
          collapsed
            ? 'left-1/2 -translate-x-1/2' // Centered in collapsed rail
            : side === 'left'
              ? 'right-2'
              : 'left-2',
          className
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }
);

SidebarCollapseButton.displayName = 'SidebarCollapseButton';

export { SidebarCollapseButton };
