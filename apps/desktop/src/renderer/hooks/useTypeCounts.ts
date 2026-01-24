import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

export interface TypeCount {
  typeKey: string;
  typeName: string;
  typeIcon: string | null;
  typeColor: string | null;
  count: number;
}

/**
 * Hook to fetch type counts for sidebar navigation.
 * Returns list of types with their object counts.
 */
export function useTypeCounts() {
  return useQuery({
    queryKey: queryKeys.typeCounts(),
    queryFn: async (): Promise<TypeCount[]> => {
      // Get all object types
      const types = await adaptIpcOutcome(api.listObjectTypes({ builtInOnly: true }));

      // Get counts per type by listing objects
      const counts = await Promise.all(
        types.map(async (type) => {
          const objects = await adaptIpcOutcome(api.listObjects({ typeKey: type.key }));
          return {
            typeKey: type.key,
            typeName: type.pluralName ?? type.name,
            typeIcon: type.icon,
            typeColor: type.color,
            count: Array.isArray(objects) ? objects.length : 0,
          };
        })
      );

      return counts;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
