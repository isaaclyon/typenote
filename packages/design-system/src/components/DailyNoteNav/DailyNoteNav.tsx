import * as React from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { cn } from '../../utils/cn.js';

export interface DailyNoteNavProps {
  /** Navigate to previous day */
  onPrevious?: () => void;
  /** Navigate to next day */
  onNext?: () => void;
  /** Jump to today */
  onToday?: () => void;
  /** Whether currently viewing today's note */
  isToday?: boolean;
  /** Additional class names */
  className?: string;
}

const DailyNoteNav = React.forwardRef<HTMLDivElement, DailyNoteNavProps>(
  ({ onPrevious, onNext, onToday, isToday = false, className }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn('flex items-center justify-center gap-1', className)}
        aria-label="Daily note navigation"
      >
        <button
          type="button"
          onClick={onPrevious}
          data-testid="nav-prev-button"
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded',
            'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Previous day"
        >
          <CaretLeftIcon size={16} weight="bold" />
        </button>

        <button
          type="button"
          onClick={onToday}
          disabled={isToday}
          data-testid="nav-today-button"
          className={cn(
            'px-2 py-1 rounded',
            'text-[13px] font-medium',
            isToday
              ? 'text-accent-600 cursor-default'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Today
        </button>

        <button
          type="button"
          onClick={onNext}
          data-testid="nav-next-button"
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded',
            'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label="Next day"
        >
          <CaretRightIcon size={16} weight="bold" />
        </button>
      </nav>
    );
  }
);

DailyNoteNav.displayName = 'DailyNoteNav';

export { DailyNoteNav };
