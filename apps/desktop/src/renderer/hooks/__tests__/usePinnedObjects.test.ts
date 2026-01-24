import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { usePinnedObjects } from '../usePinnedObjects.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('usePinnedObjects', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getPinnedObjects: async () => ({
          success: true as const,
          result: [
            {
              id: 'pin1',
              title: 'My Pinned Page',
              typeId: '01ABC123456789DEFGHIJK0001',
              typeKey: 'Page',
              updatedAt: new Date('2026-01-23T10:00:00Z'),
              pinnedAt: new Date('2026-01-23T10:00:00Z'),
              order: 0,
            },
            {
              id: 'pin2',
              title: 'Important Note',
              typeId: '01ABC123456789DEFGHIJK0002',
              typeKey: 'DailyNote',
              updatedAt: new Date('2026-01-22T10:00:00Z'),
              pinnedAt: new Date('2026-01-22T10:00:00Z'),
              order: 1,
            },
          ],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns pinned objects from IPC', async () => {
    const { result } = renderHookWithClient(() => usePinnedObjects());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]).toMatchObject({
      id: 'pin1',
      title: 'My Pinned Page',
      typeKey: 'Page',
    });
  });

  it('returns empty array when no pinned objects', async () => {
    cleanup();
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getPinnedObjects: async () => ({
          success: true as const,
          result: [],
        }),
      })
    );

    const { result } = renderHookWithClient(() => usePinnedObjects());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
  });

  it('starts in loading state', () => {
    const { result } = renderHookWithClient(() => usePinnedObjects());
    expect(result.current.isLoading).toBe(true);
  });
});
