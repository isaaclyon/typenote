import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

/**
 * Hook to fetch pinned objects for sidebar favorites section.
 * Returns pinned objects ordered by user-defined order.
 */
export function usePinnedObjects() {
  return useQuery({
    queryKey: queryKeys.pinnedObjects(),
    queryFn: ipcQuery(() => api.getPinnedObjects()),
    staleTime: 30 * 1000, // 30 seconds
  });
}
