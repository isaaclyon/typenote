import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { TitleBar } from '../TitleBar/TitleBar.js';
import { Sidebar } from '../Sidebar/Sidebar.js';
import { HeaderBar, type HeaderBarProps } from '../HeaderBar/HeaderBar.js';

// ============================================================================
// Types
// ============================================================================

export interface AppShellProps extends Omit<HeaderBarProps, 'className'> {
  /** Whether the sidebar is collapsed (56px) or expanded (240px) */
  sidebarCollapsed?: boolean;
  /** Callback when sidebar collapsed state changes */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Content to render inside the sidebar (SidebarHeader, SidebarSection, etc.) */
  sidebarContent?: React.ReactNode;
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
 * │                          TitleBar (28px)                          │
 * ├────────────┬──────────────────────────────────────────────────────┤
 * │            │                 HeaderBar (40px)                     │
 * │  Sidebar   ├──────────────────────────────────────────────────────┤
 * │ (240/56px) │                                                      │
 * │            │                    Content                           │
 * │            │                  (children)                          │
 * │            │                                                      │
 * └────────────┴──────────────────────────────────────────────────────┘
 * ```
 *
 * Features:
 * - TitleBar spans full width (Electron draggable region)
 * - Sidebar runs full height below TitleBar, collapsible
 * - HeaderBar + Content fill remaining space
 * - Controlled sidebar state (parent owns collapsed state)
 */
export function AppShell({
  // Sidebar props
  sidebarCollapsed = false,
  onSidebarCollapsedChange,
  sidebarContent,
  // HeaderBar props (pass-through)
  breadcrumbs,
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
      {/* TitleBar - full width, top */}
      <TitleBar />

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
          {/* HeaderBar */}
          <HeaderBar
            {...(breadcrumbs && { breadcrumbs })}
            {...(onSearchClick && { onSearchClick })}
            {...(onSettingsClick && { onSettingsClick })}
            {...(theme && { theme })}
            {...(onThemeToggle && { onThemeToggle })}
            {...(searchShortcut && { searchShortcut })}
          />

          {/* Content area */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
