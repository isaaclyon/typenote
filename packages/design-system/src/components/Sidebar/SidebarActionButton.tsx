import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { SidebarActionButtonProps } from './types.js';

const SidebarActionButton = React.forwardRef<HTMLButtonElement, SidebarActionButtonProps>(
  ({ icon: Icon, label, onClick, withDivider = false, className }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 h-9 px-3 rounded-md transition-colors duration-150',
          'text-sm font-medium text-foreground',
          'hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          withDivider && 'border-t border-border pt-4 mt-4',
          className
        )}
      >
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </button>
    );
  }
);

SidebarActionButton.displayName = 'SidebarActionButton';

export { SidebarActionButton };
