import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Separator } from '../Separator/Separator.js';

/**
 * Horizontal divider within the sidebar.
 * Uses sidebar-specific border color.
 */
function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      {...props}
    />
  );
}

export { SidebarSeparator };
