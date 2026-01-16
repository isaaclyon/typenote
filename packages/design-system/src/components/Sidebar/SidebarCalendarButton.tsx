import * as React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { SidebarCalendarButtonProps } from './types.js';

const SidebarCalendarButton = React.forwardRef<HTMLButtonElement, SidebarCalendarButtonProps>(
  ({ onClick, isToday = false, className }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 h-9 px-3 rounded-md transition-colors duration-150',
          'text-sm font-medium',
          isToday
            ? 'bg-accent-50 text-accent-700 hover:bg-accent-100'
            : 'text-gray-700 hover:bg-gray-50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          className
        )}
      >
        <Calendar className="w-4 h-4" />
        <span>Today</span>
      </button>
    );
  }
);

SidebarCalendarButton.displayName = 'SidebarCalendarButton';

export { SidebarCalendarButton };
