import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { useResizableSidebar } from './useResizableSidebar.js';
import { SidebarCollapseButton } from './SidebarCollapseButton.js';
import { ResizeHandle } from './ResizeHandle.js';
import { ContentArea } from './ContentArea.js';
import type { AppShellProps } from './types.js';

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
      leftSidebarWidthStorageKey,
      rightSidebarWidthStorageKey,
      defaultLeftCollapsed = false,
      defaultRightCollapsed = false,
      className,
    },
    ref
  ) => {
    const leftState = useResizableSidebar({
      side: 'left',
      collapsedStorageKey: leftSidebarStorageKey,
      widthStorageKey: leftSidebarWidthStorageKey,
      defaultCollapsed: defaultLeftCollapsed,
    });

    const rightState = useResizableSidebar({
      side: 'right',
      collapsedStorageKey: rightSidebarStorageKey,
      widthStorageKey: rightSidebarWidthStorageKey,
      defaultCollapsed: defaultRightCollapsed,
    });

    return (
      <div ref={ref} className={cn('flex h-full', className)}>
        {/* Left Sidebar Wrapper */}
        {leftSidebar && (
          <div
            className={cn(
              'group relative flex-shrink-0', // 'group' enables hover-reveal for collapse button
              // Disable transition during resize for responsive drag
              !leftState.isResizing && 'transition-[width] duration-200 ease-out'
            )}
            style={{ width: leftState.width }}
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
            {/* Resize handle - only when expanded */}
            {!leftState.collapsed && (
              <ResizeHandle
                side="left"
                isResizing={leftState.isResizing}
                onResizeStart={leftState.handleResizeStart}
              />
            )}
          </div>
        )}

        {/* Main Content */}
        <ContentArea>{children}</ContentArea>

        {/* Right Sidebar Wrapper */}
        {rightSidebar && (
          <div
            className={cn(
              'group relative flex-shrink-0', // 'group' enables hover-reveal for collapse button
              // Disable transition during resize for responsive drag
              !rightState.isResizing && 'transition-[width] duration-200 ease-out'
            )}
            style={{ width: rightState.width }}
          >
            {/* Collapse button on inner edge */}
            <SidebarCollapseButton
              collapsed={rightState.collapsed}
              onClick={rightState.toggle}
              side="right"
            />
            {/* Resize handle - only when expanded */}
            {!rightState.collapsed && (
              <ResizeHandle
                side="right"
                isResizing={rightState.isResizing}
                onResizeStart={rightState.handleResizeStart}
              />
            )}
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
