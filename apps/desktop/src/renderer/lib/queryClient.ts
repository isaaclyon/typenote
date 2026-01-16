import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance for TanStack Query.
 *
 * Configuration:
 * - staleTime: 5 minutes (reduce refetch frequency)
 * - gcTime: 10 minutes (garbage collection for inactive queries)
 * - retry: false (Electron IPC doesn't benefit from retries)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: false, // IPC calls don't need retries
      refetchOnWindowFocus: false, // Desktop app always focused
    },
  },
});
