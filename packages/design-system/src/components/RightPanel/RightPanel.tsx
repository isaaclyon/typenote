import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface RightPanelProps {
  children: React.ReactNode;
  className?: string;
}

const RightPanel = React.forwardRef<HTMLDivElement, RightPanelProps>(
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
          'flex flex-col gap-6 p-4',
          className
        )}
        aria-label="Document context panel"
      >
        {children}
      </aside>
    );
  }
);

RightPanel.displayName = 'RightPanel';

export { RightPanel };
