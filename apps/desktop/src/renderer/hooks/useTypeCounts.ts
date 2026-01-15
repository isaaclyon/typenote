import { useState, useEffect, useCallback } from 'react';

interface UseTypeCountsResult {
  counts: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook that fetches all objects and computes counts grouped by typeKey.
 * Used by sidebar to show type navigation with object counts.
 */
export function useTypeCounts(): UseTypeCountsResult {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.listObjects();

      if (result.success) {
        // Group by typeKey and count
        const grouped: Record<string, number> = {};
        for (const obj of result.result) {
          grouped[obj.typeKey] = (grouped[obj.typeKey] ?? 0) + 1;
        }
        setCounts(grouped);
      } else {
        setError(result.error.message);
        setCounts({});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCounts({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  return {
    counts,
    isLoading,
    error,
    refetch: fetchCounts,
  };
}
