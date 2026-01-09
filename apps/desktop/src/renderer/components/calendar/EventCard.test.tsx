/**
 * EventCard Component Tests
 *
 * Tests for the calendar event card component that displays individual
 * calendar items with title, type badge, and time information.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EventCard } from './EventCard.js';
import type { CalendarItem } from '@typenote/storage';

afterEach(() => {
  cleanup();
});

function createMockCalendarItem(overrides: Partial<CalendarItem> = {}): CalendarItem {
  return {
    id: '01HZXTEST0000000000000001',
    typeId: '01HZXTYPE0000000000000001',
    typeKey: 'Event',
    title: 'Test Event',
    dateInfo: {
      startDate: '2024-01-15T14:00:00.000Z',
      endDate: '2024-01-15T15:00:00.000Z',
      allDay: false,
    },
    properties: {},
    docVersion: 1,
    createdAt: new Date('2024-01-15T10:00:00.000Z'),
    updatedAt: new Date('2024-01-15T10:00:00.000Z'),
    ...overrides,
  };
}

describe('EventCard', () => {
  it('renders event title', () => {
    const event = createMockCalendarItem({ title: 'Team Meeting' });
    render(<EventCard event={event} onClick={vi.fn()} />);

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
  });

  it('shows type badge with correct typeKey', () => {
    const event = createMockCalendarItem({ typeKey: 'Task' });
    render(<EventCard event={event} onClick={vi.fn()} />);

    const badge = screen.getByText('Task');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-secondary');
  });

  it('shows type badge for DailyNote', () => {
    const event = createMockCalendarItem({ typeKey: 'DailyNote' });
    render(<EventCard event={event} onClick={vi.fn()} />);

    expect(screen.getByText('DailyNote')).toBeInTheDocument();
  });

  it('shows time range for timed events', () => {
    const event = createMockCalendarItem({
      dateInfo: {
        startDate: '2024-01-15T14:00:00.000Z',
        endDate: '2024-01-15T15:00:00.000Z',
        allDay: false,
      },
    });
    render(<EventCard event={event} onClick={vi.fn()} />);

    // Time should be displayed (format depends on locale but should include AM/PM or 24h)
    // Check for presence of time-like text
    const timeElement = screen.getByTestId(`event-card-${event.id}`);
    expect(timeElement.textContent).toMatch(/\d{1,2}:\d{2}/);
  });

  it('shows "All day" for all-day events', () => {
    const event = createMockCalendarItem({
      dateInfo: {
        startDate: '2024-01-15',
        allDay: true,
      },
    });
    render(<EventCard event={event} onClick={vi.fn()} />);

    expect(screen.getByText('All day')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    const event = createMockCalendarItem();
    render(<EventCard event={event} onClick={onClick} />);

    fireEvent.click(screen.getByTestId(`event-card-${event.id}`));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has correct data-testid attribute', () => {
    const event = createMockCalendarItem({ id: '01HZXTEST0000000000000042' });
    render(<EventCard event={event} onClick={vi.fn()} />);

    expect(screen.getByTestId('event-card-01HZXTEST0000000000000042')).toBeInTheDocument();
  });

  it('shows time for event without end date', () => {
    const event = createMockCalendarItem({
      dateInfo: {
        startDate: '2024-01-15T09:30:00.000Z',
        allDay: false,
      },
    });
    render(<EventCard event={event} onClick={vi.fn()} />);

    // Should show just the start time when no end date
    const timeElement = screen.getByTestId(`event-card-${event.id}`);
    expect(timeElement.textContent).toMatch(/\d{1,2}:\d{2}/);
  });
});
