import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface RightSidebarProps {
  children: React.ReactNode;
  className?: string;
}

const RightSidebar = React.forwardRef<HTMLDivElement, RightSidebarProps>(
  ({ children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          // Layout
          'w-60 flex-shrink-0',
          // Border
          'border-l border-gray-300',
          // Background
          'bg-white',
          // Scroll
          'overflow-y-auto',
          // Spacing
          'p-4',
          className
        )}
        aria-label="Object properties sidebar"
      >
        {children}
      </aside>
    );
  }
);

RightSidebar.displayName = 'RightSidebar';

export { RightSidebar };
