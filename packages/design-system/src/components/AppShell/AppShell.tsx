import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { useCollapsibleSidebar } from './useCollapsibleSidebar.js';
import { SidebarCollapseButton } from './SidebarCollapseButton.js';
import { ContentArea } from './ContentArea.js';
import type { AppShellProps } from './types.js';

// Width constants following 4px grid
const RAIL_WIDTH = 'w-12'; // 48px collapsed rail
const EXPANDED_WIDTH = 'w-60'; // 240px expanded (matches existing Sidebar)

/**
 * Unified layout component that orchestrates a 3-column responsive layout
 * with collapsible sidebars.
 *
 * Uses render props pattern for sidebars, passing collapsed state so
 * sidebar content can respond appropriately.
 *
 * @example
 * <AppShell
 *   leftSidebar={({ collapsed }) => <Sidebar collapsed={collapsed}>...</Sidebar>}
 *   rightSidebar={({ collapsed }) => <RightSidebar collapsed={collapsed}>...</RightSidebar>}
 *   leftSidebarStorageKey="app.left.collapsed"
 *   rightSidebarStorageKey="app.right.collapsed"
 * >
 *   <ContentArea>Your content here</ContentArea>
 * </AppShell>
 */
const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      leftSidebar,
      rightSidebar,
      children,
      leftSidebarStorageKey,
      rightSidebarStorageKey,
      defaultLeftCollapsed = false,
      defaultRightCollapsed = false,
      className,
    },
    ref
  ) => {
    const leftState = useCollapsibleSidebar({
      defaultCollapsed: defaultLeftCollapsed,
      storageKey: leftSidebarStorageKey,
    });

    const rightState = useCollapsibleSidebar({
      defaultCollapsed: defaultRightCollapsed,
      storageKey: rightSidebarStorageKey,
    });

    return (
      <div ref={ref} className={cn('flex h-full', className)}>
        {/* Left Sidebar Wrapper */}
        {leftSidebar && (
          <div
            className={cn(
              'group relative flex-shrink-0', // 'group' enables hover-reveal for collapse button
              'transition-[width] duration-200 ease-out',
              leftState.collapsed ? RAIL_WIDTH : EXPANDED_WIDTH
            )}
          >
            {/* Sidebar content - overflow hidden for smooth transition */}
            <div className="h-full overflow-hidden">
              {leftSidebar({ collapsed: leftState.collapsed })}
            </div>
            {/* Collapse button on inner edge */}
            <SidebarCollapseButton
              collapsed={leftState.collapsed}
              onClick={leftState.toggle}
              side="left"
            />
          </div>
        )}

        {/* Main Content */}
        <ContentArea>{children}</ContentArea>

        {/* Right Sidebar Wrapper */}
        {rightSidebar && (
          <div
            className={cn(
              'group relative flex-shrink-0', // 'group' enables hover-reveal for collapse button
              'transition-[width] duration-200 ease-out',
              rightState.collapsed ? RAIL_WIDTH : EXPANDED_WIDTH
            )}
          >
            {/* Collapse button on inner edge */}
            <SidebarCollapseButton
              collapsed={rightState.collapsed}
              onClick={rightState.toggle}
              side="right"
            />
            {/* Sidebar content - overflow hidden for smooth transition */}
            <div className="h-full overflow-hidden">
              {rightSidebar({ collapsed: rightState.collapsed })}
            </div>
          </div>
        )}
      </div>
    );
  }
);

AppShell.displayName = 'AppShell';

export { AppShell };
