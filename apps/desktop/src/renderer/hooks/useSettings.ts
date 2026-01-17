/**
 * useSettings Hook
 *
 * Manages user settings with TanStack Query for shared state and optimistic updates.
 * Settings are persisted to the backend automatically on change.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import type { UserSettings } from '@typenote/api';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';

export interface UseSettingsResult {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

/**
 * Default settings values (matches Zod schema defaults).
 * Used as fallback during initial load.
 */
const DEFAULT_SETTINGS: UserSettings = {
  colorMode: 'system',
  weekStartDay: 'sunday',
  spellcheck: true,
  dateFormat: 'iso',
  timeFormat: '12h',
};

export function useSettings(): UseSettingsResult {
  const queryClient = useQueryClient();

  // Query for fetching settings
  const {
    data: settings = DEFAULT_SETTINGS,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.settings(),
    queryFn: async () => {
      return await adaptIpcOutcome(window.typenoteAPI.getSettings());
    },
  });

  // Update settings mutation with optimistic updates
  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      await adaptIpcOutcome(window.typenoteAPI.updateSettings(updates));
    },
    onMutate: async (updates: Partial<UserSettings>) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(queryKeys.settings());

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), { ...previousSettings, ...updates });
      }

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (_err, _updates, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings);
      }
      // Invalidate to refetch from backend after error
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
    // Note: No onSettled - we trust the optimistic update on success
    // The backend has persisted the change, and we've already updated the cache
  });

  // Reset settings mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      await adaptIpcOutcome(window.typenoteAPI.resetSettings());
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.settings() });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(queryKeys.settings());

      // Optimistically update to defaults
      queryClient.setQueryData(queryKeys.settings(), DEFAULT_SETTINGS);

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.settings(), context.previousSettings);
      }
      // Invalidate to refetch from backend after error
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
    // Note: No onSettled - we trust the optimistic update on success
  });

  // Wrapper functions to match the original interface
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      try {
        await updateMutation.mutateAsync(updates);
      } catch {
        // Error is already handled by onError callback (rollback)
        // Swallow the error to match original interface (doesn't throw)
      }
    },
    [updateMutation]
  );

  const resetSettings = useCallback(async () => {
    try {
      await resetMutation.mutateAsync();
    } catch {
      // Error is already handled by onError callback (rollback)
      // Swallow the error to match original interface (doesn't throw)
    }
  }, [resetMutation]);

  // Helper to extract error message
  const getErrorMessage = (err: unknown): string | null => {
    if (!err) return null;
    if (err instanceof Error) return err.message;
    return String(err);
  };

  // Merge query and mutation errors (mutations take priority if recent)
  const combinedError =
    getErrorMessage(updateMutation.error) ||
    getErrorMessage(resetMutation.error) ||
    getErrorMessage(error);

  return {
    settings,
    isLoading,
    error: combinedError,
    updateSettings,
    resetSettings,
  };
}
