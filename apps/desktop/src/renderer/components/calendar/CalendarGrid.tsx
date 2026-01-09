/**
 * CalendarGrid Component
 *
 * Renders a complete month view with day-of-week headers and 6 weeks of day cells.
 * Uses getMonthGridDates from @typenote/core for date calculation.
 */

import type { CalendarItem } from '@typenote/storage';
import { getMonthGridDates, getCalendarTodayDateKey } from '@typenote/core';
import { CalendarDay } from './CalendarDay.js';

export interface CalendarGridProps {
  viewingMonth: Date;
  selectedDate: string | null;
  eventsMap: Map<string, CalendarItem[]>;
  onDateSelect: (dateKey: string) => void;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({
  viewingMonth,
  selectedDate,
  eventsMap,
  onDateSelect,
}: CalendarGridProps) {
  const year = viewingMonth.getFullYear();
  const month = viewingMonth.getMonth();
  const dates = getMonthGridDates(year, month);
  const todayDateKey = getCalendarTodayDateKey();

  // Format month as YYYY-MM prefix for comparison
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  return (
    <div data-testid="calendar-grid" className="flex flex-col gap-1">
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="w-10 h-6 flex items-center justify-center text-xs text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days grid - 6 rows of 7 days */}
      <div className="grid grid-cols-7 gap-1">
        {dates.map((dateKey) => {
          const dayOfMonth = parseInt(dateKey.slice(8, 10), 10);
          const isCurrentMonth = dateKey.startsWith(currentMonthPrefix);
          const isToday = dateKey === todayDateKey;
          const isSelected = dateKey === selectedDate;
          const hasEvents = eventsMap.has(dateKey) && (eventsMap.get(dateKey)?.length ?? 0) > 0;

          return (
            <CalendarDay
              key={dateKey}
              dateKey={dateKey}
              dayOfMonth={dayOfMonth}
              isToday={isToday}
              isSelected={isSelected}
              isCurrentMonth={isCurrentMonth}
              hasEvents={hasEvents}
              onSelect={() => onDateSelect(dateKey)}
            />
          );
        })}
      </div>
    </div>
  );
}
