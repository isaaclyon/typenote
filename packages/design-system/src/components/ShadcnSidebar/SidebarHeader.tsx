import * as React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Fixed header area at the top of the sidebar.
 * Typically contains logo, search, or primary actions.
 */
function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

export { SidebarHeader };
