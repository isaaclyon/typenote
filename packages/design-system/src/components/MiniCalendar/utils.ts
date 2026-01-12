/**
 * Date utilities for MiniCalendar
 */

export interface CalendarDay {
  /** Date in YYYY-MM-DD format */
  dateKey: string;
  /** Day of month (1-31) */
  day: number;
  /** Whether this day is from the current viewing month */
  isCurrentMonth: boolean;
  /** Whether this day is today */
  isToday: boolean;
}

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string to a Date (local timezone)
 */
export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year!, month! - 1, day);
}

/**
 * Get today's date key
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Get the calendar grid for a given month
 * Returns 6 weeks (42 days) to ensure consistent grid height
 */
export function getCalendarDays(
  year: number,
  month: number, // 0-indexed (0 = January)
  weekStartsOn: 0 | 1 = 0
): CalendarDay[] {
  const today = getTodayKey();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Calculate which day of week the month starts on
  let startDayOfWeek = firstDayOfMonth.getDay();
  if (weekStartsOn === 1) {
    // Adjust for Monday start
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  }

  const days: CalendarDay[] = [];

  // Add days from previous month to fill the first week
  const prevMonth = new Date(year, month, 0); // Last day of previous month
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const date = new Date(year, month - 1, day);
    days.push({
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: false,
      isToday: formatDateKey(date) === today,
    });
  }

  // Add days from current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    days.push({
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: true,
      isToday: formatDateKey(date) === today,
    });
  }

  // Add days from next month to complete 6 weeks (42 days)
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    days.push({
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: false,
      isToday: formatDateKey(date) === today,
    });
  }

  return days;
}

/**
 * Get weekday labels based on week start
 */
export function getWeekdayLabels(weekStartsOn: 0 | 1 = 0): string[] {
  const labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  if (weekStartsOn === 1) {
    return [...labels.slice(1), labels[0]!];
  }
  return labels;
}

/**
 * Format month/year for header display
 */
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
