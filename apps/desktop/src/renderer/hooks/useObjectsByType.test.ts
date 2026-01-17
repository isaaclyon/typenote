/**
 * Tests for useObjectsByType hook
 *
 * Tests the TanStack Query based implementation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import { useObjectsByType } from './useObjectsByType.js';
import { createQueryWrapper } from '../test-utils.js';

// Helper to create mock ObjectSummaryWithProperties
function createMockObject(
  id: string,
  title: string,
  properties: Record<string, unknown> = {}
): ObjectSummaryWithProperties {
  return {
    id,
    title,
    typeId: 'type-1',
    typeKey: 'Task',
    updatedAt: new Date('2026-01-15'),
    properties,
  };
}

describe('useObjectsByType', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch objects on mount', async () => {
    const mockObjects: ObjectSummaryWithProperties[] = [
      createMockObject('obj-1', 'Task 1', { status: 'Todo', priority: 1 }),
      createMockObject('obj-2', 'Task 2', { status: 'Done', priority: 2 }),
    ];

    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: mockObjects,
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task' }), {
      wrapper: createQueryWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.objects).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have objects after fetch
    expect(result.current.objects).toEqual(mockObjects);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.listObjects).toHaveBeenCalledWith({
      typeKey: 'Task',
      includeProperties: true,
    });
  });

  it('should handle IPC error response', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'INTERNAL', message: 'Database error' },
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task' }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toEqual([]);
    expect(result.current.error).toBe('Database error');
  });

  it('should handle IPC exception', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task' }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch when typeKey changes', async () => {
    const mockTasks: ObjectSummaryWithProperties[] = [
      createMockObject('task-1', 'Task 1', { status: 'Todo' }),
    ];
    const mockPages: ObjectSummaryWithProperties[] = [
      { ...createMockObject('page-1', 'Page 1', {}), typeKey: 'Page' },
      { ...createMockObject('page-2', 'Page 2', {}), typeKey: 'Page' },
    ];

    window.typenoteAPI.listObjects = vi
      .fn()
      .mockResolvedValueOnce({ success: true, result: mockTasks })
      .mockResolvedValueOnce({ success: true, result: mockPages });

    const wrapper = createQueryWrapper();
    const { result, rerender } = renderHook(({ typeKey }) => useObjectsByType({ typeKey }), {
      initialProps: { typeKey: 'Task' },
      wrapper,
    });

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toHaveLength(1);

    // Change typeKey
    rerender({ typeKey: 'Page' });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toHaveLength(2);
    expect(window.typenoteAPI.listObjects).toHaveBeenCalledTimes(2);
    expect(window.typenoteAPI.listObjects).toHaveBeenLastCalledWith({
      typeKey: 'Page',
      includeProperties: true,
    });
  });

  it('should not fetch when enabled is false', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task', enabled: false }), {
      wrapper: createQueryWrapper(),
    });

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.objects).toEqual([]);
    expect(window.typenoteAPI.listObjects).not.toHaveBeenCalled();
  });

  it('should not fetch when typeKey is empty', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: '' }), {
      wrapper: createQueryWrapper(),
    });

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.objects).toEqual([]);
    expect(window.typenoteAPI.listObjects).not.toHaveBeenCalled();
  });

  it('should provide working refetch function', async () => {
    const mockObjects: ObjectSummaryWithProperties[] = [
      createMockObject('obj-1', 'Task 1', { status: 'Todo' }),
    ];

    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: mockObjects,
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task' }), {
      wrapper: createQueryWrapper(),
    });

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to verify refetch calls it again
    vi.clearAllMocks();

    // Call refetch
    await result.current.refetch();

    // Wait for refetch to complete
    await waitFor(() => {
      expect(window.typenoteAPI.listObjects).toHaveBeenCalledWith({
        typeKey: 'Task',
        includeProperties: true,
      });
    });
  });

  it('should handle empty result', async () => {
    window.typenoteAPI.listObjects = vi.fn().mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useObjectsByType({ typeKey: 'Task' }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objects).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
