/**
 * useUnlinkedMentions Hook
 *
 * Fetches unlinked mentions for a given object ID via IPC.
 */

/// <reference path="../global.d.ts" />

import { useState, useEffect, useCallback } from 'react';
import type { UnlinkedMentionResult } from '@typenote/storage';

export interface UseUnlinkedMentionsOptions {
  objectId: string;
  enabled?: boolean;
}

export interface UseUnlinkedMentionsResult {
  mentions: UnlinkedMentionResult[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUnlinkedMentions(
  options: UseUnlinkedMentionsOptions
): UseUnlinkedMentionsResult {
  const { objectId, enabled = true } = options;

  const [mentions, setMentions] = useState<UnlinkedMentionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentions = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await window.typenoteAPI.getUnlinkedMentions(objectId);

      if (result.success) {
        setMentions(result.result);
      } else {
        setError(result.error.message);
        setMentions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMentions([]);
    } finally {
      setIsLoading(false);
    }
  }, [objectId, enabled]);

  useEffect(() => {
    void fetchMentions();
  }, [fetchMentions]);

  return {
    mentions,
    isLoading,
    error,
    refetch: fetchMentions,
  };
}
