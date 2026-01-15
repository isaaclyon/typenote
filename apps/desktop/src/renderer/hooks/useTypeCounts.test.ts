/**
 * Tests for useTypeCounts hook
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTypeCounts } from './useTypeCounts.js';

describe('useTypeCounts', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should compute type counts from listObjects', async () => {
    // Mock objects with different types
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [
        { id: '1', title: 'Page 1', typeId: 't1', typeKey: 'Page', updatedAt: new Date() },
        { id: '2', title: 'Page 2', typeId: 't1', typeKey: 'Page', updatedAt: new Date() },
        { id: '3', title: 'Task 1', typeId: 't2', typeKey: 'Task', updatedAt: new Date() },
        { id: '4', title: 'Daily 1', typeId: 't3', typeKey: 'DailyNote', updatedAt: new Date() },
      ],
    });

    const { result } = renderHook(() => useTypeCounts());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.counts).toEqual({});

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have counts grouped by typeKey
    expect(result.current.counts).toEqual({
      Page: 2,
      Task: 1,
      DailyNote: 1,
    });
    expect(result.current.error).toBeNull();
  });

  it('should return empty counts when no objects exist', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useTypeCounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.counts).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('should handle IPC error response', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'Failed to fetch objects' },
    });

    const { result } = renderHook(() => useTypeCounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.counts).toEqual({});
    expect(result.current.error).toBe('Failed to fetch objects');
  });

  it('should handle IPC exception', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTypeCounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.counts).toEqual({});
    expect(result.current.error).toBe('Network error');
  });

  it('should provide working refetch function', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [{ id: '1', title: 'Page', typeId: 't1', typeKey: 'Page', updatedAt: new Date() }],
    });

    const { result } = renderHook(() => useTypeCounts());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to verify refetch calls it again
    vi.clearAllMocks();

    // Call refetch
    await result.current.refetch();

    expect(window.typenoteAPI.listObjects).toHaveBeenCalledTimes(1);
  });
});
