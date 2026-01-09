/**
 * CalendarGrid Component Tests
 *
 * Tests for the calendar grid that displays a full month view.
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalendarGrid } from './CalendarGrid.js';
import type { CalendarItem } from '@typenote/storage';

// Mock the core calendar utilities
vi.mock('@typenote/core', () => ({
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
  getCalendarTodayDateKey: vi.fn(() => '2024-01-15'),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CalendarGrid', () => {
  const defaultProps = {
    viewingMonth: new Date(2024, 0, 1), // January 2024
    selectedDate: null,
    eventsMap: new Map<string, CalendarItem[]>(),
    onDateSelect: vi.fn(),
  };

  it('renders with correct data-testid', () => {
    render(<CalendarGrid {...defaultProps} />);

    expect(screen.getByTestId('calendar-grid')).toBeInTheDocument();
  });

  it('renders 7 day-of-week headers', () => {
    render(<CalendarGrid {...defaultProps} />);

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders 42 day cells (6 weeks)', () => {
    render(<CalendarGrid {...defaultProps} />);

    const grid = screen.getByTestId('calendar-grid');
    // Count all calendar-day elements
    const dayElements = grid.querySelectorAll('[data-testid^="calendar-day-"]');
    expect(dayElements).toHaveLength(42);
  });

  it('highlights today', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Mock returns '2024-01-15' as today
    const todayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(todayElement).toHaveClass('font-bold');
  });

  it('highlights selected date', () => {
    render(<CalendarGrid {...defaultProps} selectedDate="2024-01-20" />);

    const selectedElement = screen.getByTestId('calendar-day-2024-01-20');
    expect(selectedElement).toHaveClass('bg-primary');
  });

  it('shows dots for days with events', () => {
    const mockEvent: CalendarItem = {
      id: 'event-1',
      typeId: 'type-1',
      typeKey: 'Event',
      title: 'Test Event',
      dateInfo: {
        startDate: '2024-01-10T10:00:00.000Z',
        allDay: false,
      },
      properties: {},
      docVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const eventsMap = new Map<string, CalendarItem[]>();
    eventsMap.set('2024-01-10', [mockEvent]);

    render(<CalendarGrid {...defaultProps} eventsMap={eventsMap} />);

    const dayWithEvent = screen.getByTestId('calendar-day-2024-01-10');
    // Check for event indicator dot
    const dot = dayWithEvent.querySelector('.bg-primary');
    expect(dot).toBeInTheDocument();
  });

  it('does not show dots for days without events', () => {
    render(<CalendarGrid {...defaultProps} />);

    const dayWithoutEvent = screen.getByTestId('calendar-day-2024-01-10');
    // Should not have the small event indicator dot
    const dot = dayWithoutEvent.querySelector('.rounded-full.w-1');
    expect(dot).not.toBeInTheDocument();
  });

  it('calls onDateSelect with correct dateKey when day is clicked', () => {
    const onDateSelect = vi.fn();
    render(<CalendarGrid {...defaultProps} onDateSelect={onDateSelect} />);

    fireEvent.click(screen.getByTestId('calendar-day-2024-01-20'));

    expect(onDateSelect).toHaveBeenCalledWith('2024-01-20');
  });

  it('applies faded styling to days from previous month', () => {
    render(<CalendarGrid {...defaultProps} />);

    // December 31 should be faded
    const prevMonthDay = screen.getByTestId('calendar-day-2023-12-31');
    expect(prevMonthDay).toHaveClass('text-muted-foreground/50');
  });

  it('applies faded styling to days from next month', () => {
    render(<CalendarGrid {...defaultProps} />);

    // February 1 should be faded
    const nextMonthDay = screen.getByTestId('calendar-day-2024-02-01');
    expect(nextMonthDay).toHaveClass('text-muted-foreground/50');
  });

  it('does not apply faded styling to days in current month', () => {
    render(<CalendarGrid {...defaultProps} />);

    const currentMonthDay = screen.getByTestId('calendar-day-2024-01-15');
    expect(currentMonthDay).not.toHaveClass('text-muted-foreground/50');
  });
});
