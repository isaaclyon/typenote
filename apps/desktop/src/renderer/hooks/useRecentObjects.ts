import { useQuery } from '@tanstack/react-query';
import type { RecentObjectSummary } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

/**
 * Hook to fetch recently viewed objects for CommandPalette.
 * Returns list of objects ordered by most recent view.
 */
export function useRecentObjects(limit = 10) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.recentObjects(limit),
    queryFn: async (): Promise<RecentObjectSummary[]> => {
      return adaptIpcOutcome(api.getRecentObjects(limit));
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    recentObjects: data ?? [],
    isLoading,
    error: error ? String(error) : null,
  };
}
