/**
 * EventList Component Tests
 *
 * Tests for the list component that renders multiple EventCards
 * with scroll support and empty state handling.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EventList } from './EventList.js';
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

describe('EventList', () => {
  it('renders all events', () => {
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000001', title: 'Event 1' }),
      createMockCalendarItem({ id: '01HZXTEST0000000000000002', title: 'Event 2' }),
      createMockCalendarItem({ id: '01HZXTEST0000000000000003', title: 'Event 3' }),
    ];

    render(<EventList events={events} onEventClick={vi.fn()} />);

    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('Event 3')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<EventList events={[]} onEventClick={vi.fn()} />);

    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('calls onEventClick with correct ID when event is clicked', () => {
    const onEventClick = vi.fn();
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000042', title: 'Click Me' }),
    ];

    render(<EventList events={events} onEventClick={onEventClick} />);

    fireEvent.click(screen.getByTestId('event-card-01HZXTEST0000000000000042'));
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick).toHaveBeenCalledWith('01HZXTEST0000000000000042');
  });

  it('calls onEventClick with correct ID for multiple events', () => {
    const onEventClick = vi.fn();
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000001', title: 'Event 1' }),
      createMockCalendarItem({ id: '01HZXTEST0000000000000002', title: 'Event 2' }),
    ];

    render(<EventList events={events} onEventClick={onEventClick} />);

    // Click second event
    fireEvent.click(screen.getByTestId('event-card-01HZXTEST0000000000000002'));
    expect(onEventClick).toHaveBeenCalledWith('01HZXTEST0000000000000002');

    // Click first event
    fireEvent.click(screen.getByTestId('event-card-01HZXTEST0000000000000001'));
    expect(onEventClick).toHaveBeenCalledWith('01HZXTEST0000000000000001');
  });

  it('renders EventCards for each event', () => {
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000001' }),
      createMockCalendarItem({ id: '01HZXTEST0000000000000002' }),
    ];

    render(<EventList events={events} onEventClick={vi.fn()} />);

    expect(screen.getByTestId('event-card-01HZXTEST0000000000000001')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-01HZXTEST0000000000000002')).toBeInTheDocument();
  });
});
