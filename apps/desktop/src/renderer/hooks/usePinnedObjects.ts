/**
 * usePinnedObjects Hook
 *
 * Manages pinned objects for quick access in the sidebar.
 * Uses TanStack Query for caching with mutations for pin/unpin/reorder.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { PinnedObjectSummary } from '@typenote/storage';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

export interface UsePinnedObjectsResult {
  pinnedObjects: PinnedObjectSummary[];
  loading: boolean;
  pinObject: (objectId: string) => Promise<void>;
  unpinObject: (objectId: string) => Promise<void>;
  reorderPinnedObjects: (orderedIds: string[]) => Promise<void>;
  isPinned: (objectId: string) => boolean;
  refresh: () => Promise<void>;
}

export function usePinnedObjects(): UsePinnedObjectsResult {
  const queryClient = useQueryClient();

  // Query for fetching pinned objects
  const { data: pinnedObjects = [], isLoading } = useQuery({
    queryKey: queryKeys.pinnedObjects(),
    queryFn: async () => {
      return await adaptIpcOutcome(window.typenoteAPI.getPinnedObjects());
    },
  });

  // Pin mutation
  const pinMutation = useMutation({
    mutationFn: async (objectId: string) => {
      await adaptIpcOutcome(window.typenoteAPI.pinObject(objectId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pinnedObjects() });
    },
  });

  // Unpin mutation
  const unpinMutation = useMutation({
    mutationFn: async (objectId: string) => {
      await adaptIpcOutcome(window.typenoteAPI.unpinObject(objectId));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.pinnedObjects() });
    },
  });

  // Reorder mutation with optimistic updates
  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await adaptIpcOutcome(window.typenoteAPI.reorderPinnedObjects(orderedIds));
    },
    onMutate: async (orderedIds: string[]) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.pinnedObjects() });

      // Snapshot the previous value
      const previousPinned = queryClient.getQueryData<PinnedObjectSummary[]>(
        queryKeys.pinnedObjects()
      );

      // Optimistically update to the new value
      if (previousPinned) {
        const reordered = orderedIds
          .map((id) => previousPinned.find((p) => p.id === id))
          .filter((p): p is PinnedObjectSummary => p !== undefined);
        queryClient.setQueryData(queryKeys.pinnedObjects(), reordered);
      }

      // Return a context object with the snapshotted value
      return { previousPinned };
    },
    onError: (_err, _orderedIds, context) => {
      // Rollback on error
      if (context?.previousPinned) {
        queryClient.setQueryData(queryKeys.pinnedObjects(), context.previousPinned);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      void queryClient.invalidateQueries({ queryKey: queryKeys.pinnedObjects() });
    },
  });

  // Wrapper functions to match the original interface
  const pinObject = useCallback(
    async (objectId: string) => {
      await pinMutation.mutateAsync(objectId);
    },
    [pinMutation]
  );

  const unpinObject = useCallback(
    async (objectId: string) => {
      await unpinMutation.mutateAsync(objectId);
    },
    [unpinMutation]
  );

  const reorderPinnedObjects = useCallback(
    async (orderedIds: string[]) => {
      await reorderMutation.mutateAsync(orderedIds);
    },
    [reorderMutation]
  );

  const isPinned = useCallback(
    (objectId: string) => {
      return pinnedObjects.some((p) => p.id === objectId);
    },
    [pinnedObjects]
  );

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.pinnedObjects() });
  }, [queryClient]);

  return {
    pinnedObjects,
    loading: isLoading,
    pinObject,
    unpinObject,
    reorderPinnedObjects,
    isPinned,
    refresh,
  };
}
