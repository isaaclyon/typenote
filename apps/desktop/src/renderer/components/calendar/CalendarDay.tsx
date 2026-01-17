/**
 * CalendarDay Component
 *
 * Renders a single day cell in the calendar grid.
 * Displays the day number with optional event indicator and various states.
 */

import { cn } from '@typenote/design-system';

export interface CalendarDayProps {
  dateKey: string; // YYYY-MM-DD
  dayOfMonth: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  hasEvents: boolean;
  onSelect: () => void;
}

export function CalendarDay({
  dateKey,
  dayOfMonth,
  isToday,
  isSelected,
  isCurrentMonth,
  hasEvents,
  onSelect,
}: CalendarDayProps) {
  return (
    <button
      type="button"
      data-testid={`calendar-day-${dateKey}`}
      onClick={onSelect}
      className={cn(
        'w-10 h-10 flex flex-col items-center justify-center cursor-pointer rounded-full transition-colors',
        'hover:bg-accent',
        isToday && !isSelected && 'ring-2 ring-primary',
        isToday && 'font-bold',
        isSelected && 'bg-primary text-primary-foreground',
        !isCurrentMonth && 'text-muted-foreground/50'
      )}
    >
      <span>{dayOfMonth}</span>
      {hasEvents && (
        <span
          data-testid={`calendar-day-indicator-${dateKey}`}
          className={cn(
            'rounded-full w-1 h-1',
            isSelected ? 'bg-primary-foreground' : 'bg-primary'
          )}
        />
      )}
    </button>
  );
}
