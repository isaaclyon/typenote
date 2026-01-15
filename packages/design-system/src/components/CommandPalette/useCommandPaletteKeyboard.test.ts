import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useCommandPaletteKeyboard } from './useCommandPaletteKeyboard.js';

describe('useCommandPaletteKeyboard', () => {
  const mockOnSelect = vi.fn();
  const mockOnEscape = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Unmount all rendered hooks
    vi.clearAllMocks();
  });

  // Helper to simulate keyboard events
  function pressKey(key: string) {
    const event = new KeyboardEvent('keydown', { key, bubbles: true });
    document.dispatchEvent(event);
  }

  describe('arrow navigation', () => {
    it('increments selectedIndex on ArrowDown', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 5,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      expect(result.current.selectedIndex).toBe(0);

      act(() => pressKey('ArrowDown'));
      expect(result.current.selectedIndex).toBe(1);

      act(() => pressKey('ArrowDown'));
      expect(result.current.selectedIndex).toBe(2);
    });

    it('decrements selectedIndex on ArrowUp', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 5,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      // Start at index 2
      act(() => {
        result.current.setSelectedIndex(2);
      });

      act(() => pressKey('ArrowUp'));
      expect(result.current.selectedIndex).toBe(1);

      act(() => pressKey('ArrowUp'));
      expect(result.current.selectedIndex).toBe(0);
    });

    it('wraps to first item when ArrowDown at last item', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 3,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      // Go to last item
      act(() => {
        result.current.setSelectedIndex(2);
      });

      act(() => pressKey('ArrowDown'));
      expect(result.current.selectedIndex).toBe(0); // Wrapped to first
    });

    it('wraps to last item when ArrowUp at first item', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 3,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      expect(result.current.selectedIndex).toBe(0);

      act(() => pressKey('ArrowUp'));
      expect(result.current.selectedIndex).toBe(2); // Wrapped to last
    });
  });

  describe('selection', () => {
    it('calls onSelect with current index on Enter', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 5,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      // Move to index 2
      act(() => {
        result.current.setSelectedIndex(2);
      });

      act(() => pressKey('Enter'));
      expect(mockOnSelect).toHaveBeenCalledWith(2);
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('escape', () => {
    it('calls onEscape when Escape is pressed', () => {
      renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 5,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: true,
        })
      );

      act(() => pressKey('Escape'));
      expect(mockOnEscape).toHaveBeenCalledTimes(1);
    });
  });

  describe('enabled state', () => {
    it('does not respond to keys when disabled', () => {
      const { result } = renderHook(() =>
        useCommandPaletteKeyboard({
          itemCount: 5,
          onSelect: mockOnSelect,
          onEscape: mockOnEscape,
          enabled: false,
        })
      );

      act(() => pressKey('ArrowDown'));
      expect(result.current.selectedIndex).toBe(0); // Unchanged

      act(() => pressKey('Enter'));
      expect(mockOnSelect).not.toHaveBeenCalled();

      act(() => pressKey('Escape'));
      expect(mockOnEscape).not.toHaveBeenCalled();
    });

    it('resets selectedIndex to 0 when enabled changes to true', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useCommandPaletteKeyboard({
            itemCount: 5,
            onSelect: mockOnSelect,
            onEscape: mockOnEscape,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      // Move to index 3
      act(() => {
        result.current.setSelectedIndex(3);
      });
      expect(result.current.selectedIndex).toBe(3);

      // Disable
      rerender({ enabled: false });

      // Re-enable - should reset to 0
      rerender({ enabled: true });
      expect(result.current.selectedIndex).toBe(0);
    });
  });

  describe('itemCount changes', () => {
    it('clamps selectedIndex when itemCount decreases', () => {
      const { result, rerender } = renderHook(
        ({ itemCount }) =>
          useCommandPaletteKeyboard({
            itemCount,
            onSelect: mockOnSelect,
            onEscape: mockOnEscape,
            enabled: true,
          }),
        { initialProps: { itemCount: 10 } }
      );

      // Set to index 8
      act(() => {
        result.current.setSelectedIndex(8);
      });
      expect(result.current.selectedIndex).toBe(8);

      // Reduce item count to 5 - index should clamp to 4 (last valid)
      rerender({ itemCount: 5 });
      expect(result.current.selectedIndex).toBe(4);
    });

    it('handles itemCount becoming 0', () => {
      const { result, rerender } = renderHook(
        ({ itemCount }) =>
          useCommandPaletteKeyboard({
            itemCount,
            onSelect: mockOnSelect,
            onEscape: mockOnEscape,
            enabled: true,
          }),
        { initialProps: { itemCount: 5 } }
      );

      // Set to index 3
      act(() => {
        result.current.setSelectedIndex(3);
      });

      // No items
      rerender({ itemCount: 0 });
      expect(result.current.selectedIndex).toBe(0);

      // Arrow keys should not crash
      act(() => pressKey('ArrowDown'));
      expect(result.current.selectedIndex).toBe(0);
    });
  });
});
