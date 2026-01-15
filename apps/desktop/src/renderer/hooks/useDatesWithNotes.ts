/**
 * useDatesWithNotes Hook
 *
 * Fetches dates that have daily notes for a given month.
 * Returns a Set<string> of date keys (YYYY-MM-DD format) for efficient lookup.
 * Used by MiniCalendar to show dot indicators on dates with notes.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useCallback } from 'react';

interface UseDatesWithNotesResult {
  datesWithNotes: Set<string>;
  isLoading: boolean;
  error: string | null;
  fetchForMonth: (year: number, month: number) => Promise<void>;
}

/**
 * Get the first and last day of a month as YYYY-MM-DD strings.
 */
function getMonthDateRange(year: number, month: number): { startDate: string; endDate: string } {
  // First day of month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // Last day of month (go to first day of next month, then subtract 1 day)
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { startDate, endDate };
}

/**
 * Hook that fetches dates with daily notes for a given month.
 * Call fetchForMonth(year, month) when the calendar month changes.
 */
export function useDatesWithNotes(): UseDatesWithNotesResult {
  const [datesWithNotes, setDatesWithNotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchForMonth = useCallback(async (year: number, month: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getMonthDateRange(year, month);
      const result = await window.typenoteAPI.getDatesWithDailyNotes(startDate, endDate);

      if (result.success) {
        setDatesWithNotes(new Set(result.result));
      } else {
        setError(result.error.message);
        setDatesWithNotes(new Set());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setDatesWithNotes(new Set());
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    datesWithNotes,
    isLoading,
    error,
    fetchForMonth,
  };
}

/**
 * Hook that fetches dates with daily notes for the current viewing month.
 * Automatically refetches when year/month changes.
 */
export function useDatesWithNotesForMonth(
  year: number,
  month: number
): Omit<UseDatesWithNotesResult, 'fetchForMonth'> {
  const { datesWithNotes, isLoading, error, fetchForMonth } = useDatesWithNotes();

  useEffect(() => {
    void fetchForMonth(year, month);
  }, [year, month, fetchForMonth]);

  return { datesWithNotes, isLoading, error };
}
