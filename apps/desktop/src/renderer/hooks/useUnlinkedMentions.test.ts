/**
 * Tests for useUnlinkedMentions hook
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { UnlinkedMentionResult } from '@typenote/storage';
import { useUnlinkedMentions } from './useUnlinkedMentions.js';

describe('useUnlinkedMentions', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch unlinked mentions on mount', async () => {
    const mockMentions: UnlinkedMentionResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Dev Log',
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    // Mock successful IPC response
    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockResolvedValue({
      success: true,
      result: mockMentions,
    });

    const { result } = renderHook(() => useUnlinkedMentions({ objectId: 'test-id' }));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.mentions).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have mentions after fetch
    expect(result.current.mentions).toEqual(mockMentions);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getUnlinkedMentions).toHaveBeenCalledWith('test-id');
  });

  it('should handle IPC error response', async () => {
    // Mock IPC error (unsuccessful response)
    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Object not found' },
    });

    const { result } = renderHook(() => useUnlinkedMentions({ objectId: 'test-id' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mentions).toEqual([]);
    expect(result.current.error).toBe('Object not found');
  });

  it('should handle IPC exception', async () => {
    // Mock IPC throwing an exception
    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useUnlinkedMentions({ objectId: 'test-id' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mentions).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch when objectId changes', async () => {
    const mockMentions1: UnlinkedMentionResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note 1',
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    const mockMentions2: UnlinkedMentionResult[] = [
      {
        sourceBlockId: 'block-2',
        sourceObjectId: 'obj-2',
        sourceObjectTitle: 'Note 2',
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getUnlinkedMentions = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        result: mockMentions1,
      })
      .mockResolvedValueOnce({
        success: true,
        result: mockMentions2,
      });

    const { result, rerender } = renderHook(({ objectId }) => useUnlinkedMentions({ objectId }), {
      initialProps: { objectId: 'obj-1' },
    });

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mentions).toEqual(mockMentions1);

    // Change objectId
    rerender({ objectId: 'obj-2' });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mentions).toEqual(mockMentions2);
    expect(window.typenoteAPI.getUnlinkedMentions).toHaveBeenCalledTimes(2);
  });

  it('should not fetch when enabled is false', async () => {
    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() =>
      useUnlinkedMentions({ objectId: 'test-id', enabled: false })
    );

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.mentions).toEqual([]);
    expect(window.typenoteAPI.getUnlinkedMentions).not.toHaveBeenCalled();
  });

  it('should provide working refetch function', async () => {
    const mockMentions: UnlinkedMentionResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note',
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockResolvedValue({
      success: true,
      result: mockMentions,
    });

    const { result } = renderHook(() => useUnlinkedMentions({ objectId: 'test-id' }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to verify refetch calls it again
    vi.clearAllMocks();

    // Call refetch
    await result.current.refetch();

    expect(window.typenoteAPI.getUnlinkedMentions).toHaveBeenCalledWith('test-id');
  });

  it('should start fetch when enabled changes from false to true', async () => {
    const mockMentions: UnlinkedMentionResult[] = [
      {
        sourceBlockId: 'block-1',
        sourceObjectId: 'obj-1',
        sourceObjectTitle: 'Note',
        sourceTypeId: 'type-1',
        sourceTypeKey: 'Page',
        sourceTypeIcon: 'file-text',
        sourceTypeColor: '#6B7280',
      },
    ];

    window.typenoteAPI.getUnlinkedMentions = vi.fn().mockResolvedValue({
      success: true,
      result: mockMentions,
    });

    const { result, rerender } = renderHook(
      ({ enabled }) => useUnlinkedMentions({ objectId: 'test-id', enabled }),
      { initialProps: { enabled: false } }
    );

    // Should not fetch initially
    expect(result.current.isLoading).toBe(false);
    expect(window.typenoteAPI.getUnlinkedMentions).not.toHaveBeenCalled();

    // Enable fetching
    rerender({ enabled: true });

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.mentions).toEqual(mockMentions);
    expect(window.typenoteAPI.getUnlinkedMentions).toHaveBeenCalledWith('test-id');
  });
});
