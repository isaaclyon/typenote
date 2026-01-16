import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useObjectsCreatedOnDate } from './useObjectsCreatedOnDate.js';

describe('useObjectsCreatedOnDate', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('fetches objects created on the specified date', async () => {
    const mockData = [{ id: '1', title: 'Note 1', typeIcon: 'FileText', typeColor: '#6495ED' }];
    window.typenoteAPI.getObjectsCreatedOnDate = vi.fn().mockResolvedValue({
      success: true,
      result: mockData,
    });

    const { result } = renderHook(() => useObjectsCreatedOnDate('2026-01-15'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.objects).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toEqual(mockData);
    expect(window.typenoteAPI.getObjectsCreatedOnDate).toHaveBeenCalledWith('2026-01-15');
  });

  it('refetches when dateKey changes', async () => {
    window.typenoteAPI.getObjectsCreatedOnDate = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result, rerender } = renderHook(({ dateKey }) => useObjectsCreatedOnDate(dateKey), {
      initialProps: { dateKey: '2026-01-15' },
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(window.typenoteAPI.getObjectsCreatedOnDate).toHaveBeenCalledTimes(1);

    rerender({ dateKey: '2026-01-16' });

    await waitFor(() =>
      expect(window.typenoteAPI.getObjectsCreatedOnDate).toHaveBeenCalledTimes(2)
    );
    expect(window.typenoteAPI.getObjectsCreatedOnDate).toHaveBeenLastCalledWith('2026-01-16');
  });

  it('returns empty array on error', async () => {
    window.typenoteAPI.getObjectsCreatedOnDate = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'ERROR', message: 'Failed' },
    });

    const { result } = renderHook(() => useObjectsCreatedOnDate('2026-01-15'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.objects).toEqual([]);
  });
});
