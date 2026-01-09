/**
 * Calendar Date Utilities
 *
 * Pure functions for calendar grid generation and month navigation.
 * Used by the Calendar UI component to display a month view with events.
 *
 * All dates are in YYYY-MM-DD format for consistency with the rest of the codebase.
 */

/**
 * Format a date as YYYY-MM-DD string.
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get all 42 dates for a month grid (6 weeks x 7 days).
 * Includes padding days from prev/next months to fill the grid.
 *
 * @param year - Full year (e.g., 2024)
 * @param month - Month index (0-11, where 0 = January)
 * @returns Array of 42 YYYY-MM-DD strings
 */
export function getMonthGridDates(year: number, month: number): string[] {
  // Get the first day of the month
  const firstOfMonth = new Date(year, month, 1);

  // Get the day of week (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = firstOfMonth.getDay();

  // Calculate the start date (first Sunday in the grid)
  const gridStart = new Date(year, month, 1 - startDayOfWeek);

  const dates: string[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    dates.push(formatDateKey(date));
  }

  return dates;
}

/**
 * Get the date range needed for fetching events.
 * Returns the first and last visible dates in the 6-week grid.
 *
 * @param year - Full year (e.g., 2024)
 * @param month - Month index (0-11, where 0 = January)
 * @returns Object with startDate and endDate in YYYY-MM-DD format
 */
export function getMonthDateRange(
  year: number,
  month: number
): {
  startDate: string;
  endDate: string;
} {
  const dates = getMonthGridDates(year, month);
  const startDate = dates[0];
  const endDate = dates[41];

  // These are guaranteed to exist since getMonthGridDates always returns 42 dates
  if (startDate === undefined || endDate === undefined) {
    throw new Error('Unexpected: getMonthGridDates did not return 42 dates');
  }

  return { startDate, endDate };
}

/**
 * Format a Date for month/year header display.
 *
 * @param date - Date object to format
 * @returns "January 2024" format string
 */
export function formatMonthYear(date: Date): string {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const monthName = months[date.getMonth()];
  return `${monthName} ${date.getFullYear()}`;
}

/**
 * Navigate months forward or backward.
 * Returns a new Date object without mutating the original.
 *
 * @param date - Starting date
 * @param count - Number of months to add (negative to subtract)
 * @returns New Date object with months added
 */
export function addMonths(date: Date, count: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + count);
  return result;
}

/**
 * Get today's date as YYYY-MM-DD.
 * Named differently from dateUtils.getTodayDateKey to avoid confusion
 * and allow independent use in calendar context.
 *
 * @returns Today's date in YYYY-MM-DD format
 */
export function getCalendarTodayDateKey(): string {
  return formatDateKey(new Date());
}
