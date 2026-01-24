import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useSearchObjects } from '../useSearchObjects.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('useSearchObjects', () => {
  let cleanup: () => void;

  beforeEach(() => {
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        searchBlocks: async (query, _filters) => {
          if (!query.trim()) {
            return { success: true as const, result: [] };
          }

          // Mock search results
          return {
            success: true as const,
            result: [
              {
                blockId: '01ABC123456789DEFGHIJK0001',
                objectId: '01ABC123456789DEFGHIJK0010',
                objectTitle: 'Meeting Notes',
                typeKey: 'page',
                typeIcon: 'file-text',
                typeColor: '#6B7280',
              },
              {
                blockId: '01ABC123456789DEFGHIJK0002',
                objectId: '01ABC123456789DEFGHIJK0011',
                objectTitle: 'Project Plan',
                typeKey: 'page',
                typeIcon: 'file-text',
                typeColor: '#6B7280',
              },
            ],
          };
        },
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns search results from IPC', async () => {
    const { result } = renderHookWithClient(() => useSearchObjects('meeting'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.searchResults).toHaveLength(2);
    expect(result.current.searchResults[0]?.objectId).toBe('01ABC123456789DEFGHIJK0010');
    expect(result.current.error).toBeNull();
  });

  it('returns empty array for empty query', async () => {
    const { result } = renderHookWithClient(() => useSearchObjects(''));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('returns empty array for whitespace-only query', async () => {
    const { result } = renderHookWithClient(() => useSearchObjects('   '));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.searchResults).toEqual([]);
  });

  it('does not fetch when query is empty', () => {
    const { result } = renderHookWithClient(() => useSearchObjects(''));

    // Query should be disabled, so loading should be false immediately
    expect(result.current.isLoading).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });

  it('handles error from IPC', async () => {
    cleanup();
    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        searchBlocks: async () => ({
          success: false as const,
          error: {
            code: 'SEARCH_ERROR',
            message: 'FTS index corrupt',
            context: {},
          },
        }),
      })
    );

    const { result } = renderHookWithClient(() => useSearchObjects('meeting'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.searchResults).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });
});
