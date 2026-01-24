import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

export interface UseObjectsForDataGridResult {
  rows: ObjectSummaryWithProperties[];
  isLoading: boolean;
  error: string | null;
  sortColumn: string | undefined;
  sortDirection: 'asc' | 'desc';
  onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  onDelete: (row: ObjectSummaryWithProperties) => void;
  isDeleting: boolean;
}

/**
 * Hook for managing ObjectDataGrid data, sorting, and deletion.
 *
 * Provides:
 * - Fetching objects with server-side sorting
 * - Sort state management
 * - Delete mutation with cache invalidation
 */
export function useObjectsForDataGrid(typeKey: string): UseObjectsForDataGridResult {
  const queryClient = useQueryClient();

  // Sort state
  const [sortColumn, setSortColumn] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Build sort params for query - only include sortBy if defined
  const sortParams =
    sortColumn !== undefined ? { sortBy: sortColumn, sortDirection } : { sortDirection };

  // Build API options - only include sortBy if defined
  const listOptions =
    sortColumn !== undefined
      ? { typeKey, includeProperties: true, sortBy: sortColumn, sortDirection }
      : { typeKey, includeProperties: true, sortDirection };

  // Fetch objects with sorting
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.objectsByType(typeKey, sortParams),
    queryFn: ipcQuery(() => api.listObjects(listOptions)),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (objectId: string) => {
      const result = await api.softDeleteObject(objectId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.result;
    },
    onSuccess: () => {
      // Invalidate all object queries to refetch
      void queryClient.invalidateQueries({ queryKey: ['objects'] });
      // Also invalidate type counts which may have changed
      void queryClient.invalidateQueries({ queryKey: queryKeys.typeCounts() });
    },
  });

  // Handle sort change
  const onSortChange = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  // Handle delete
  const onDelete = useCallback(
    (row: ObjectSummaryWithProperties) => {
      deleteMutation.mutate(row.id);
    },
    [deleteMutation]
  );

  // Extract error message from query error
  const errorMessage = error instanceof Error ? error.message : null;

  return {
    rows: (data ?? []) as ObjectSummaryWithProperties[],
    isLoading,
    error: errorMessage,
    sortColumn,
    sortDirection,
    onSortChange,
    onDelete,
    isDeleting: deleteMutation.isPending,
  };
}
