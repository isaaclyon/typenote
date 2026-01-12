/**
 * Tests for useBacklinks hook
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { BacklinkResult } from '@typenote/storage';
import { useBacklinks } from './useBacklinks.js';

describe('useBacklinks', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch backlinks on mount', async () => {
    const mockBacklinks: BacklinkResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Daily Note - 2026-01-10',
        targetBlockId: null,
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    // Mock successful IPC response
    window.typenoteAPI.getBacklinks = vi.fn().mockResolvedValue({
      success: true,
      result: mockBacklinks,
    });

    const { result } = renderHook(() => useBacklinks({ objectId: 'test-id' }));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.backlinks).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have backlinks after fetch
    expect(result.current.backlinks).toEqual(mockBacklinks);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getBacklinks).toHaveBeenCalledWith('test-id');
  });

  it('should handle IPC error response', async () => {
    // Mock IPC error (unsuccessful response)
    window.typenoteAPI.getBacklinks = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Object not found' },
    });

    const { result } = renderHook(() => useBacklinks({ objectId: 'test-id' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.backlinks).toEqual([]);
    expect(result.current.error).toBe('Object not found');
  });

  it('should handle IPC exception', async () => {
    // Mock IPC throwing an exception
    window.typenoteAPI.getBacklinks = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBacklinks({ objectId: 'test-id' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.backlinks).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch when objectId changes', async () => {
    const mockBacklinks1: BacklinkResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note 1',
        targetBlockId: null,
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    const mockBacklinks2: BacklinkResult[] = [
      {
        sourceBlockId: 'block-2',
        sourceObjectId: 'obj-2',
        sourceObjectTitle: 'Note 2',
        targetBlockId: null,
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getBacklinks = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        result: mockBacklinks1,
      })
      .mockResolvedValueOnce({
        success: true,
        result: mockBacklinks2,
      });

    const { result, rerender } = renderHook(({ objectId }) => useBacklinks({ objectId }), {
      initialProps: { objectId: 'obj-1' },
    });

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.backlinks).toEqual(mockBacklinks1);

    // Change objectId
    rerender({ objectId: 'obj-2' });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.backlinks).toEqual(mockBacklinks2);
    expect(window.typenoteAPI.getBacklinks).toHaveBeenCalledTimes(2);
  });

  it('should not fetch when enabled is false', async () => {
    window.typenoteAPI.getBacklinks = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useBacklinks({ objectId: 'test-id', enabled: false }));

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.backlinks).toEqual([]);
    expect(window.typenoteAPI.getBacklinks).not.toHaveBeenCalled();
  });

  it('should provide working refetch function', async () => {
    const mockBacklinks: BacklinkResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note',
        targetBlockId: null,
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getBacklinks = vi.fn().mockResolvedValue({
      success: true,
      result: mockBacklinks,
    });

    const { result } = renderHook(() => useBacklinks({ objectId: 'test-id' }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to verify refetch calls it again
    vi.clearAllMocks();

    // Call refetch
    await result.current.refetch();

    expect(window.typenoteAPI.getBacklinks).toHaveBeenCalledWith('test-id');
  });

  it('should start fetch when enabled changes from false to true', async () => {
    const mockBacklinks: BacklinkResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note',
        targetBlockId: null,
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getBacklinks = vi.fn().mockResolvedValue({
      success: true,
      result: mockBacklinks,
    });

    const { result, rerender } = renderHook(
      ({ enabled }) => useBacklinks({ objectId: 'test-id', enabled }),
      { initialProps: { enabled: false } }
    );

    // Should not fetch initially
    expect(result.current.isLoading).toBe(false);
    expect(window.typenoteAPI.getBacklinks).not.toHaveBeenCalled();

    // Enable fetching
    rerender({ enabled: true });

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.backlinks).toEqual(mockBacklinks);
    expect(window.typenoteAPI.getBacklinks).toHaveBeenCalledWith('test-id');
  });
});
