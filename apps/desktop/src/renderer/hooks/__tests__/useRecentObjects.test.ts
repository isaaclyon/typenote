import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useRecentObjects } from '../useRecentObjects.js';
import {
  renderHookWithClient,
  createMockTypenoteAPI,
  createMockRecentObject,
  setupMockAPI,
} from './test-utils.js';

describe('useRecentObjects', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const recentPage1 = createMockRecentObject({
      id: '01ABC123456789DEFGHIJK0001',
      title: 'Recent Page 1',
      typeKey: 'page',
      typeId: '01ABC123456789DEFGHIJK0011',
      viewedAt: new Date('2026-01-23T10:00:00Z'),
    });
    const recentPage2 = createMockRecentObject({
      id: '01ABC123456789DEFGHIJK0002',
      title: 'Recent Page 2',
      typeKey: 'daily',
      typeId: '01ABC123456789DEFGHIJK0012',
      viewedAt: new Date('2026-01-23T09:00:00Z'),
    });

    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getRecentObjects: async (limit) => ({
          success: true as const,
          result: limit === 5 ? [recentPage1, recentPage2] : [recentPage1, recentPage2],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns recent objects from IPC', async () => {
    const { result } = renderHookWithClient(() => useRecentObjects(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentObjects).toHaveLength(2);
    expect(result.current.recentObjects[0]?.title).toBe('Recent Page 1');
    expect(result.current.error).toBeNull();
  });

  it('uses default limit of 10', async () => {
    const { result } = renderHookWithClient(() => useRecentObjects());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentObjects).toHaveLength(2);
  });

  it('starts in loading state', () => {
    const { result } = renderHookWithClient(() => useRecentObjects(10));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns empty array on error', async () => {
    cleanup();
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getRecentObjects: async () => ({
          success: false as const,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Database unavailable',
            context: {},
          },
        }),
      })
    );

    const { result } = renderHookWithClient(() => useRecentObjects(10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.recentObjects).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });
});
