import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface DailyNoteHeaderProps {
  /** Date in YYYY-MM-DD format */
  dateKey: string;
  className?: string;
}

/**
 * Formats a date key into the day name (e.g., "Thursday")
 */
function formatDayName(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
}

/**
 * Formats a date key into full date (e.g., "January 16, 2026")
 */
function formatFullDate(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Immutable header for Daily Notes displaying a formatted date.
 * Shows day name as a subtle label above the full date.
 *
 * Example:
 * ```
 * Thursday
 * January 16, 2026
 * ```
 */
export function DailyNoteHeader({ dateKey, className }: DailyNoteHeaderProps): React.ReactElement {
  const dayName = formatDayName(dateKey);
  const fullDate = formatFullDate(dateKey);

  return (
    <header className={cn('select-none', className)}>
      <div className="text-xs text-gray-400 font-normal mb-0.5">{dayName}</div>
      <h1 className="text-2xl text-gray-900 font-semibold">{fullDate}</h1>
    </header>
  );
}

DailyNoteHeader.displayName = 'DailyNoteHeader';
