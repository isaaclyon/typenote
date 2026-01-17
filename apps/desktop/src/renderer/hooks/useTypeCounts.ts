import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

interface UseTypeCountsResult {
  counts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches all objects and computes counts grouped by typeKey.
 * Uses TanStack Query for caching and automatic refetching.
 */
export function useTypeCounts(): UseTypeCountsResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.typeCounts(),
    queryFn: async () => {
      const objects = await adaptIpcOutcome(window.typenoteAPI.listObjects());

      // Group by typeKey and count
      const grouped: Record<string, number> = {};
      for (const obj of objects) {
        grouped[obj.typeKey] = (grouped[obj.typeKey] ?? 0) + 1;
      }
      return grouped;
    },
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.typeCounts() });
  }, [queryClient]);

  return {
    counts: data ?? {},
    isLoading,
    error: error ? String(error instanceof Error ? error.message : error) : null,
    refetch,
  };
}
