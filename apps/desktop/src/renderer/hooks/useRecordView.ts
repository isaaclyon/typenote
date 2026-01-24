import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adaptIpcOutcome } from '../lib/ipcQueryAdapter.js';
import { api } from '../lib/api.js';

/**
 * Hook to record a view of an object for recent objects tracking.
 * Invalidates recent objects cache on success.
 */
export function useRecordView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (objectId: string) => {
      return await adaptIpcOutcome(api.recordView(objectId));
    },
    onSuccess: () => {
      // Invalidate recent objects cache to reflect updated view order
      void queryClient.invalidateQueries({ queryKey: ['recent-objects'] });
    },
  });
}
