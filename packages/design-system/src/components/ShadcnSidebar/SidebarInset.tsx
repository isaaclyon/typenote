import * as React from 'react';
import { cn } from '../../utils/cn.js';

/**
 * Main content area that sits adjacent to the sidebar.
 * Handles proper spacing and layout when sidebar is collapsed/expanded.
 */
function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative flex w-full flex-1 flex-col bg-background',
        // Inset variant styling
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0',
        'md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
        'md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className
      )}
      {...props}
    />
  );
}

export { SidebarInset };
