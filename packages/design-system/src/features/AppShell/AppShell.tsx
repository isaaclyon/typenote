import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { TitleBar } from '../TitleBar/TitleBar.js';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { HeaderBar } from '../HeaderBar/HeaderBar.js';
import type { BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';

// ============================================================================
// Types
// ============================================================================

export interface AppShellProps {
  /** Whether the sidebar is collapsed (56px) or expanded (240px) */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar collapsed state changes */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Content to render inside the sidebar (SidebarHeader, SidebarSection, etc.) */
  sidebarContent?: React.ReactNode;
  /** Optional custom content inside the TitleBar (e.g., traffic light placeholders) */
  titleBarChildren?: React.ReactNode;
  /** Breadcrumb items for navigation path (shown in HeaderBar) */
  breadcrumbs?: BreadcrumbItem[];
  /** Main content area */
  children: React.ReactNode;
  /** Additional CSS classes for the root element */
  className?: string;
}

// ============================================================================
// AppShell
// ============================================================================

/**
 * Root layout composition that combines TitleBar, Sidebar, HeaderBar, and content.
 *
 * Layout:
 * ```
 * ┌───────────────────────────────────────────────────────────────────┐
 * │ [traffic lights]               TitleBar (28px)                    │
 * ├────────────┬──────────────────────────────────────────────────────┤
 * │            │         HeaderBar (40px) - breadcrumbs only          │
 * │  Sidebar   ├──────────────────────────────────────────────────────┤
 * │ (240/56px) │                                                      │
 * │            │                    Content                           │
 * │            │                  (children)                          │
 * │            │                                                      │
 * └────────────┴──────────────────────────────────────────────────────┘
 * ```
 *
 * Features:
 * - TitleBar spans full width (draggable region + collapse toggle)
 * - Sidebar runs full height below TitleBar, collapsible
 * - HeaderBar shows only breadcrumbs (controls live in sidebar content)
 * - Controlled sidebar state (parent owns collapsed state)
 * - Optional TitleBar children for platform placeholders or custom controls
 */
export function AppShell({
  // Sidebar props
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  sidebarContent,
  titleBarChildren,
  // HeaderBar props
  breadcrumbs,
  // Content
  children,
  className,
}: AppShellProps) {
  const handleSidebarCollapseToggle = onSidebarCollapsedChange
    ? () => onSidebarCollapsedChange(!sidebarCollapsed)
    : undefined;

  return (
    <div className={cn('flex h-full w-full flex-col bg-background', className)}>
      {/* TitleBar - full width, top */}
      <TitleBar
        sidebarCollapsed={sidebarCollapsed}
        {...(handleSidebarCollapseToggle && {
          onSidebarCollapseToggle: handleSidebarCollapseToggle,
        })}
      >
        {titleBarChildren}
      </TitleBar>

      {/* Below TitleBar: Sidebar + Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={onSidebarCollapsedChange ?? (() => {})}
        >
          {sidebarContent}
        </Sidebar>

        {/* Main area: HeaderBar + Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* HeaderBar - breadcrumbs only */}
          <HeaderBar {...(breadcrumbs && { breadcrumbs })} />

          {/* Content area */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
