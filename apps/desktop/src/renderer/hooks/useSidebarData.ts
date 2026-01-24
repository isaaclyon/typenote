import { useTypeCounts } from './useTypeCounts.js';
import { usePinnedObjects } from './usePinnedObjects.js';

/**
 * Composite hook that fetches all data needed for the sidebar.
 * Combines type counts and pinned objects into a single interface.
 */
export function useSidebarData() {
  const typeCountsQuery = useTypeCounts();
  const pinnedQuery = usePinnedObjects();

  return {
    typeCounts: typeCountsQuery.data ?? [],
    pinnedObjects: pinnedQuery.data ?? [],
    isLoading: typeCountsQuery.isLoading || pinnedQuery.isLoading,
    error: typeCountsQuery.error ?? pinnedQuery.error ?? null,
  };
}
