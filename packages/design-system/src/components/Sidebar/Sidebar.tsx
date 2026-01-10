import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { SidebarProps } from './types.js';

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ collapsed = false, onCollapse: _onCollapse, className, children }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          'flex flex-col',
          'w-60 h-full',
          'bg-white border-r border-gray-200',
          'p-2',
          collapsed && 'w-16',
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
