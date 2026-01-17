import * as React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { SidebarNewTypeButtonProps } from './types.js';

const SidebarNewTypeButton = React.forwardRef<HTMLButtonElement, SidebarNewTypeButtonProps>(
  ({ onClick, className }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 h-7 px-3 rounded-md transition-colors duration-150',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>New Type</span>
      </button>
    );
  }
);

SidebarNewTypeButton.displayName = 'SidebarNewTypeButton';

export { SidebarNewTypeButton };
