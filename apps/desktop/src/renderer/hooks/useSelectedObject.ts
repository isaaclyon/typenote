import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ObjectDetails } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

interface UseSelectedObjectResult {
  object: ObjectDetails | null;
  isLoading: boolean;
  error: string | null;
  /** Re-fetch the current object to get updated data */
  refetch: () => void;
}

/**
 * Hook that fetches full ObjectDetails for a given objectId.
 * Returns null when objectId is null (no selection).
 * Uses TanStack Query for caching - multiple components using the same objectId share the cache.
 */
export function useSelectedObject(objectId: string | null): UseSelectedObjectResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.object(objectId ?? ''),
    queryFn: async () => {
      if (!objectId) {
        return null;
      }
      return await adaptIpcOutcome(window.typenoteAPI.getObject(objectId));
    },
    enabled: objectId !== null,
  });

  const refetch = useCallback(() => {
    if (objectId) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.object(objectId) });
    }
  }, [queryClient, objectId]);

  return {
    object: objectId === null ? null : (data ?? null),
    isLoading: objectId !== null && isLoading,
    error: error ? String(error instanceof Error ? error.message : error) : null,
    refetch,
  };
}
