import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { TitleBar } from '../TitleBar/TitleBar.js';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { HeaderBar } from '../HeaderBar/HeaderBar.js';
import type { Theme } from '../../patterns/ThemeToggle/ThemeToggle.js';
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
  /** Breadcrumb items for navigation path (shown in HeaderBar) */
  breadcrumbs?: BreadcrumbItem[];
  /** Click handler for search trigger (opens command palette) - shown in TitleBar */
  onSearchClick?: () => void;
  /** Click handler for settings button - shown in TitleBar */
  onSettingsClick?: () => void;
  /** Current theme - used by TitleBar theme toggle */
  theme?: Theme;
  /** Theme toggle handler - shown in TitleBar */
  onThemeToggle?: () => void;
  /** Custom keyboard shortcut for search (e.g., "Ctrl+K" on Windows) */
  searchShortcut?: string;
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
 * │ [traffic lights]    TitleBar (28px)    [Search] [☀] [⚙]         │
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
 * - TitleBar spans full width with controls on right (search, theme, settings)
 * - Sidebar runs full height below TitleBar, collapsible
 * - HeaderBar shows only breadcrumbs (controls moved to TitleBar)
 * - Controlled sidebar state (parent owns collapsed state)
 */
export function AppShell({
  // Sidebar props
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  sidebarContent,
  // HeaderBar props
  breadcrumbs,
  // TitleBar control props
  onSearchClick,
  onSettingsClick,
  theme,
  onThemeToggle,
  searchShortcut,
  // Content
  children,
  className,
}: AppShellProps) {
  return (
    <div className={cn('flex h-full w-full flex-col bg-background', className)}>
      {/* TitleBar - full width, top, with controls */}
      <TitleBar
        {...(onSearchClick && { onSearchClick })}
        {...(onSettingsClick && { onSettingsClick })}
        {...(theme && { theme })}
        {...(onThemeToggle && { onThemeToggle })}
        {...(searchShortcut && { searchShortcut })}
      />

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
