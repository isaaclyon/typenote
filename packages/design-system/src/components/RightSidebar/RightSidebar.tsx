import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface RightSidebarProps {
  /** Whether the sidebar is collapsed */
  collapsed?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Right sidebar container for contextual content like properties and backlinks.
 *
 * When used with AppShell, the wrapper controls width and this component
 * fades its content when collapsed. When used standalone, width is fixed.
 */
const RightSidebar = React.forwardRef<HTMLDivElement, RightSidebarProps>(
  ({ collapsed = false, children, className }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          // Layout - full width within AppShell wrapper
          'w-full h-full',
          // Border
          'border-l border-border',
          // Background
          'bg-background',
          // Scroll
          'overflow-y-auto',
          // Spacing
          'p-4',
          // Fade content when collapsed for smooth transition
          'transition-opacity duration-200 ease-out',
          collapsed && 'opacity-0 pointer-events-none',
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
