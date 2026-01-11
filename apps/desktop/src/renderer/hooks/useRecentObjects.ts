/**
 * useRecentObjects Hook
 *
 * Fetches recently viewed objects from the backend.
 * Returns top N objects ordered by most recent view first.
 */

import { useState, useEffect } from 'react';
import type { RecentObjectSummary } from '@typenote/storage';

export interface UseRecentObjectsResult {
  recentObjects: RecentObjectSummary[];
  isLoading: boolean;
  error: string | null;
}

export function useRecentObjects(limit = 10): UseRecentObjectsResult {
  const [recentObjects, setRecentObjects] = useState<RecentObjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecentObjects = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await window.typenoteAPI.getRecentObjects(limit);

        if (!isMounted) return;

        if (result.success) {
          setRecentObjects(result.result);
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch recent objects');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchRecentObjects();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  return { recentObjects, isLoading, error };
}
