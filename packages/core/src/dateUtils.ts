/**
 * Date Utilities for Daily Note Navigation
 *
 * Pure functions for date arithmetic operating on date keys in YYYY-MM-DD format.
 * These are used by the daily note navigation feature to calculate prev/next dates.
 */

/**
 * Validate that a string is in YYYY-MM-DD format.
 */
export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

/**
 * Get the previous day's date key.
 *
 * @param dateKey - Date in YYYY-MM-DD format
 * @returns Previous day in YYYY-MM-DD format
 */
export function getPreviousDate(dateKey: string): string {
  // Parse as local date at midnight to avoid timezone issues
  const date = new Date(dateKey + 'T00:00:00');
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Get the next day's date key.
 *
 * @param dateKey - Date in YYYY-MM-DD format
 * @returns Next day in YYYY-MM-DD format
 */
export function getNextDate(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Get today's date as a date key.
 *
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Format a date key for human-readable display.
 *
 * @param dateKey - Date in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDateForDisplay(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
