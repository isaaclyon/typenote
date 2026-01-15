/**
 * CalendarSidebar Component Tests
 *
 * Tests for the sidebar component that displays events for a selected date
 * with loading, error, and empty states.
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CalendarSidebar } from './CalendarSidebar.js';
import type { CalendarItem } from '@typenote/storage';
import type { LoadState } from './CalendarSidebar.js';

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

describe('CalendarSidebar', () => {
  it('shows formatted date header', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: [] };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    // Should show formatted date like "Monday, January 15"
    // The exact format may vary by locale, so check for key parts
    const sidebar = screen.getByTestId('calendar-sidebar');
    expect(sidebar.textContent).toMatch(/January/);
    expect(sidebar.textContent).toMatch(/15/);
  });

  it('shows day of week in header', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: [] };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    // January 15, 2024 is a Monday
    const sidebar = screen.getByTestId('calendar-sidebar');
    expect(sidebar.textContent).toMatch(/Monday/);
  });

  it('shows loading state', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loading' };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('shows error state with message', () => {
    const loadState: LoadState<CalendarItem[]> = {
      status: 'error',
      message: 'Failed to load events',
    };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText(/Failed to load events/)).toBeInTheDocument();
  });

  it('shows events when loaded', () => {
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000001', title: 'Team Meeting' }),
      createMockCalendarItem({ id: '01HZXTEST0000000000000002', title: 'Lunch' }),
    ];
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: events };

    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={events}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: [] };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = vi.fn();
    const events: CalendarItem[] = [
      createMockCalendarItem({ id: '01HZXTEST0000000000000042', title: 'Click Me' }),
    ];
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: events };

    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={events}
        loadState={loadState}
        onEventClick={onEventClick}
      />
    );

    fireEvent.click(screen.getByTestId('event-card-01HZXTEST0000000000000042'));
    expect(onEventClick).toHaveBeenCalledWith('01HZXTEST0000000000000042');
  });

  it('has correct data-testid attribute', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: [] };
    render(
      <CalendarSidebar
        selectedDate="2024-01-15"
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('calendar-sidebar')).toBeInTheDocument();
  });

  it('shows placeholder when no date selected', () => {
    const loadState: LoadState<CalendarItem[]> = { status: 'loaded', data: [] };
    render(
      <CalendarSidebar
        selectedDate={null}
        events={[]}
        loadState={loadState}
        onEventClick={vi.fn()}
      />
    );

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });
});
