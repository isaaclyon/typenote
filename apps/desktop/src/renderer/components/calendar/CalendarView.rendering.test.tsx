/**
 * CalendarView Rendering Tests
 *
 * Tests for basic rendering of CalendarView and its child components.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CalendarView } from './CalendarView.js';

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

const defaultProps = { onNavigate: vi.fn() };

beforeEach(() => {
  setupTypenoteAPIMock();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CalendarView rendering', () => {
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
