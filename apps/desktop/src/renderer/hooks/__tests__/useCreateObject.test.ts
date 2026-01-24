import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { useCreateObject } from '../useCreateObject.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useCreateObject', () => {
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  afterEach(() => {
    cleanup?.();
  });

  test('creates object and navigates on success', async () => {
    const mockResult = {
      id: '01CREATED123',
      typeId: '01TYPE123',
      typeKey: 'Page',
      title: 'Untitled',
      properties: {},
      docVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createObjectMock = vi.fn().mockResolvedValue({
      success: true,
      result: mockResult,
    });

    const mockAPI = createMockTypenoteAPI({
      createObject: createObjectMock,
    });

    cleanup = setupMockAPI(mockAPI);

    const { result } = renderHookWithClient(() => useCreateObject());

    // Initially not creating
    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBe(null);

    // Call createObject
    act(() => {
      void result.current.createObject('Page', 'Untitled', {});
    });

    // Should be creating
    expect(result.current.isCreating).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });

    // Verify IPC call
    expect(createObjectMock).toHaveBeenCalledWith('Page', 'Untitled', {});

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/notes/01CREATED123');

    // No error
    expect(result.current.error).toBe(null);
  });

  test('sets error state on failure', async () => {
    const createObjectMock = vi.fn().mockResolvedValue({
      success: false,
      error: {
        code: 'TYPE_NOT_FOUND',
        message: 'Object type not found: InvalidType',
      },
    });

    const mockAPI = createMockTypenoteAPI({
      createObject: createObjectMock,
    });

    cleanup = setupMockAPI(mockAPI);

    const { result } = renderHookWithClient(() => useCreateObject());

    // Call createObject
    act(() => {
      void result.current.createObject('InvalidType', 'Test', {});
    });

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    // Should have error
    expect(result.current.error).toBe('Object type not found: InvalidType');
  });

  test('invalidates queries on success', async () => {
    const mockResult = {
      id: '01NEW123',
      typeId: '01TYPE123',
      typeKey: 'Page',
      title: 'New Page',
      properties: {},
      docVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createObjectMock = vi.fn().mockResolvedValue({
      success: true,
      result: mockResult,
    });

    const mockAPI = createMockTypenoteAPI({
      createObject: createObjectMock,
    });

    cleanup = setupMockAPI(mockAPI);

    const { result } = renderHookWithClient(() => useCreateObject());

    // Get query client to spy on invalidations
    const queryClient = result.current._queryClient;
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // Call createObject
    await act(async () => {
      await result.current.createObject('Page', 'New Page', {});
    });

    // Verify invalidations (should invalidate objects, types/counts, recent-objects)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['objects'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['types', 'counts'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['recent-objects'] });
  });

  test('clears previous error on new attempt', async () => {
    const createObjectMock = vi
      .fn()
      .mockResolvedValueOnce({
        success: false,
        error: { code: 'ERROR', message: 'First error' },
      })
      .mockResolvedValueOnce({
        success: true,
        result: {
          id: '01SUCCESS123',
          typeId: '01TYPE123',
          typeKey: 'Page',
          title: 'Success',
          properties: {},
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

    const mockAPI = createMockTypenoteAPI({
      createObject: createObjectMock,
    });

    cleanup = setupMockAPI(mockAPI);

    const { result } = renderHookWithClient(() => useCreateObject());

    // First attempt - fails
    await act(async () => {
      await result.current.createObject('Page', 'Test', {});
    });

    expect(result.current.error).toBe('First error');

    // Second attempt - succeeds
    await act(async () => {
      await result.current.createObject('Page', 'Success', {});
    });

    // Error should be cleared
    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });
});
