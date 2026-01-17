import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { KeyboardKey } from '../KeyboardKey/index.js';
import type { SidebarSearchTriggerProps } from './types.js';

const SidebarSearchTrigger = React.forwardRef<HTMLButtonElement, SidebarSearchTriggerProps>(
  ({ onClick, shortcut = '⌘K', className }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md transition-colors duration-150',
          'text-sm text-muted-foreground bg-muted',
          'hover:bg-secondary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'border border-border',
          className
        )}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search...</span>
        <KeyboardKey className="text-xs">{shortcut}</KeyboardKey>
      </button>
    );
  }
);

SidebarSearchTrigger.displayName = 'SidebarSearchTrigger';

export { SidebarSearchTrigger };
