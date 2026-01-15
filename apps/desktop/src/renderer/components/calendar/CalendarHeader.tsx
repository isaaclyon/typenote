/**
 * CalendarHeader Component
 *
 * Renders the calendar header with month/year display and navigation buttons.
 * Provides controls for previous month, next month, and jumping to today.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear } from '@typenote/core';
import { Button, Text } from '@typenote/design-system';

export interface CalendarHeaderProps {
  viewingMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  viewingMonth,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthYearDisplay = formatMonthYear(viewingMonth);

  return (
    <div data-testid="calendar-header" className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevMonth}
          aria-label="Previous month"
          data-testid="calendar-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Text as="span" variant="body" className="min-w-32 text-center font-medium">
          {monthYearDisplay}
        </Text>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextMonth}
          aria-label="Next month"
          data-testid="calendar-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        aria-label="Today"
        data-testid="calendar-today"
      >
        Today
      </Button>
    </div>
  );
}
