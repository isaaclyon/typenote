import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { SidebarProps } from './types.js';

/**
 * Left sidebar navigation container.
 *
 * When used with AppShell, the wrapper controls width and this component
 * fades its content when collapsed. When used standalone, width is fixed.
 */
const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    { collapsed = false, onCollapse: _onCollapse, hasTitleBarPadding = false, className, children },
    ref
  ) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'flex flex-col h-full',
          'bg-white border-r border-gray-200',
          'p-2',
          // Add top padding for custom title bar (traffic lights on macOS)
          hasTitleBarPadding && 'pt-10',
          // Width: full when in AppShell wrapper, or fixed for standalone use
          'w-full',
          // Fade content when collapsed for smooth transition
          'transition-opacity duration-200 ease-out',
          collapsed && 'opacity-0 pointer-events-none',
          className
        )}
      >
        {children}
      </nav>
    );
  }
);

Sidebar.displayName = 'Sidebar';

export { Sidebar };
