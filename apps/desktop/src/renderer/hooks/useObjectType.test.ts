/**
 * Tests for useObjectType hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ObjectType } from '@typenote/api';
import { useObjectType } from './useObjectType.js';

// Helper to create mock ObjectType
function createMockObjectType(overrides: Partial<ObjectType> = {}): ObjectType {
  return {
    id: '01HZX000000000000000000001',
    key: 'Task',
    name: 'Task',
    icon: 'check-square',
    schema: {
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: false,
          options: ['Todo', 'Done'],
        },
        { key: 'priority', name: 'Priority', type: 'number', required: false },
      ],
    },
    builtIn: true,
    parentTypeId: null,
    pluralName: 'Tasks',
    color: '#3B82F6',
    description: 'A task item',
    showInCalendar: false,
    calendarDateProperty: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('useObjectType', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should fetch object type on mount', async () => {
    const mockObjectType = createMockObjectType();

    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: true,
      result: mockObjectType,
    });

    const { result } = renderHook(() => useObjectType({ typeKey: 'Task' }));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.objectType).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have object type after fetch
    expect(result.current.objectType).toEqual(mockObjectType);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getObjectTypeByKey).toHaveBeenCalledWith('Task');
  });

  it('should handle IPC error response', async () => {
    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'TYPE_NOT_FOUND', message: 'Object type not found' },
    });

    const { result } = renderHook(() => useObjectType({ typeKey: 'Unknown' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objectType).toBeNull();
    expect(result.current.error).toBe('Object type not found');
  });

  it('should handle IPC exception', async () => {
    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useObjectType({ typeKey: 'Task' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objectType).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch when typeKey changes', async () => {
    const mockTask = createMockObjectType({ key: 'Task', name: 'Task' });
    const mockPage = createMockObjectType({ key: 'Page', name: 'Page' });

    window.typenoteAPI.getObjectTypeByKey = vi
      .fn()
      .mockResolvedValueOnce({ success: true, result: mockTask })
      .mockResolvedValueOnce({ success: true, result: mockPage });

    const { result, rerender } = renderHook(({ typeKey }) => useObjectType({ typeKey }), {
      initialProps: { typeKey: 'Task' },
    });

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objectType?.key).toBe('Task');

    // Change typeKey
    rerender({ typeKey: 'Page' });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objectType?.key).toBe('Page');
    expect(window.typenoteAPI.getObjectTypeByKey).toHaveBeenCalledTimes(2);
  });

  it('should not fetch when enabled is false', async () => {
    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: true,
      result: createMockObjectType(),
    });

    const { result } = renderHook(() => useObjectType({ typeKey: 'Task', enabled: false }));

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.objectType).toBeNull();
    expect(window.typenoteAPI.getObjectTypeByKey).not.toHaveBeenCalled();
  });

  it('should not fetch when typeKey is empty', async () => {
    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: true,
      result: createMockObjectType(),
    });

    const { result } = renderHook(() => useObjectType({ typeKey: '' }));

    // Should not fetch
    expect(result.current.isLoading).toBe(false);
    expect(result.current.objectType).toBeNull();
    expect(window.typenoteAPI.getObjectTypeByKey).not.toHaveBeenCalled();
  });

  it('should provide working refetch function', async () => {
    const mockObjectType = createMockObjectType();

    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: true,
      result: mockObjectType,
    });

    const { result } = renderHook(() => useObjectType({ typeKey: 'Task' }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Clear mock to verify refetch calls it again
    vi.clearAllMocks();

    // Call refetch
    await result.current.refetch();

    expect(window.typenoteAPI.getObjectTypeByKey).toHaveBeenCalledWith('Task');
  });

  it('should handle null result (type not found)', async () => {
    window.typenoteAPI.getObjectTypeByKey = vi.fn().mockResolvedValue({
      success: true,
      result: null,
    });

    const { result } = renderHook(() => useObjectType({ typeKey: 'Unknown' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.objectType).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
