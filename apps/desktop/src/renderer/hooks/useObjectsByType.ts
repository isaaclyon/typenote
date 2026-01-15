/**
 * useObjectsByType Hook
 *
 * Fetches objects filtered by typeKey with properties included.
 * Used to populate TypeBrowser with data for a specific object type.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useCallback } from 'react';
import type { ObjectSummaryWithProperties } from '@typenote/storage';

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

  const [objects, setObjects] = useState<ObjectSummaryWithProperties[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObjects = useCallback(async () => {
    if (!enabled || !typeKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.listObjects({
        typeKey,
        includeProperties: true,
      });

      if (result.success) {
        // Cast since we requested includeProperties: true
        setObjects(result.result as ObjectSummaryWithProperties[]);
      } else {
        setError(result.error.message);
        setObjects([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setObjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [typeKey, enabled]);

  useEffect(() => {
    void fetchObjects();
  }, [fetchObjects]);

  return {
    objects,
    isLoading,
    error,
    refetch: fetchObjects,
  };
}
