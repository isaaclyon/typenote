/**
 * CalendarView Component
 *
 * Main container that orchestrates all calendar components:
 * - CalendarHeader for navigation
 * - CalendarGrid for month view
 * - CalendarSidebar for selected day events
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CalendarItem } from '@typenote/storage';
import { getMonthDateRange, addMonths, getCalendarTodayDateKey } from '@typenote/core';
import { CalendarHeader } from './CalendarHeader.js';
import { CalendarGrid } from './CalendarGrid.js';
import { CalendarSidebar } from './CalendarSidebar.js';
import { useTypenoteEvents } from '../../hooks/useTypenoteEvents.js';
import type { AsyncData } from '../../types/index.js';

export interface CalendarViewProps {
  onNavigate: (objectId: string) => void;
}

export function CalendarView({ onNavigate }: CalendarViewProps) {
  // State
  const [viewingMonth, setViewingMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(getCalendarTodayDateKey());
  const [eventsState, setEventsState] = useState<AsyncData<CalendarItem[]>>({ status: 'loading' });

  // Extract fetchEvents as stable callback
  const fetchEvents = useCallback(async () => {
    setEventsState({ status: 'loading' });

    try {
      const year = viewingMonth.getFullYear();
      const month = viewingMonth.getMonth();
      const { startDate, endDate } = getMonthDateRange(year, month);

      const outcome = await window.typenoteAPI.getEventsInDateRange(startDate, endDate);
      if (outcome.success) {
        setEventsState({ status: 'success', data: outcome.result });
      } else {
        setEventsState({ status: 'error', error: outcome.error.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setEventsState({ status: 'error', error: errorMessage });
    }
  }, [viewingMonth]);

  // Fetch events when viewing month changes
  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // Refetch when Event object created
  useTypenoteEvents(
    (event) => {
      if (event.type === 'object:created' && event.payload.typeKey === 'Event') {
        // Refetch current month's events
        void fetchEvents();
      }
    },
    [fetchEvents]
  );

  // Group events by date for the grid
  const eventsMap = useMemo(() => {
    if (eventsState.status !== 'success') return new Map<string, CalendarItem[]>();

    const map = new Map<string, CalendarItem[]>();
    for (const event of eventsState.data) {
      const dateKey = event.dateInfo.startDate.slice(0, 10); // YYYY-MM-DD
      const existing = map.get(dateKey) ?? [];
      map.set(dateKey, [...existing, event]);
    }
    return map;
  }, [eventsState]);

  // Get selected day events
  const selectedDayEvents = selectedDate ? (eventsMap.get(selectedDate) ?? []) : [];

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewingMonth(addMonths(viewingMonth, -1));
  };

  const handleNextMonth = () => {
    setViewingMonth(addMonths(viewingMonth, 1));
  };

  const handleToday = () => {
    setViewingMonth(new Date());
    setSelectedDate(getCalendarTodayDateKey());
  };

  const handleDateSelect = (dateKey: string) => {
    setSelectedDate(dateKey);
  };

  return (
    <div className="flex h-full" data-testid="calendar-view">
      <div className="flex-1 flex flex-col p-4">
        <CalendarHeader
          viewingMonth={viewingMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
        <CalendarGrid
          viewingMonth={viewingMonth}
          selectedDate={selectedDate}
          eventsMap={eventsMap}
          onDateSelect={handleDateSelect}
        />
      </div>
      <CalendarSidebar
        selectedDate={selectedDate}
        events={selectedDayEvents}
        loadState={eventsState}
        onEventClick={onNavigate}
      />
    </div>
  );
}
