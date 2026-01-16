import { useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { MiniCalendar, NotesCreatedList, ScrollArea } from '@typenote/design-system';
import { useDatesWithNotes } from '../hooks/useDatesWithNotes.js';
import { useObjectsCreatedOnDate } from '../hooks/useObjectsCreatedOnDate.js';

interface DailyNoteLayoutProps {
  /** The date key for this daily note (YYYY-MM-DD) */
  dateKey: string;
  /** Called when user clicks a date in the calendar */
  onNavigateToDate: (dateKey: string) => void;
  /** Called when user clicks an object in the created list */
  onNavigateToObject: (objectId: string) => void;
  /** The main editor content */
  children: ReactElement;
}

/**
 * 2-column layout for Daily Note views.
 * Left column: Editor content
 * Right column: MiniCalendar + NotesCreatedList
 */
export function DailyNoteLayout({
  dateKey,
  onNavigateToDate,
  onNavigateToObject,
  children,
}: DailyNoteLayoutProps): ReactElement {
  const { datesWithNotes, fetchForMonth } = useDatesWithNotes();
  const { objects: createdObjects, isLoading: isLoadingCreated } = useObjectsCreatedOnDate(dateKey);

  // Handle month change in calendar
  const handleMonthChange = useCallback(
    (year: number, month: number) => {
      void fetchForMonth(year, month);
    },
    [fetchForMonth]
  );

  // Fetch dates for the month of the current daily note on mount
  useEffect(() => {
    const parts = dateKey.split('-').map(Number);
    const year = parts[0];
    const month = parts[1];
    if (year !== undefined && month !== undefined) {
      void fetchForMonth(year, month - 1); // month is 0-indexed
    }
  }, [dateKey, fetchForMonth]);

  return (
    <div className="flex h-full">
      {/* Left column: Editor content */}
      <ScrollArea className="flex-1">{children}</ScrollArea>

      {/* Right column: Calendar panel */}
      <ScrollArea className="w-70 flex-shrink-0 border-l border-gray-200 bg-gray-50/50">
        <div className="px-6 py-4">
          <MiniCalendar
            selectedDate={dateKey}
            datesWithNotes={datesWithNotes}
            onDateSelect={onNavigateToDate}
            onMonthChange={handleMonthChange}
            className="mb-6"
          />

          <NotesCreatedList
            date={dateKey}
            items={createdObjects}
            isLoading={isLoadingCreated}
            onItemClick={onNavigateToObject}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
