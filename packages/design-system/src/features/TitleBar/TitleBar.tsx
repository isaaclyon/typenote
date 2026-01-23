import * as React from 'react';
import { SidebarSimple as SidebarIcon } from '@phosphor-icons/react/dist/ssr/SidebarSimple';

import { cn } from '../../lib/utils.js';
import { Breadcrumbs, type BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';

// ============================================================================
// Types
// ============================================================================

export interface TitleBarProps {
  /** Whether the sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar collapse toggle is clicked */
  onSidebarCollapseToggle?: () => void;
  /** Breadcrumb items for navigation path (centered) */
  breadcrumbs?: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
  /** Children to render in the title bar (use sparingly - for platform-specific elements) */
  children?: React.ReactNode;
}

// ============================================================================
// TitleBar
// ============================================================================

/**
 * Custom Electron window title bar replacement.
 *
 * Provides a draggable region for window movement. Platform-specific window
 * controls (traffic lights on macOS, overlay on Windows) are handled by
 * Electron configuration in the main process.
 *
 * Layout (Capacities-style):
 * - Full width, sits above all other content (sidebar, header, main)
 * - Height: 36px compact
 * - Left: macOS traffic lights (handled by Electron), then sidebar collapse toggle
 * - Center: Breadcrumbs (controls moved to sidebar header/footer)
 *
 * Usage:
 * - Entire region is draggable by default
 * - Collapse toggle uses `app-region-no-drag` class to remain clickable
 *
 * Electron config requirements (already set in apps/desktop):
 * - macOS: titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 16 }
 * - Windows: titleBarOverlay with custom colors
 */
export function TitleBar({
  sidebarCollapsed = false,
  onSidebarCollapseToggle,
  breadcrumbs = [],
  className,
  children,
}: TitleBarProps) {
  return (
    <div
      className={cn(
        // Layout
        'h-9 w-full shrink-0',
        // Drag behavior - entire region is draggable (Electron frameless window)
        'app-region-drag',
        // Visual styling - white background, seamless with app
        'bg-background',
        // Ensure it sits in the layout flow
        'relative flex items-center',
        className
      )}
    >
      {/* Custom children (use sparingly - for platform-specific elements like traffic light placeholders) */}
      {children}

      {/* Centered breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 app-region-no-drag">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      {/* Sidebar collapse toggle - positioned after traffic lights area */}
      {onSidebarCollapseToggle && (
        <div className="ml-[76px] self-center app-region-no-drag">
          <Tooltip content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="bottom">
            <IconButton
              variant="ghost"
              size="xs"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={onSidebarCollapseToggle}
            >
              <SidebarIcon className="h-4 w-4" weight="regular" />
            </IconButton>
          </Tooltip>
        </div>
      )}
    </div>
  );
}
