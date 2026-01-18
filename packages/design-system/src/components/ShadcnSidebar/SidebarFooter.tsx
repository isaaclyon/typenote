import * as React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Fixed footer area at the bottom of the sidebar.
 * Typically contains user menu, settings, or secondary actions.
 */
function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
}

export { SidebarFooter };
