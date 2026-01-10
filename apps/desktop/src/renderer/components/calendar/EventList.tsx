/**
 * EventList Component
 *
 * Renders a scrollable list of EventCards with empty state handling.
 */

import type { CalendarItem } from '@typenote/storage';
import { ScrollArea } from '@typenote/design-system';
import { EventCard } from './EventCard.js';

export interface EventListProps {
  events: CalendarItem[];
  onEventClick: (objectId: string) => void;
}

export function EventList({ events, onEventClick }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground py-8">
        No events
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-2">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} />
        ))}
      </div>
    </ScrollArea>
  );
}
