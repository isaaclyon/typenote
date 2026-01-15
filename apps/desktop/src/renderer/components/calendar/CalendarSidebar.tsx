/**
 * CalendarSidebar Component
 *
 * Displays events for a selected date with loading, error, and empty states.
 */

import type { CalendarItem } from '@typenote/storage';
import { Skeleton } from '@typenote/design-system';
import { EventList } from './EventList.js';

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: T };

export interface CalendarSidebarProps {
  selectedDate: string | null; // YYYY-MM-DD
  events: CalendarItem[];
  loadState: LoadState<CalendarItem[]>;
  onEventClick: (objectId: string) => void;
}

/**
 * Format a date string to display like "Wednesday, January 15"
 */
function formatDateHeader(dateString: string): string {
  // Parse the date string as local date (not UTC)
  const parts = dateString.split('-').map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function CalendarSidebar({
  selectedDate,
  events,
  loadState,
  onEventClick,
}: CalendarSidebarProps) {
  return (
    <div className="w-80 border-l flex flex-col h-full" data-testid="calendar-sidebar">
      {/* Header */}
      <div className="p-4 border-b">
        {selectedDate ? (
          <h2 className="text-lg font-semibold">{formatDateHeader(selectedDate)}</h2>
        ) : (
          <h2 className="text-lg font-semibold text-muted-foreground">Select a date</h2>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loadState.status === 'loading' && (
          <div className="p-4 space-y-3" data-testid="loading-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {loadState.status === 'error' && (
          <div className="flex items-center justify-center h-full text-destructive p-4 text-center">
            Error: {loadState.message}
          </div>
        )}

        {loadState.status === 'loaded' && <EventList events={events} onEventClick={onEventClick} />}
      </div>
    </div>
  );
}
