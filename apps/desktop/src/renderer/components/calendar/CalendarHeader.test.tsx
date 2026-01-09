/**
 * CalendarHeader Component Tests
 *
 * Tests for the calendar header with month/year display and navigation buttons.
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalendarHeader } from './CalendarHeader.js';

// Mock the core calendar utilities
vi.mock('@typenote/core', () => ({
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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CalendarHeader', () => {
  const defaultProps = {
    viewingMonth: new Date(2024, 0, 1), // January 2024
    onPrevMonth: vi.fn(),
    onNextMonth: vi.fn(),
    onToday: vi.fn(),
  };

  it('renders with correct data-testid', () => {
    render(<CalendarHeader {...defaultProps} />);

    expect(screen.getByTestId('calendar-header')).toBeInTheDocument();
  });

  it('displays formatted month and year', () => {
    render(<CalendarHeader {...defaultProps} />);

    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('displays different month and year when viewingMonth changes', () => {
    render(<CalendarHeader {...defaultProps} viewingMonth={new Date(2024, 5, 1)} />);

    expect(screen.getByText('June 2024')).toBeInTheDocument();
  });

  it('calls onPrevMonth when previous button is clicked', () => {
    const onPrevMonth = vi.fn();
    render(<CalendarHeader {...defaultProps} onPrevMonth={onPrevMonth} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevButton);

    expect(onPrevMonth).toHaveBeenCalledTimes(1);
  });

  it('calls onNextMonth when next button is clicked', () => {
    const onNextMonth = vi.fn();
    render(<CalendarHeader {...defaultProps} onNextMonth={onNextMonth} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    expect(onNextMonth).toHaveBeenCalledTimes(1);
  });

  it('calls onToday when Today button is clicked', () => {
    const onToday = vi.fn();
    render(<CalendarHeader {...defaultProps} onToday={onToday} />);

    const todayButton = screen.getByRole('button', { name: /today/i });
    fireEvent.click(todayButton);

    expect(onToday).toHaveBeenCalledTimes(1);
  });

  it('renders previous month button with chevron icon', () => {
    render(<CalendarHeader {...defaultProps} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton).toBeInTheDocument();
  });

  it('renders next month button with chevron icon', () => {
    render(<CalendarHeader {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeInTheDocument();
  });

  it('renders Today button', () => {
    render(<CalendarHeader {...defaultProps} />);

    const todayButton = screen.getByRole('button', { name: /today/i });
    expect(todayButton).toBeInTheDocument();
  });
});
