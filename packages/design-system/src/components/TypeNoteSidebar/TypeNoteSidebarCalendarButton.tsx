import * as React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface TypeNoteSidebarCalendarButtonProps {
  /** Called when the button is clicked */
  onClick?: () => void;
  /** Whether to highlight as "today" (uses accent styling) */
  isToday?: boolean;
  /** Additional className for styling */
  className?: string;
}

/**
 * TypeNote-style calendar/today button for the sidebar.
 * When isToday is true, uses accent color styling to indicate current day.
 *
 * Built on shadcn patterns but styled for TypeNote's design system.
 */
const TypeNoteSidebarCalendarButton = React.forwardRef<
  HTMLButtonElement,
  TypeNoteSidebarCalendarButtonProps
>(({ onClick, isToday = false, className }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 h-9 px-3 rounded-md w-full',
        'transition-colors duration-150',
        'text-sm font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isToday
          ? 'bg-accent-50 text-accent-700 hover:bg-accent-100'
          : 'text-foreground hover:bg-muted',
        className
      )}
    >
      <Calendar className="w-4 h-4" />
      <span>Today</span>
    </button>
  );
});

TypeNoteSidebarCalendarButton.displayName = 'TypeNoteSidebarCalendarButton';

export { TypeNoteSidebarCalendarButton };
