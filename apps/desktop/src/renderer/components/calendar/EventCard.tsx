/**
 * EventCard Component
 *
 * Displays a single calendar event with title, type badge, and time information.
 */

import type { CalendarItem } from '@typenote/storage';
import { cn } from '../../lib/utils.js';
import { Card, CardHeader, CardTitle } from '@typenote/design-system';

export interface EventCardProps {
  event: CalendarItem;
  onClick: () => void;
}

/**
 * Format a time string for display (e.g., "2:00 PM")
 */
function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format the time display for an event
 */
function getTimeDisplay(dateInfo: CalendarItem['dateInfo']): string {
  if (dateInfo.allDay) {
    return 'All day';
  }

  const startTime = formatTime(dateInfo.startDate);

  if (dateInfo.endDate) {
    const endTime = formatTime(dateInfo.endDate);
    return `${startTime} - ${endTime}`;
  }

  return startTime;
}

export function EventCard({ event, onClick }: EventCardProps) {
  return (
    <Card
      className={cn('cursor-pointer hover:bg-accent transition-colors')}
      onClick={onClick}
      data-testid={`event-card-${event.id}`}
    >
      <CardHeader className="p-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="truncate text-sm">{event.title}</CardTitle>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded shrink-0">
            {event.typeKey}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{getTimeDisplay(event.dateInfo)}</div>
      </CardHeader>
    </Card>
  );
}
