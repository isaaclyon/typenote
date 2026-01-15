/**
 * CalendarView Navigation Tests
 *
 * Tests for month navigation, date selection, and event navigation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CalendarView } from './CalendarView.js';
import type { CalendarItem } from '@typenote/storage';

// vi.mock must be at module scope with inline factory (no external imports)
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

// Create mock functions for IPC
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

describe('CalendarView date selection', () => {
  it('selects today by default', async () => {
    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      const todayElement = screen.getByTestId('calendar-day-2024-01-15');
      expect(todayElement).toHaveClass('bg-primary');
    });
  });

  it('shows selected day events in sidebar', async () => {
    const event = createMockEvent({
      id: 'event-1',
      title: 'Meeting',
      dateInfo: { startDate: '2024-01-15T10:00:00.000Z', allDay: false },
    });

    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Meeting')).toBeInTheDocument();
    });
  });

  it('updates sidebar when different date is selected', async () => {
    const event15 = createMockEvent({
      id: 'event-1',
      title: 'Event on 15th',
      dateInfo: { startDate: '2024-01-15T10:00:00.000Z', allDay: false },
    });

    const event20 = createMockEvent({
      id: 'event-2',
      title: 'Event on 20th',
      dateInfo: { startDate: '2024-01-20T14:00:00.000Z', allDay: false },
    });

    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event15, event20] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Event on 15th')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('calendar-day-2024-01-20'));

    await waitFor(() => {
      expect(screen.getByText('Event on 20th')).toBeInTheDocument();
    });
  });
});

describe('CalendarView month navigation', () => {
  it('navigates to previous month when prev button clicked', async () => {
    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText('Previous month'));

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
    });
  });

  it('navigates to next month when next button clicked', async () => {
    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText('Next month'));

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
    });
  });

  it('returns to current month when Today button clicked', async () => {
    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

    render(<CalendarView {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByLabelText('Next month'));

    await waitFor(() => {
      expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByLabelText('Today'));

    await waitFor(() => {
      const todayElement = screen.getByTestId('calendar-day-2024-01-15');
      expect(todayElement).toHaveClass('bg-primary');
    });
  });
});

describe('CalendarView event navigation', () => {
  it('calls onNavigate when event is clicked', async () => {
    const onNavigate = vi.fn();
    const event = createMockEvent({
      id: 'event-123',
      title: 'Clickable Event',
      dateInfo: { startDate: '2024-01-15T10:00:00.000Z', allDay: false },
    });

    mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event] });

    render(<CalendarView onNavigate={onNavigate} />);

    await waitFor(() => {
      expect(screen.getByText('Clickable Event')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clickable Event'));

    expect(onNavigate).toHaveBeenCalledWith('event-123');
  });
});
