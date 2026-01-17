/**
 * Test utilities for renderer process tests.
 * Provides QueryClient wrapper for testing TanStack Query hooks.
 */

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a fresh QueryClient for testing.
 * Disables retries and garbage collection delays for faster tests.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // No garbage collection delay in tests
        staleTime: 0, // Always consider data stale in tests
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component for testing hooks that use TanStack Query.
 * Creates a fresh QueryClient for each test to ensure isolation.
 */
export function createQueryWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = createTestQueryClient();

  return function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
