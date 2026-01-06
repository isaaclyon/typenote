/**
 * useDailyNoteInfo Hook Tests
 *
 * Tests for the hook that detects if an object is a daily note
 * and extracts its date_key for navigation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyNoteInfo } from './useDailyNoteInfo.js';

// Mock window.typenoteAPI
const mockGetObject = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  // @ts-expect-error - Mocking global window.typenoteAPI
  window.typenoteAPI = {
    getObject: mockGetObject,
  };
});

describe('useDailyNoteInfo', () => {
  it('returns isDailyNote: true and dateKey for DailyNote objects', async () => {
    mockGetObject.mockResolvedValue({
      success: true,
      result: {
        id: 'obj-123',
        typeKey: 'DailyNote',
        properties: { date_key: '2024-01-15' },
      },
    });

    const { result } = renderHook(() => useDailyNoteInfo('obj-123'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDailyNote).toBe(true);
    expect(result.current.dateKey).toBe('2024-01-15');
  });

  it('returns isDailyNote: false for non-DailyNote objects', async () => {
    mockGetObject.mockResolvedValue({
      success: true,
      result: {
        id: 'obj-456',
        typeKey: 'Page',
        properties: {},
      },
    });

    const { result } = renderHook(() => useDailyNoteInfo('obj-456'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDailyNote).toBe(false);
    expect(result.current.dateKey).toBeNull();
  });

  it('handles API error gracefully', async () => {
    mockGetObject.mockResolvedValue({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Object not found' },
    });

    const { result } = renderHook(() => useDailyNoteInfo('nonexistent'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDailyNote).toBe(false);
    expect(result.current.dateKey).toBeNull();
  });

  it('handles null result gracefully', async () => {
    mockGetObject.mockResolvedValue({
      success: true,
      result: null,
    });

    const { result } = renderHook(() => useDailyNoteInfo('deleted-obj'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isDailyNote).toBe(false);
    expect(result.current.dateKey).toBeNull();
  });

  it('refetches when objectId changes', async () => {
    mockGetObject
      .mockResolvedValueOnce({
        success: true,
        result: { typeKey: 'DailyNote', properties: { date_key: '2024-01-15' } },
      })
      .mockResolvedValueOnce({
        success: true,
        result: { typeKey: 'DailyNote', properties: { date_key: '2024-01-16' } },
      });

    const { result, rerender } = renderHook(({ objectId }) => useDailyNoteInfo(objectId), {
      initialProps: { objectId: 'obj-1' },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetObject).toHaveBeenCalledWith('obj-1');
    expect(result.current.dateKey).toBe('2024-01-15');

    rerender({ objectId: 'obj-2' });

    await waitFor(() => expect(mockGetObject).toHaveBeenCalledWith('obj-2'));
    await waitFor(() => expect(result.current.dateKey).toBe('2024-01-16'));
  });
});
