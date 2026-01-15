import { useState, useEffect, useCallback } from 'react';
import type { ObjectDetails } from '@typenote/storage';

interface UseSelectedObjectResult {
  object: ObjectDetails | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook that fetches full ObjectDetails for a given objectId.
 * Returns null when objectId is null (no selection).
 */
export function useSelectedObject(objectId: string | null): UseSelectedObjectResult {
  const [object, setObject] = useState<ObjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObject = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.getObject(id);

      if (result.success) {
        setObject(result.result);
      } else {
        setError(result.error.message);
        setObject(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setObject(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (objectId === null) {
      // Clear state when no selection
      setObject(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    void fetchObject(objectId);
  }, [objectId, fetchObject]);

  return {
    object,
    isLoading,
    error,
  };
}
