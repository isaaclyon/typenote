/**
 * CalendarView Data Fetching Tests
 *
 * Tests for event fetching behavior and events grouping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CalendarView } from './CalendarView.js';
import type { CalendarItem } from '@typenote/storage';

// vi.mock must be at module scope with inline factory
vi.mock('@typenote/core', () => ({
  getMonthDateRange: vi.fn((year: number, month: number) => ({
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month + 1).padStart(2, '0')}-28`,
  })),
  getMonthGridDates: vi.fn(() => {
    const dates: string[] = [];
    dates.push('2023-12-31');
    for (let d = 1; d <= 6; d++) dates.push(`2024-01-0${d}`);
    for (let d = 7; d <= 13; d++) dates.push(d < 10 ? `2024-01-0${d}` : `2024-01-${d}`);
    for (let d = 14; d <= 20; d++) dates.push(`2024-01-${d}`);
    for (let d = 21; d <= 27; d++) dates.push(`2024-01-${d}`);
    for (let d = 28; d <= 31; d++) dates.push(`2024-01-${d}`);
    dates.push('2024-02-01', '2024-02-02', '2024-02-03');
    for (let d = 4; d <= 10; d++) dates.push(d < 10 ? `2024-02-0${d}` : `2024-02-${d}`);
    return dates;
  }),
  addMonths: vi.fn((date: Date, count: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + count);
    return result;
  }),
  getCalendarTodayDateKey: vi.fn(() => '2024-01-15'),
  formatMonthYear: vi.fn((date: Date) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }),
}));

const mockGetEventsInDateRange = vi.fn();
const mockOnEvent = vi.fn(() => vi.fn());

function setupTypenoteAPIMock() {
  (
    window as unknown as {
      typenoteAPI: {
        getEventsInDateRange: typeof mockGetEventsInDateRange;
        onEvent: typeof mockOnEvent;
      };
    }
  ).typenoteAPI = {
    getEventsInDateRange: mockGetEventsInDateRange,
    onEvent: mockOnEvent,
  };
  mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });
}

function createMockEvent(overrides: Partial<CalendarItem> = {}): CalendarItem {
  return {
    id: 'event-1',
    typeId: 'type-1',
    typeKey: 'Event',
    title: 'Test Event',
    dateInfo: { startDate: '2024-01-15T10:00:00.000Z', allDay: false },
    properties: {},
    docVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const defaultProps = { onNavigate: vi.fn() };

beforeEach(() => {
  setupTypenoteAPIMock();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CalendarView data fetching', () => {
  it('fetches events on mount', async () => {
    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalled();
    });
  });

  it('fetches events when month changes', async () => {
    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByLabelText('Next month'));

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
    });
  });
});

describe('CalendarView events grouping', () => {
  it('groups events by date for the grid', async () => {
    const event1 = createMockEvent({
      id: 'event-1',
      title: 'Event 1',
      dateInfo: { startDate: '2024-01-10T10:00:00.000Z', allDay: false },
    });

    const event2 = createMockEvent({
      id: 'event-2',
      title: 'Event 2',
      dateInfo: { startDate: '2024-01-10T14:00:00.000Z', allDay: false },
    });

    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event1, event2] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      const dayWithEvents = screen.getByTestId('calendar-day-2024-01-10');
      const dot = dayWithEvents.querySelector('.bg-primary');
      expect(dot).toBeInTheDocument();
    });
  });
});
