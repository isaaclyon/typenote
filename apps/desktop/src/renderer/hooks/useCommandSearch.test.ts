/**
 * Tests for useCommandSearch hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandSearch } from './useCommandSearch.js';
import type { ObjectSummary } from '@typenote/api';

// Mock the window.typenoteAPI
const mockListObjects = vi.fn();
const mockSearchBlocks = vi.fn();

vi.stubGlobal('window', {
  typenoteAPI: {
    listObjects: mockListObjects,
    searchBlocks: mockSearchBlocks,
  },
});

// Helper to create mock ObjectSummary
function makeObject(id: string, title: string, typeKey = 'Page'): ObjectSummary {
  return {
    id,
    title,
    typeId: `type_${typeKey.toLowerCase()}`,
    typeKey,
    updatedAt: new Date(),
  };
}

// Helper to flush promises and timers
async function flushPromisesAndTimers() {
  await vi.advanceTimersByTimeAsync(300);
  await vi.runAllTimersAsync();
}

describe('useCommandSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockListObjects.mockReset();
    mockSearchBlocks.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with idle state for empty query', () => {
    const { result } = renderHook(() => useCommandSearch(''));

    expect(result.current.status).toBe('idle');
  });

  it('starts with idle state for whitespace-only query', () => {
    const { result } = renderHook(() => useCommandSearch('   '));

    expect(result.current.status).toBe('idle');
  });

  it('enters success state after debounce and API call', async () => {
    mockListObjects.mockResolvedValue({
      success: true,
      result: [makeObject('obj_1', 'Test Page')],
    });
    mockSearchBlocks.mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useCommandSearch('test'));

    // Advance past debounce and flush promises
    await act(async () => {
      await flushPromisesAndTimers();
    });

    expect(result.current.status).toBe('success');
  });

  it('returns navigation commands for matching titles', async () => {
    mockListObjects.mockResolvedValue({
      success: true,
      result: [
        makeObject('obj_1', 'Meeting Notes'),
        makeObject('obj_2', 'Project Meeting'),
        makeObject('obj_3', 'Unrelated Page'),
      ],
    });
    mockSearchBlocks.mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useCommandSearch('meeting'));

    await act(async () => {
      await flushPromisesAndTimers();
    });

    expect(result.current.status).toBe('success');
    if (result.current.status === 'success') {
      // Should find 2 matches (case-insensitive)
      expect(result.current.commands).toHaveLength(2);
      expect(result.current.commands[0]?.label).toBe('Meeting Notes');
      expect(result.current.commands[1]?.label).toBe('Project Meeting');
    }
  });

  it('merges and deduplicates title + FTS results', async () => {
    mockListObjects.mockResolvedValue({
      success: true,
      result: [makeObject('obj_1', 'API Design', 'Page')],
    });
    mockSearchBlocks.mockResolvedValue({
      success: true,
      result: [
        { blockId: 'block_1', objectId: 'obj_1' }, // Same as title match
        { blockId: 'block_2', objectId: 'obj_2' }, // Different object (not in objects list)
      ],
    });

    const { result } = renderHook(() => useCommandSearch('api'));

    await act(async () => {
      await flushPromisesAndTimers();
    });

    expect(result.current.status).toBe('success');
    if (result.current.status === 'success') {
      // obj_1 should only appear once (deduped), obj_2 won't appear since it's not in objects list
      const objectIds = result.current.commands.map((c) => c.objectId);
      const obj1Count = objectIds.filter((id) => id === 'obj_1').length;
      expect(obj1Count).toBe(1);
    }
  });

  it('returns error state on API failure', async () => {
    mockListObjects.mockResolvedValue({
      success: false,
      error: { code: 'INTERNAL', message: 'Database error' },
    });
    mockSearchBlocks.mockResolvedValue({
      success: true,
      result: [],
    });

    const { result } = renderHook(() => useCommandSearch('test'));

    await act(async () => {
      await flushPromisesAndTimers();
    });

    expect(result.current.status).toBe('error');
    if (result.current.status === 'error') {
      expect(result.current.message).toBe('Database error');
    }
  });

  it('resets to idle when query becomes empty', async () => {
    mockListObjects.mockResolvedValue({
      success: true,
      result: [makeObject('obj_1', 'Test')],
    });
    mockSearchBlocks.mockResolvedValue({
      success: true,
      result: [],
    });

    const { result, rerender } = renderHook(({ query }) => useCommandSearch(query), {
      initialProps: { query: 'test' },
    });

    await act(async () => {
      await flushPromisesAndTimers();
    });

    expect(result.current.status).toBe('success');

    // Clear the query
    rerender({ query: '' });

    // Should immediately go back to idle (no debounce for empty)
    expect(result.current.status).toBe('idle');
  });
});
