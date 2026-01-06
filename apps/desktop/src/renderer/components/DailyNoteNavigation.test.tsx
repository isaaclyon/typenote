/**
 * DailyNoteNavigation Component Tests
 *
 * Tests for the navigation UI that allows browsing between daily notes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { DailyNoteNavigation } from './DailyNoteNavigation.js';

// Mock window.typenoteAPI
const mockGetOrCreateDailyNoteByDate = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  // @ts-expect-error - Mocking global window.typenoteAPI
  window.typenoteAPI = {
    getOrCreateDailyNoteByDate: mockGetOrCreateDailyNoteByDate,
  };
});

afterEach(() => {
  cleanup();
});

describe('DailyNoteNavigation', () => {
  it('renders prev, today, and next buttons', () => {
    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /prev/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('displays the formatted date', () => {
    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={vi.fn()} />);

    // Should show formatted date like "Jan 15, 2024"
    expect(screen.getByText(/Jan.*15.*2024/)).toBeInTheDocument();
  });

  it('calls onNavigate with new objectId when clicking prev', async () => {
    const onNavigate = vi.fn();
    mockGetOrCreateDailyNoteByDate.mockResolvedValue({
      success: true,
      result: { dailyNote: { id: 'prev-note-id' } },
    });

    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /prev/i }));

    await waitFor(() => {
      expect(mockGetOrCreateDailyNoteByDate).toHaveBeenCalledWith('2024-01-14');
    });
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('prev-note-id');
    });
  });

  it('calls onNavigate with new objectId when clicking next', async () => {
    const onNavigate = vi.fn();
    mockGetOrCreateDailyNoteByDate.mockResolvedValue({
      success: true,
      result: { dailyNote: { id: 'next-note-id' } },
    });

    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(mockGetOrCreateDailyNoteByDate).toHaveBeenCalledWith('2024-01-16');
    });
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('next-note-id');
    });
  });

  it('navigates to today when clicking today button', async () => {
    const onNavigate = vi.fn();
    const today = new Date().toISOString().slice(0, 10);
    mockGetOrCreateDailyNoteByDate.mockResolvedValue({
      success: true,
      result: { dailyNote: { id: 'today-note-id' } },
    });

    // Render with a past date
    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /today/i }));

    await waitFor(() => {
      expect(mockGetOrCreateDailyNoteByDate).toHaveBeenCalledWith(today);
    });
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('today-note-id');
    });
  });

  it('disables today button when already viewing today', () => {
    const today = new Date().toISOString().slice(0, 10);
    render(<DailyNoteNavigation dateKey={today} onNavigate={vi.fn()} />);

    expect(screen.getByRole('button', { name: /today/i })).toBeDisabled();
  });

  it('does not call onNavigate when API fails', async () => {
    const onNavigate = vi.fn();
    mockGetOrCreateDailyNoteByDate.mockResolvedValue({
      success: false,
      error: { code: 'ERROR', message: 'Failed' },
    });

    render(<DailyNoteNavigation dateKey="2024-01-15" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /prev/i }));

    await waitFor(() => {
      expect(mockGetOrCreateDailyNoteByDate).toHaveBeenCalled();
    });

    // Should not navigate on failure
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('handles month boundary navigation', async () => {
    const onNavigate = vi.fn();
    mockGetOrCreateDailyNoteByDate.mockResolvedValue({
      success: true,
      result: { dailyNote: { id: 'jan-31-note' } },
    });

    render(<DailyNoteNavigation dateKey="2024-02-01" onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /prev/i }));

    await waitFor(() => {
      expect(mockGetOrCreateDailyNoteByDate).toHaveBeenCalledWith('2024-01-31');
    });
  });
});
