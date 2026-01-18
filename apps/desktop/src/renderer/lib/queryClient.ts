import { QueryClient } from '@tanstack/react-query';

/**
 * Shared QueryClient instance for the renderer process.
 * Configured with sensible defaults for IPC-based data fetching.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 30 seconds before refetching
      staleTime: 30 * 1000,
      // Retry failed queries once
      retry: 1,
      // Don't refetch on window focus (data is local, not remote)
      refetchOnWindowFocus: false,
    },
  },
});
