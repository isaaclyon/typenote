/**
 * CalendarDay Component Tests
 *
 * Tests for the individual day cell in the calendar grid.
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalendarDay } from './CalendarDay.js';

afterEach(() => {
  cleanup();
});

describe('CalendarDay', () => {
  const defaultProps = {
    dateKey: '2024-01-15',
    dayOfMonth: 15,
    isToday: false,
    isSelected: false,
    isCurrentMonth: true,
    hasEvents: false,
    onSelect: vi.fn(),
  };

  it('renders the day number', () => {
    render(<CalendarDay {...defaultProps} />);

    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('renders with correct data-testid', () => {
    render(<CalendarDay {...defaultProps} />);

    expect(screen.getByTestId('calendar-day-2024-01-15')).toBeInTheDocument();
  });

  it('shows dot indicator when hasEvents is true', () => {
    render(<CalendarDay {...defaultProps} hasEvents={true} />);

    const dot = screen.getByTestId('calendar-day-2024-01-15').querySelector('.bg-primary');
    expect(dot).toBeInTheDocument();
  });

  it('hides dot indicator when hasEvents is false', () => {
    render(<CalendarDay {...defaultProps} hasEvents={false} />);

    // Check that there is no small dot element
    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    const dot = dayElement.querySelector('.rounded-full.w-1');
    expect(dot).not.toBeInTheDocument();
  });

  it('applies selected styling when isSelected is true', () => {
    render(<CalendarDay {...defaultProps} isSelected={true} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('bg-primary');
    expect(dayElement).toHaveClass('text-primary-foreground');
  });

  it('applies today styling when isToday is true', () => {
    render(<CalendarDay {...defaultProps} isToday={true} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('font-bold');
  });

  it('applies ring styling for today when not selected', () => {
    render(<CalendarDay {...defaultProps} isToday={true} isSelected={false} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('ring-2');
    expect(dayElement).toHaveClass('ring-primary');
  });

  it('does not apply ring styling for today when selected', () => {
    render(<CalendarDay {...defaultProps} isToday={true} isSelected={true} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).not.toHaveClass('ring-2');
  });

  it('applies faded styling for other months', () => {
    render(<CalendarDay {...defaultProps} isCurrentMonth={false} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('text-muted-foreground/50');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<CalendarDay {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('calendar-day-2024-01-15'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('has cursor-pointer class for click indication', () => {
    render(<CalendarDay {...defaultProps} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('cursor-pointer');
  });

  it('has hover styling class', () => {
    render(<CalendarDay {...defaultProps} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('hover:bg-accent');
  });

  it('has correct dimensions for grid layout', () => {
    render(<CalendarDay {...defaultProps} />);

    const dayElement = screen.getByTestId('calendar-day-2024-01-15');
    expect(dayElement).toHaveClass('w-10');
    expect(dayElement).toHaveClass('h-10');
  });
});
