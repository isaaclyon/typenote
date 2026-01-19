import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { ScrollArea } from '../../primitives/ScrollArea/ScrollArea.js';
import { SidebarContext } from './SidebarContext.js';
import type { SidebarProps } from './types.js';

// ============================================================================
// Constants
// ============================================================================

const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 56;

// ============================================================================
// Sidebar
// ============================================================================

export function Sidebar({ collapsed, onCollapsedChange, children, className }: SidebarProps) {
  const contextValue = React.useMemo(() => ({ collapsed }), [collapsed]);

  // Extract header, sections, and footer from children
  const childArray = React.Children.toArray(children);

  // Find header (first child that looks like a header)
  const header = childArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as React.ComponentType & { displayName?: string })?.displayName ===
        'SidebarHeader'
  );

  // Find footer (last child that looks like a footer)
  const footer = childArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type as React.ComponentType & { displayName?: string })?.displayName ===
        'SidebarFooter'
  );

  // Everything else is content (sections)
  const content = childArray.filter(
    (child) =>
      !React.isValidElement(child) ||
      ((child.type as React.ComponentType & { displayName?: string })?.displayName !==
        'SidebarHeader' &&
        (child.type as React.ComponentType & { displayName?: string })?.displayName !==
          'SidebarFooter')
  );

  // Clone header with onCollapseToggle prop
  const headerWithToggle = header
    ? React.cloneElement(header as React.ReactElement<{ onCollapseToggle?: () => void }>, {
        onCollapseToggle: () => onCollapsedChange(!collapsed),
      })
    : null;

  return (
    <SidebarContext.Provider value={contextValue}>
      <aside
        className={cn(
          'flex h-full flex-col border-r border-sidebar-border bg-background',
          'transition-[width] duration-200 ease-out',
          className
        )}
        style={{
          width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
        }}
      >
        {/* Header (fixed) */}
        {headerWithToggle}

        {/* Scrollable content area */}
        <ScrollArea className="flex-1" orientation="vertical">
          <div className="flex flex-col gap-2 py-2">{content}</div>
        </ScrollArea>

        {/* Footer (fixed) */}
        {footer}
      </aside>
    </SidebarContext.Provider>
  );
}

Sidebar.displayName = 'Sidebar';
