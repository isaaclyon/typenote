import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

interface TypeMetadata {
  id: string;
  key: string;
  name: string;
  color: string | null;
  icon: string | null;
  count: number;
}

interface UseTypeMetadataResult {
  types: TypeMetadata[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches type definitions with object counts.
 * Uses TanStack Query for caching and automatic refetching.
 */
export function useTypeMetadata(): UseTypeMetadataResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.typeMetadata(),
    queryFn: async () => {
      const [types, objects] = await Promise.all([
        adaptIpcOutcome(window.typenoteAPI.listObjectTypes()),
        adaptIpcOutcome(window.typenoteAPI.listObjects()),
      ]);

      // Count objects per type
      const countsByKey: Record<string, number> = {};
      for (const obj of objects) {
        countsByKey[obj.typeKey] = (countsByKey[obj.typeKey] ?? 0) + 1;
      }

      // Build metadata
      return types.map((type) => ({
        id: type.id,
        key: type.key,
        name: type.name,
        color: type.color,
        icon: type.icon,
        count: countsByKey[type.key] ?? 0,
      }));
    },
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.typeMetadata() });
  }, [queryClient]);

  return {
    types: data ?? [],
    isLoading,
    error: error ? String(error instanceof Error ? error.message : error) : null,
    refetch,
  };
}
