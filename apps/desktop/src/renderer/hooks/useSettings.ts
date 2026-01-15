/**
 * useSettings Hook
 *
 * Manages user settings with optimistic updates.
 * Settings are persisted to the backend automatically on change.
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@typenote/api';

export interface UseSettingsResult {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

/**
 * Default settings values (matches Zod schema defaults).
 * Used as fallback during initial load and after reset.
 */
const DEFAULT_SETTINGS: UserSettings = {
  colorMode: 'system',
  weekStartDay: 'sunday',
  spellcheck: true,
  dateFormat: 'iso',
  timeFormat: '12h',
};

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await window.typenoteAPI.getSettings();

        if (!isMounted) return;

        if (result.success) {
          setSettings(result.result);
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Update one or more settings with optimistic update.
   * Reverts to previous state if IPC call fails.
   */
  const updateSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      // Store previous state for rollback
      const previousSettings = settings;

      // Optimistic update
      setSettings((current) => ({ ...current, ...updates }));

      try {
        const result = await window.typenoteAPI.updateSettings(updates);

        if (!result.success) {
          // Revert on failure
          setSettings(previousSettings);
          setError(result.error.message);
        }
      } catch (err) {
        // Revert on exception
        setSettings(previousSettings);
        setError(err instanceof Error ? err.message : 'Failed to update settings');
      }
    },
    [settings]
  );

  /**
   * Reset all settings to defaults.
   */
  const resetSettings = useCallback(async () => {
    // Store previous state for rollback
    const previousSettings = settings;

    // Optimistic update to defaults
    setSettings(DEFAULT_SETTINGS);

    try {
      const result = await window.typenoteAPI.resetSettings();

      if (!result.success) {
        // Revert on failure
        setSettings(previousSettings);
        setError(result.error.message);
      }
    } catch (err) {
      // Revert on exception
      setSettings(previousSettings);
      setError(err instanceof Error ? err.message : 'Failed to reset settings');
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
  };
}
