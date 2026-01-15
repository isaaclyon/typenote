/**
 * usePinnedObjects Hook
 *
 * Manages pinned objects for quick access in the sidebar.
 */

import { useState, useEffect, useCallback } from 'react';
import type { PinnedObjectSummary } from '@typenote/storage';

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
  const [pinnedObjects, setPinnedObjects] = useState<PinnedObjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPinnedObjects = useCallback(async () => {
    const result = await window.typenoteAPI.getPinnedObjects();
    if (result.success) {
      setPinnedObjects(result.result);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPinnedObjects();
  }, [fetchPinnedObjects]);

  const pinObject = useCallback(
    async (objectId: string) => {
      await window.typenoteAPI.pinObject(objectId);
      await fetchPinnedObjects();
    },
    [fetchPinnedObjects]
  );

  const unpinObject = useCallback(
    async (objectId: string) => {
      await window.typenoteAPI.unpinObject(objectId);
      await fetchPinnedObjects();
    },
    [fetchPinnedObjects]
  );

  const reorderPinnedObjects = useCallback(
    async (orderedIds: string[]) => {
      // Optimistic update
      const reordered = orderedIds
        .map((id) => pinnedObjects.find((p) => p.id === id))
        .filter((p): p is PinnedObjectSummary => p !== undefined);
      setPinnedObjects(reordered);

      const result = await window.typenoteAPI.reorderPinnedObjects(orderedIds);
      if (!result.success) {
        // Revert on failure
        await fetchPinnedObjects();
      }
    },
    [pinnedObjects, fetchPinnedObjects]
  );

  const isPinned = useCallback(
    (objectId: string) => {
      return pinnedObjects.some((p) => p.id === objectId);
    },
    [pinnedObjects]
  );

  return {
    pinnedObjects,
    loading,
    pinObject,
    unpinObject,
    reorderPinnedObjects,
    isPinned,
    refresh: fetchPinnedObjects,
  };
}
