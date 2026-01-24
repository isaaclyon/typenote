import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useSidebarData } from '../useSidebarData.js';
import {
  renderHookWithClient,
  createMockTypenoteAPI,
  createMockObjectType,
  createMockObjectSummary,
  setupMockAPI,
} from './test-utils.js';

describe('useSidebarData', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: async (options) => ({
          success: true as const,
          result: options?.builtInOnly
            ? [
                createMockObjectType({
                  id: '01ABC123456789DEFGHIJK0001',
                  key: 'Page',
                  name: 'Page',
                  pluralName: 'Pages',
                  icon: 'file-text',
                  color: '#6495ED',
                  builtIn: true,
                }),
              ]
            : [
                createMockObjectType({
                  id: '01ABC123456789DEFGHIJK0001',
                  key: 'Page',
                  name: 'Page',
                  pluralName: 'Pages',
                  icon: 'file-text',
                  color: '#6495ED',
                  builtIn: true,
                }),
              ],
        }),
        listObjects: async (_options) => ({
          success: true as const,
          result: [
            createMockObjectSummary({
              id: 'obj1',
              title: 'Test',
              typeKey: 'Page',
            }),
          ],
        }),
        getPinnedObjects: async () => ({
          success: true as const,
          result: [
            {
              id: 'pin1',
              title: 'Pinned',
              typeId: '01ABC123456789DEFGHIJK0001',
              typeKey: 'Page',
              updatedAt: new Date('2026-01-23T10:00:00Z'),
              pinnedAt: new Date('2026-01-23T10:00:00Z'),
              order: 0,
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('combines type counts and pinned objects', async () => {
    const { result } = renderHookWithClient(() => useSidebarData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeCounts).toHaveLength(1);
    expect(result.current.pinnedObjects).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('reports loading when either query is loading', () => {
    const { result } = renderHookWithClient(() => useSidebarData());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty arrays when no data', async () => {
    cleanup();
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: async () => ({
          success: true as const,
          result: [],
        }),
        listObjects: async () => ({
          success: true as const,
          result: [],
        }),
        getPinnedObjects: async () => ({
          success: true as const,
          result: [],
        }),
      })
    );

    const { result } = renderHookWithClient(() => useSidebarData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeCounts).toEqual([]);
    expect(result.current.pinnedObjects).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('provides type count data with correct shape', async () => {
    const { result } = renderHookWithClient(() => useSidebarData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeCounts[0]).toMatchObject({
      typeKey: 'Page',
      typeName: 'Pages',
      typeIcon: 'file-text',
      typeColor: '#6495ED',
      count: 1,
    });
  });

  it('provides pinned object data with correct shape', async () => {
    const { result } = renderHookWithClient(() => useSidebarData());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.pinnedObjects[0]).toMatchObject({
      id: 'pin1',
      title: 'Pinned',
      typeKey: 'Page',
    });
  });
});
