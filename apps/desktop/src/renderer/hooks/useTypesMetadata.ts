import { useQuery } from '@tanstack/react-query';
import type { ObjectType } from '@typenote/api';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

/**
 * Hook to fetch object type metadata.
 * Returns list of all object types with their icon, name, color, etc.
 * Useful for mapping type keys to display metadata.
 */
export function useTypesMetadata() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.typeMetadata(),
    queryFn: async (): Promise<ObjectType[]> => {
      return adaptIpcOutcome(api.listObjectTypes({ builtInOnly: true }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (types rarely change)
  });

  return {
    typesMetadata: data ?? [],
    isLoading,
    error: error ? String(error) : null,
  };
}
