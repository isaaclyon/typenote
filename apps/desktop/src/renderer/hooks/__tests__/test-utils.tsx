import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, type RenderHookOptions } from '@testing-library/react';
import type { ObjectType, ObjectSummary, GetDocumentResult } from '@typenote/api';

/**
 * Creates a fresh QueryClient for testing with no retries.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
}

/**
 * Wrapper that provides QueryClient context.
 */
export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

/**
 * Renders a hook with QueryClient context.
 */
export function renderHookWithClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
) {
  return renderHook(hook, { wrapper: createWrapper(), ...options });
}

/**
 * Creates a complete mock ObjectType for testing.
 */
export function createMockObjectType(overrides: Partial<ObjectType> = {}): ObjectType {
  const now = new Date();
  return {
    id: '01ABC123456789DEFGHIJK0001',
    key: 'Page',
    name: 'Page',
    icon: 'File',
    color: '#6495ED',
    schema: null,
    builtIn: true,
    parentTypeId: null,
    pluralName: 'Pages',
    description: null,
    showInCalendar: false,
    calendarDateProperty: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a complete mock ObjectSummary for testing.
 */
export function createMockObjectSummary(overrides: Partial<ObjectSummary> = {}): ObjectSummary {
  return {
    id: '01ABC123456789DEFGHIJK0002',
    title: 'Test Object',
    typeId: '01ABC123456789DEFGHIJK0001',
    typeKey: 'Page',
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock typenoteAPI that returns success outcomes.
 */
export function createMockTypenoteAPI(overrides: Partial<typeof window.typenoteAPI> = {}) {
  const defaultAPI: Partial<typeof window.typenoteAPI> = {
    version: '1.0.0-test',
    listObjectTypes: async () => ({
      success: true as const,
      result: [] as ObjectType[],
    }),
    listObjects: async () => ({
      success: true as const,
      result: [] as ObjectSummary[],
    }),
    getPinnedObjects: async () => ({
      success: true as const,
      result: [],
    }),
    getDocument: async () => ({
      success: true as const,
      result: {
        objectId: '01ABC123456789DEFGHIJK0001',
        docVersion: 1,
        blocks: [],
      } as GetDocumentResult,
    }),
  };

  return { ...defaultAPI, ...overrides } as typeof window.typenoteAPI;
}

/**
 * Sets up window.typenoteAPI mock for testing.
 * Returns cleanup function.
 */
export function setupMockAPI(api: typeof window.typenoteAPI) {
  const original = window.typenoteAPI;
  window.typenoteAPI = api;
  return () => {
    window.typenoteAPI = original;
  };
}
