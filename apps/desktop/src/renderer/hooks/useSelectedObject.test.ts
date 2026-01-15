/**
 * Tests for useSelectedObject hook
 *
 * TDD: These tests are written BEFORE implementation to define expected behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ObjectDetails } from '@typenote/storage';
import { useSelectedObject } from './useSelectedObject.js';

describe('useSelectedObject', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should return null when objectId is null', async () => {
    window.typenoteAPI.getObject = vi.fn();

    const { result } = renderHook(() => useSelectedObject(null));

    // Should not fetch and return null immediately
    expect(result.current.object).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getObject).not.toHaveBeenCalled();
  });

  it('should fetch object details when objectId is provided', async () => {
    const mockObject: ObjectDetails = {
      id: 'obj-1',
      title: 'Test Page',
      typeId: 'type-1',
      typeKey: 'Page',
      properties: {},
      docVersion: 1,
      tags: [],
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-14'),
    };

    window.typenoteAPI.getObject = vi.fn().mockResolvedValue({
      success: true,
      result: mockObject,
    });

    const { result } = renderHook(() => useSelectedObject('obj-1'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.object).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toEqual(mockObject);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getObject).toHaveBeenCalledWith('obj-1');
  });

  it('should handle object not found', async () => {
    window.typenoteAPI.getObject = vi.fn().mockResolvedValue({
      success: true,
      result: null, // Object not found returns null
    });

    const { result } = renderHook(() => useSelectedObject('nonexistent'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle IPC error response', async () => {
    window.typenoteAPI.getObject = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Object not found' },
    });

    const { result } = renderHook(() => useSelectedObject('obj-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toBeNull();
    expect(result.current.error).toBe('Object not found');
  });

  it('should handle IPC exception', async () => {
    window.typenoteAPI.getObject = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSelectedObject('obj-1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch when objectId changes', async () => {
    const mockObject1: ObjectDetails = {
      id: 'obj-1',
      title: 'Page 1',
      typeId: 'type-1',
      typeKey: 'Page',
      properties: {},
      docVersion: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockObject2: ObjectDetails = {
      id: 'obj-2',
      title: 'Page 2',
      typeId: 'type-1',
      typeKey: 'Page',
      properties: {},
      docVersion: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    window.typenoteAPI.getObject = vi
      .fn()
      .mockResolvedValueOnce({ success: true, result: mockObject1 })
      .mockResolvedValueOnce({ success: true, result: mockObject2 });

    const { result, rerender } = renderHook(({ id }) => useSelectedObject(id), {
      initialProps: { id: 'obj-1' as string | null },
    });

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toEqual(mockObject1);

    // Change objectId
    rerender({ id: 'obj-2' });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    // Wait for second fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toEqual(mockObject2);
    expect(window.typenoteAPI.getObject).toHaveBeenCalledTimes(2);
  });

  it('should clear object when objectId changes to null', async () => {
    const mockObject: ObjectDetails = {
      id: 'obj-1',
      title: 'Page 1',
      typeId: 'type-1',
      typeKey: 'Page',
      properties: {},
      docVersion: 1,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    window.typenoteAPI.getObject = vi.fn().mockResolvedValue({
      success: true,
      result: mockObject,
    });

    const { result, rerender } = renderHook(({ id }) => useSelectedObject(id), {
      initialProps: { id: 'obj-1' as string | null },
    });

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.object).toEqual(mockObject);

    // Change to null
    rerender({ id: null });

    // Should immediately be null without loading
    expect(result.current.object).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });
});
