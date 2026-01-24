import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserSettings } from '@typenote/api';
import { queryKeys } from '../lib/queryKeys.js';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

/**
 * Hook to fetch and update user settings.
 */
export function useSettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.settings(),
    queryFn: async () => {
      return await adaptIpcOutcome(api.getSettings());
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      await adaptIpcOutcome(api.updateSettings(updates));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    updateSettings: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
