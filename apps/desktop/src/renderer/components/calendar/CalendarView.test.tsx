/**
 * CalendarView Component Tests
 *
 * Tests for the main CalendarView container that orchestrates all calendar components.
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { CalendarView } from './CalendarView.js';
import type { CalendarItem } from '@typenote/storage';

// Mock @typenote/core utilities
vi.mock('@typenote/core', () => ({
  getMonthDateRange: vi.fn((year: number, month: number) => ({
    startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
    endDate: `${year}-${String(month + 1).padStart(2, '0')}-28`,
  })),
  getMonthGridDates: vi.fn(() => {
    // Generate 42 dates for January 2024 grid
    const dates: string[] = [];
    // Dec 31 2023 - Jan 6 2024 (week 1)
    dates.push('2023-12-31');
    for (let d = 1; d <= 6; d++) {
      dates.push(`2024-01-0${d}`);
    }
    // Jan 7-13 (week 2)
    for (let d = 7; d <= 13; d++) {
      dates.push(d < 10 ? `2024-01-0${d}` : `2024-01-${d}`);
    }
    // Jan 14-20 (week 3)
    for (let d = 14; d <= 20; d++) {
      dates.push(`2024-01-${d}`);
    }
    // Jan 21-27 (week 4)
    for (let d = 21; d <= 27; d++) {
      dates.push(`2024-01-${d}`);
    }
    // Jan 28-31 + Feb 1-3 (week 5)
    for (let d = 28; d <= 31; d++) {
      dates.push(`2024-01-${d}`);
    }
    dates.push('2024-02-01', '2024-02-02', '2024-02-03');
    // Feb 4-10 (week 6)
    for (let d = 4; d <= 10; d++) {
      dates.push(d < 10 ? `2024-02-0${d}` : `2024-02-${d}`);
    }
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

// Create mock functions
const mockGetEventsInDateRange = vi.fn();
const mockOnEvent = vi.fn(() => vi.fn()); // Returns unsubscribe function

// Setup window.typenoteAPI mock
beforeEach(() => {
  // Directly assign to window instead of using stubGlobal
  // This preserves other window properties like document
  // Use type assertion to allow partial mock
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

  // Default mock resolves to IpcSuccess with empty array
  mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Helper to create mock CalendarItem
function createMockEvent(overrides: Partial<CalendarItem> = {}): CalendarItem {
  return {
    id: 'event-1',
    typeId: 'type-1',
    typeKey: 'Event',
    title: 'Test Event',
    dateInfo: {
      startDate: '2024-01-15T10:00:00.000Z',
      allDay: false,
    },
    properties: {},
    docVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CalendarView', () => {
  const defaultProps = {
    onNavigate: vi.fn(),
  };

  describe('rendering', () => {
    it('renders with correct data-testid', async () => {
      render(<CalendarView {...defaultProps} />);

      expect(screen.getByTestId('calendar-view')).toBeInTheDocument();
    });

    it('renders CalendarHeader', async () => {
      render(<CalendarView {...defaultProps} />);

      expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
    });

    it('renders CalendarGrid', async () => {
      render(<CalendarView {...defaultProps} />);

      expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
    });

    it('renders CalendarSidebar', async () => {
      render(<CalendarView {...defaultProps} />);

      expect(screen.getByTestId('calendar-sidebar')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('fetches events on mount', async () => {
      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalled();
      });
    });

    it('fetches events when month changes', async () => {
      render(<CalendarView {...defaultProps} />);

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(1);
      });

      // Click next month button
      fireEvent.click(screen.getByLabelText('Next month'));

      // Should fetch again for the new month
      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('loading states', () => {
    it('shows loading state initially', () => {
      // Use a promise that never resolves to keep loading state
      mockGetEventsInDateRange.mockReturnValue(new Promise(() => {}));

      render(<CalendarView {...defaultProps} />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('shows error state on fetch failure (exception)', async () => {
      mockGetEventsInDateRange.mockRejectedValue(new Error('Network error'));

      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });

    it('shows error state on IPC error response', async () => {
      mockGetEventsInDateRange.mockResolvedValue({
        success: false,
        error: { code: 'DB_ERROR', message: 'Database connection failed' },
      });

      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
        expect(screen.getByText(/Database connection failed/)).toBeInTheDocument();
      });
    });
  });

  describe('date selection', () => {
    it('selects today by default', async () => {
      mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        // Today is mocked as 2024-01-15
        const todayElement = screen.getByTestId('calendar-day-2024-01-15');
        expect(todayElement).toHaveClass('bg-primary');
      });
    });

    it('shows selected day events in sidebar', async () => {
      const event = createMockEvent({
        id: 'event-1',
        title: 'Meeting',
        dateInfo: {
          startDate: '2024-01-15T10:00:00.000Z',
          allDay: false,
        },
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
        dateInfo: {
          startDate: '2024-01-15T10:00:00.000Z',
          allDay: false,
        },
      });

      const event20 = createMockEvent({
        id: 'event-2',
        title: 'Event on 20th',
        dateInfo: {
          startDate: '2024-01-20T14:00:00.000Z',
          allDay: false,
        },
      });

      mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event15, event20] });

      render(<CalendarView {...defaultProps} />);

      // Wait for initial load with today (15th) selected
      await waitFor(() => {
        expect(screen.getByText('Event on 15th')).toBeInTheDocument();
      });

      // Select Jan 20
      fireEvent.click(screen.getByTestId('calendar-day-2024-01-20'));

      await waitFor(() => {
        expect(screen.getByText('Event on 20th')).toBeInTheDocument();
      });
    });
  });

  describe('month navigation', () => {
    it('navigates to previous month when prev button clicked', async () => {
      mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [] });

      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByLabelText('Previous month'));

      // addMonths is called with -1
      await waitFor(() => {
        // Should have fetched events for the new month
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

      // Wait for initial render
      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalled();
      });

      // Navigate away first
      fireEvent.click(screen.getByLabelText('Next month'));

      await waitFor(() => {
        expect(mockGetEventsInDateRange).toHaveBeenCalledTimes(2);
      });

      // Click Today button
      fireEvent.click(screen.getByLabelText('Today'));

      // Should select today's date again
      await waitFor(() => {
        const todayElement = screen.getByTestId('calendar-day-2024-01-15');
        expect(todayElement).toHaveClass('bg-primary');
      });
    });
  });

  describe('event navigation', () => {
    it('calls onNavigate when event is clicked', async () => {
      const onNavigate = vi.fn();
      const event = createMockEvent({
        id: 'event-123',
        title: 'Clickable Event',
        dateInfo: {
          startDate: '2024-01-15T10:00:00.000Z',
          allDay: false,
        },
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

  describe('events grouping', () => {
    it('groups events by date for the grid', async () => {
      const event1 = createMockEvent({
        id: 'event-1',
        title: 'Event 1',
        dateInfo: {
          startDate: '2024-01-10T10:00:00.000Z',
          allDay: false,
        },
      });

      const event2 = createMockEvent({
        id: 'event-2',
        title: 'Event 2',
        dateInfo: {
          startDate: '2024-01-10T14:00:00.000Z',
          allDay: false,
        },
      });

      mockGetEventsInDateRange.mockResolvedValue({ success: true, result: [event1, event2] });

      render(<CalendarView {...defaultProps} />);

      await waitFor(() => {
        // Jan 10 should show event indicator
        const dayWithEvents = screen.getByTestId('calendar-day-2024-01-10');
        const dot = dayWithEvents.querySelector('.bg-primary');
        expect(dot).toBeInTheDocument();
      });
    });
  });
});
