import { useQuery } from '@tanstack/react-query';
import type { SearchResult } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

/**
 * Hook to search for objects by text query for CommandPalette.
 * Returns list of search results matching the query.
 * Query is disabled if search text is empty or whitespace-only.
 */
export function useSearchObjects(query: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.searchBlocks(query),
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query.trim()) {
        return [];
      }
      return adaptIpcOutcome(api.searchBlocks(query, { limit: 10 }));
    },
    enabled: query.trim().length > 0,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    searchResults: data ?? [],
    isLoading,
    error: error ? String(error) : null,
  };
}
