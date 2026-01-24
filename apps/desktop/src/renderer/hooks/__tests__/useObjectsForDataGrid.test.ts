import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';
import { useObjectsForDataGrid } from '../useObjectsForDataGrid.js';

/**
 * Creates a mock ObjectSummaryWithProperties for testing.
 */
function createMockObjectWithProps(
  overrides: Partial<ObjectSummaryWithProperties> = {}
): ObjectSummaryWithProperties {
  return {
    id: '01ABC123456789DEFGHIJK0002',
    title: 'Test Object',
    typeId: '01ABC123456789DEFGHIJK0001',
    typeKey: 'Page',
    updatedAt: new Date(),
    properties: {},
    ...overrides,
  };
}

describe('useObjectsForDataGrid', () => {
  let cleanup: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup?.();
  });

  describe('initial fetch', () => {
    test('fetches objects with default sort', async () => {
      const mockObjects = [
        createMockObjectWithProps({ id: '01A', title: 'Object A' }),
        createMockObjectWithProps({ id: '01B', title: 'Object B' }),
      ];

      const listObjectsMock = vi.fn().mockResolvedValue({
        success: true,
        result: mockObjects,
      });

      const mockAPI = createMockTypenoteAPI({
        listObjects: listObjectsMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.rows).toEqual(mockObjects);
      expect(result.current.error).toBeNull();

      // Verify API called with includeProperties and default sort
      expect(listObjectsMock).toHaveBeenCalledWith({
        typeKey: 'Page',
        includeProperties: true,
        sortBy: undefined,
        sortDirection: 'desc',
      });
    });

    test('returns empty array when no objects', async () => {
      const listObjectsMock = vi.fn().mockResolvedValue({
        success: true,
        result: [],
      });

      const mockAPI = createMockTypenoteAPI({
        listObjects: listObjectsMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.rows).toEqual([]);
    });

    test('handles error from API', async () => {
      const listObjectsMock = vi.fn().mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL', message: 'Something went wrong' },
      });

      const mockAPI = createMockTypenoteAPI({
        listObjects: listObjectsMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Something went wrong');
      expect(result.current.rows).toEqual([]);
    });
  });

  describe('sorting', () => {
    test('default sort direction is desc', async () => {
      const mockAPI = createMockTypenoteAPI({
        listObjects: vi.fn().mockResolvedValue({ success: true, result: [] }),
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sortColumn).toBeUndefined();
      expect(result.current.sortDirection).toBe('desc');
    });

    test('onSortChange triggers refetch with new sort params', async () => {
      const listObjectsMock = vi.fn().mockResolvedValue({
        success: true,
        result: [],
      });

      const mockAPI = createMockTypenoteAPI({
        listObjects: listObjectsMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear previous calls
      listObjectsMock.mockClear();

      // Change sort
      act(() => {
        result.current.onSortChange('title', 'asc');
      });

      // Should update state
      expect(result.current.sortColumn).toBe('title');
      expect(result.current.sortDirection).toBe('asc');

      // Should trigger new fetch with sort params
      await waitFor(() => {
        expect(listObjectsMock).toHaveBeenCalledWith({
          typeKey: 'Page',
          includeProperties: true,
          sortBy: 'title',
          sortDirection: 'asc',
        });
      });
    });
  });

  describe('delete', () => {
    test('onDelete calls softDeleteObject and invalidates cache', async () => {
      const mockObject = createMockObjectWithProps({ id: '01DELETE' });

      const listObjectsMock = vi.fn().mockResolvedValue({
        success: true,
        result: [mockObject],
      });

      const softDeleteMock = vi.fn().mockResolvedValue({
        success: true,
        result: undefined,
      });

      const mockAPI = createMockTypenoteAPI({
        listObjects: listObjectsMock,
        softDeleteObject: softDeleteMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Initially not deleting
      expect(result.current.isDeleting).toBe(false);

      // Trigger delete
      act(() => {
        result.current.onDelete(mockObject);
      });

      // Should call softDeleteObject
      await waitFor(() => {
        expect(softDeleteMock).toHaveBeenCalledWith('01DELETE');
      });

      // Should have refetched (cache invalidated)
      await waitFor(() => {
        expect(listObjectsMock).toHaveBeenCalledTimes(2);
      });
    });

    test('isDeleting is true during delete operation', async () => {
      const mockObject = createMockObjectWithProps({ id: '01DELETE' });

      // Create a promise we can control
      let resolveDelete: (() => void) | undefined;
      const deletePromise = new Promise<{ success: true; result: undefined }>((resolve) => {
        resolveDelete = () => resolve({ success: true, result: undefined });
      });

      const softDeleteMock = vi.fn().mockReturnValue(deletePromise);

      const mockAPI = createMockTypenoteAPI({
        listObjects: vi.fn().mockResolvedValue({ success: true, result: [mockObject] }),
        softDeleteObject: softDeleteMock,
      });

      cleanup = setupMockAPI(mockAPI);

      const { result } = renderHookWithClient(() => useObjectsForDataGrid('Page'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger delete
      act(() => {
        result.current.onDelete(mockObject);
      });

      // Should be deleting (wait for mutation to start)
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(true);
      });

      // Complete the delete
      await act(async () => {
        resolveDelete?.();
      });

      // Should no longer be deleting
      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });
    });
  });
});
