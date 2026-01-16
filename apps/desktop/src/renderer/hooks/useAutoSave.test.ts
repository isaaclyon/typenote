/**
 * useAutoSave Hook Tests
 *
 * Tests for the hook that auto-saves TipTap editor changes with debouncing.
 * Following strict TDD: RED -> GREEN -> REFACTOR for each cycle.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Editor } from '@tiptap/react';
import { useAutoSave } from './useAutoSave.js';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Editor Helper
// ─────────────────────────────────────────────────────────────────────────────

interface MockEditor {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  emit: (event: string) => void;
  getJSON: ReturnType<typeof vi.fn>;
}

function createMockEditor(): MockEditor {
  const listeners: Record<string, Array<() => void>> = {};
  return {
    on: vi.fn((event: string, handler: () => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(handler);
    }),
    off: vi.fn((event: string, handler: () => void) => {
      listeners[event] = listeners[event]?.filter((h) => h !== handler) ?? [];
    }),
    emit: (event: string) => {
      listeners[event]?.forEach((h) => h());
    },
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock IPC API
// ─────────────────────────────────────────────────────────────────────────────

const mockApplyBlockPatch = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  // @ts-expect-error - Mocking global window.typenoteAPI
  window.typenoteAPI = {
    applyBlockPatch: mockApplyBlockPatch,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// TDD Cycle 1: Returns initial state when editor is null
// ─────────────────────────────────────────────────────────────────────────────

describe('useAutoSave', () => {
  describe('Cycle 1: initial state', () => {
    it('returns initial state when editor is null', () => {
      const { result } = renderHook(() =>
        useAutoSave({ editor: null, objectId: 'obj1', initialBlocks: [] })
      );

      expect(result.current).toEqual({
        isSaving: false,
        lastSaved: null,
        error: null,
      });
    });

    it('returns initial state when editor is provided', () => {
      const mockEditor = createMockEditor();
      const { result } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
        })
      );

      expect(result.current).toEqual({
        isSaving: false,
        lastSaved: null,
        error: null,
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 2: Debounces editor updates
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 2: debouncing', () => {
    it('debounces save calls', async () => {
      const mockEditor = createMockEditor();
      // Make editor return content that differs from initialBlocks
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });
      mockApplyBlockPatch.mockResolvedValue({ success: true, result: {} });

      renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 100,
        })
      );

      // Trigger multiple updates rapidly
      mockEditor.emit('update');
      mockEditor.emit('update');
      mockEditor.emit('update');

      // Should not have saved yet (still debouncing)
      expect(mockApplyBlockPatch).not.toHaveBeenCalled();

      // Advance timers past debounce
      await vi.advanceTimersByTimeAsync(150);

      // Should have saved exactly once
      expect(mockApplyBlockPatch).toHaveBeenCalledTimes(1);
    });

    it('attaches listener to editor on mount', () => {
      const mockEditor = createMockEditor();

      renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
        })
      );

      expect(mockEditor.on).toHaveBeenCalledWith('update', expect.any(Function));
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 3: Sets isSaving during save
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 3: isSaving state', () => {
    it('sets isSaving true during save operation', async () => {
      const mockEditor = createMockEditor();
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });

      // Track isSaving values during the mock
      let capturedIsSaving = false;
      let resolveApplyPatch!: (value: unknown) => void;
      mockApplyBlockPatch.mockImplementation(() => {
        // Capture the current hook state via closure - need to read it later
        return new Promise((resolve) => {
          resolveApplyPatch = resolve;
        });
      });

      const { result } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 50,
        })
      );

      // Initially not saving
      expect(result.current.isSaving).toBe(false);

      // Trigger update
      act(() => {
        mockEditor.emit('update');
      });

      // Advance past debounce
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Capture isSaving while promise is pending
      capturedIsSaving = result.current.isSaving;

      // Resolve the save
      await act(async () => {
        resolveApplyPatch({ success: true, result: {} });
      });

      // Verify isSaving was true during save
      expect(capturedIsSaving).toBe(true);

      // Should no longer be saving after resolution
      expect(result.current.isSaving).toBe(false);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 4: Updates lastSaved on success
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 4: lastSaved state', () => {
    it('updates lastSaved on successful save', async () => {
      const mockEditor = createMockEditor();
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });
      mockApplyBlockPatch.mockResolvedValue({ success: true, result: {} });

      const beforeSave = new Date();

      const { result } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 50,
        })
      );

      // Initially null
      expect(result.current.lastSaved).toBeNull();

      // Trigger update and wait for save
      act(() => {
        mockEditor.emit('update');
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const afterSave = new Date();

      // lastSaved should be set
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      const lastSaved = result.current.lastSaved;
      if (lastSaved !== null) {
        expect(lastSaved.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
        expect(lastSaved.getTime()).toBeLessThanOrEqual(afterSave.getTime());
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 5: Sets error on failure
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 5: error state', () => {
    it('sets error state on save failure', async () => {
      const mockEditor = createMockEditor();
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });
      mockApplyBlockPatch.mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL', message: 'Database error' },
      });

      const { result } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 50,
        })
      );

      // Initially no error
      expect(result.current.error).toBeNull();

      // Trigger update and wait for save
      act(() => {
        mockEditor.emit('update');
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Error should be set
      expect(result.current.error).toBe('Database error');

      // lastSaved should NOT be updated on failure
      expect(result.current.lastSaved).toBeNull();
    });

    it('clears error on subsequent successful save', async () => {
      const mockEditor = createMockEditor();
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });

      // First save fails
      mockApplyBlockPatch.mockResolvedValueOnce({
        success: false,
        error: { code: 'INTERNAL', message: 'Database error' },
      });

      const { result } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 50,
        })
      );

      // Trigger first update (will fail)
      act(() => {
        mockEditor.emit('update');
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.error).toBe('Database error');

      // Second save succeeds
      mockApplyBlockPatch.mockResolvedValueOnce({ success: true, result: {} });

      // Trigger second update
      act(() => {
        mockEditor.emit('update');
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // Error should be cleared
      expect(result.current.error).toBeNull();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 6: Skips save when no changes
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 6: no-op when unchanged', () => {
    it('does not call applyBlockPatch when content unchanged', async () => {
      const mockEditor = createMockEditor();
      // Empty content matches empty initialBlocks
      mockEditor.getJSON.mockReturnValue({ type: 'doc', content: [] });

      renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 50,
        })
      );

      // Trigger update and wait for debounce
      act(() => {
        mockEditor.emit('update');
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      // applyBlockPatch should NOT be called since no ops generated
      expect(mockApplyBlockPatch).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 7: Cleans up on unmount
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 7: cleanup', () => {
    it('removes editor listener on unmount', () => {
      const mockEditor = createMockEditor();

      const { unmount } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
        })
      );

      // Get the handler that was attached
      const onCall = mockEditor.on.mock.calls.find((call) => call[0] === 'update');
      expect(onCall).toBeDefined();
      const handler = onCall?.[1];

      unmount();

      expect(mockEditor.off).toHaveBeenCalledWith('update', handler);
    });

    it('flushes pending save immediately on unmount (bug fix for lost edits)', async () => {
      const mockEditor = createMockEditor();
      mockEditor.getJSON.mockReturnValue({
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      });
      mockApplyBlockPatch.mockResolvedValue({ success: true, result: {} });

      const { unmount } = renderHook(() =>
        useAutoSave({
          editor: mockEditor as unknown as Editor,
          objectId: 'obj1',
          initialBlocks: [],
          debounceMs: 500, // Long debounce to simulate user navigating quickly
        })
      );

      // Trigger update (simulates user typing)
      act(() => {
        mockEditor.emit('update');
      });

      // User navigates before debounce completes (e.g., clicks next daily note)
      unmount();

      // CRITICAL: Save should execute immediately on unmount, not be cancelled
      // This prevents data loss when navigating away before debounce completes
      expect(mockApplyBlockPatch).toHaveBeenCalledTimes(1);
    });
  });
});
