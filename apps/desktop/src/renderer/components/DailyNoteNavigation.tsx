/**
 * DailyNoteNavigation Component
 *
 * Provides navigation controls for browsing between daily notes.
 * Displays prev/today/next buttons and a formatted date.
 */

import { useCallback, useState } from 'react';
import { Button } from './ui/button.js';
import {
  getPreviousDate,
  getNextDate,
  getTodayDateKey,
  formatDateForDisplay,
} from '@typenote/core';

interface DailyNoteNavigationProps {
  dateKey: string;
  onNavigate: (objectId: string) => void;
}

export function DailyNoteNavigation({ dateKey, onNavigate }: DailyNoteNavigationProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const today = getTodayDateKey();
  const isToday = dateKey === today;

  const navigateToDate = useCallback(
    async (targetDate: string) => {
      setIsNavigating(true);
      try {
        const result = await window.typenoteAPI.getOrCreateDailyNoteByDate(targetDate);
        if (result.success) {
          onNavigate(result.result.dailyNote.id);
        }
      } finally {
        setIsNavigating(false);
      }
    },
    [onNavigate]
  );

  const handlePrev = () => void navigateToDate(getPreviousDate(dateKey));
  const handleNext = () => void navigateToDate(getNextDate(dateKey));
  const handleToday = () => void navigateToDate(today);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrev}
        disabled={isNavigating}
        aria-label="Previous day"
      >
        Prev
      </Button>

      <span className="text-sm font-medium min-w-[120px] text-center">
        {formatDateForDisplay(dateKey)}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={isNavigating}
        aria-label="Next day"
      >
        Next
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToday}
        disabled={isToday || isNavigating}
        aria-label="Go to today"
      >
        Today
      </Button>
    </div>
  );
}
