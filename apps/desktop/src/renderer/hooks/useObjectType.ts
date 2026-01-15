/**
 * useObjectType Hook
 *
 * Fetches an ObjectType definition by its typeKey via IPC.
 * Used to get the schema (properties) for building TypeBrowser columns.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useCallback } from 'react';
import type { ObjectType } from '@typenote/api';

export interface UseObjectTypeOptions {
  typeKey: string;
  enabled?: boolean;
}

export interface UseObjectTypeResult {
  objectType: ObjectType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useObjectType(options: UseObjectTypeOptions): UseObjectTypeResult {
  const { typeKey, enabled = true } = options;

  const [objectType, setObjectType] = useState<ObjectType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchObjectType = useCallback(async () => {
    if (!enabled || !typeKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.getObjectTypeByKey(typeKey);

      if (result.success) {
        setObjectType(result.result);
      } else {
        setError(result.error.message);
        setObjectType(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setObjectType(null);
    } finally {
      setIsLoading(false);
    }
  }, [typeKey, enabled]);

  useEffect(() => {
    void fetchObjectType();
  }, [fetchObjectType]);

  return {
    objectType,
    isLoading,
    error,
    refetch: fetchObjectType,
  };
}
