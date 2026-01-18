import * as React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Scrollable content area within the sidebar.
 * Contains the main navigation items.
 */
function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 overflow-auto',
        'group-data-[collapsible=icon]:overflow-hidden',
        className
      )}
      {...props}
    />
  );
}

export { SidebarContent };
