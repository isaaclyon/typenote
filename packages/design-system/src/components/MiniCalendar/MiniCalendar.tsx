import * as React from 'react';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { cn } from '../../utils/cn.js';
import {
  getCalendarDays,
  getWeekdayLabels,
  formatMonthYear,
  parseDateKey,
  type CalendarDay,
} from './utils.js';

export interface MiniCalendarProps {
  /** Currently selected/viewing date (YYYY-MM-DD) */
  selectedDate: string;

  /** Set of dates that have notes (YYYY-MM-DD format) */
  datesWithNotes?: Set<string>;

  /** Called when user clicks a date - parent handles navigation/creation */
  onDateSelect?: (date: string) => void;

  /** Called when month changes (for loading note indicators) */
  onMonthChange?: (year: number, month: number) => void;

  /** Week start: 0 = Sunday, 1 = Monday. Default: 0 */
  weekStartsOn?: 0 | 1;

  /** Additional class names */
  className?: string;
}

const MiniCalendar = React.forwardRef<HTMLDivElement, MiniCalendarProps>(
  (
    { selectedDate, datesWithNotes, onDateSelect, onMonthChange, weekStartsOn = 0, className },
    ref
  ) => {
    // Parse selectedDate to get initial viewing month
    const selectedParsed = React.useMemo(() => parseDateKey(selectedDate), [selectedDate]);

    // Internal state for which month we're viewing (may differ from selected date)
    const [viewingYear, setViewingYear] = React.useState(selectedParsed.getFullYear());
    const [viewingMonth, setViewingMonth] = React.useState(selectedParsed.getMonth());

    // Update viewing month when selected date changes to a different month
    React.useEffect(() => {
      const parsed = parseDateKey(selectedDate);
      if (parsed.getFullYear() !== viewingYear || parsed.getMonth() !== viewingMonth) {
        setViewingYear(parsed.getFullYear());
        setViewingMonth(parsed.getMonth());
      }
    }, [selectedDate, viewingMonth, viewingYear]);

    // Calculate calendar days for current view
    const calendarDays = React.useMemo(
      () => getCalendarDays(viewingYear, viewingMonth, weekStartsOn),
      [viewingYear, viewingMonth, weekStartsOn]
    );

    const weekdayLabels = React.useMemo(() => getWeekdayLabels(weekStartsOn), [weekStartsOn]);

    const monthYearLabel = formatMonthYear(viewingYear, viewingMonth);

    const goToPreviousMonth = () => {
      let newMonth = viewingMonth - 1;
      let newYear = viewingYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      setViewingMonth(newMonth);
      setViewingYear(newYear);
      onMonthChange?.(newYear, newMonth);
    };

    const goToNextMonth = () => {
      let newMonth = viewingMonth + 1;
      let newYear = viewingYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setViewingMonth(newMonth);
      setViewingYear(newYear);
      onMonthChange?.(newYear, newMonth);
    };

    const handleDayClick = (day: CalendarDay) => {
      onDateSelect?.(day.dateKey);
    };

    return (
      <div
        ref={ref}
        className={cn('w-full select-none', className)}
        role="application"
        aria-label="Calendar"
      >
        {/* Month header */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label="Previous month"
          >
            <CaretLeftIcon size={16} weight="bold" />
          </button>

          <span className="text-sm font-medium text-foreground">{monthYearLabel}</span>

          <button
            type="button"
            onClick={goToNextMonth}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label="Next month"
          >
            <CaretRightIcon size={16} weight="bold" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 mb-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className="h-8 flex items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const isSelected = day.dateKey === selectedDate;
            const hasNote = datesWithNotes?.has(day.dateKey) ?? false;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => handleDayClick(day)}
                className={cn(
                  'relative h-8 w-8 flex items-center justify-center text-sm rounded',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                  // Base styles by state
                  !day.isCurrentMonth && 'text-muted-foreground',
                  day.isCurrentMonth && !isSelected && 'text-foreground',
                  day.isToday && !isSelected && 'text-accent-600 font-medium',
                  // Selected state
                  isSelected && 'bg-accent-500 text-white font-medium',
                  // Hover (only when not selected)
                  !isSelected && 'hover:bg-muted'
                )}
                aria-label={`${day.dateKey}${day.isToday ? ', today' : ''}${hasNote ? ', has note' : ''}`}
                aria-pressed={isSelected}
              >
                {day.day}
                {/* Dot indicator for days with notes */}
                {hasNote && !isSelected && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-400"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

MiniCalendar.displayName = 'MiniCalendar';

export { MiniCalendar };
