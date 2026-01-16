/**
 * useObjectsByType Hook
 *
 * Fetches objects filtered by typeKey with properties included.
 * Uses TanStack Query for caching and automatic refetching.
 */

/// <reference path="../global.d.ts" />

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

export interface UseObjectsByTypeOptions {
  typeKey: string;
  enabled?: boolean;
}

export interface UseObjectsByTypeResult {
  objects: ObjectSummaryWithProperties[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useObjectsByType(options: UseObjectsByTypeOptions): UseObjectsByTypeResult {
  const { typeKey, enabled = true } = options;
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.objectsByType(typeKey),
    queryFn: async () => {
      const result = await adaptIpcOutcome(
        window.typenoteAPI.listObjects({
          typeKey,
          includeProperties: true,
        })
      );
      // Cast since we requested includeProperties: true
      return result as ObjectSummaryWithProperties[];
    },
    enabled: enabled && Boolean(typeKey),
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.objectsByType(typeKey) });
  }, [queryClient, typeKey]);

  return {
    objects: data ?? [],
    isLoading,
    error: error ? String(error instanceof Error ? error.message : error) : null,
    refetch,
  };
}
