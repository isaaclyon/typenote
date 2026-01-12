/**
 * useBacklinks Hook
 *
 * Fetches backlinks for a given object ID via IPC.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useCallback } from 'react';
import type { BacklinkResult } from '@typenote/storage';

export interface UseBacklinksOptions {
  objectId: string;
  enabled?: boolean;
}

export interface UseBacklinksResult {
  backlinks: BacklinkResult[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBacklinks(options: UseBacklinksOptions): UseBacklinksResult {
  const { objectId, enabled = true } = options;

  const [backlinks, setBacklinks] = useState<BacklinkResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBacklinks = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.getBacklinks(objectId);

      if (result.success) {
        setBacklinks(result.result);
      } else {
        setError(result.error.message);
        setBacklinks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBacklinks([]);
    } finally {
      setIsLoading(false);
    }
  }, [objectId, enabled]);

  useEffect(() => {
    void fetchBacklinks();
  }, [fetchBacklinks]);

  return {
    backlinks,
    isLoading,
    error,
    refetch: fetchBacklinks,
  };
}
