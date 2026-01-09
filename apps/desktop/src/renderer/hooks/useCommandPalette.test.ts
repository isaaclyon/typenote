/**
 * Tests for useCommandPalette hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandPalette } from './useCommandPalette.js';

describe('useCommandPalette', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    vi.spyOn(window, 'addEventListener');
    vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with isOpen = false', () => {
    const { result } = renderHook(() => useCommandPalette());

    expect(result.current.isOpen).toBe(false);
  });

  it('opens on Cmd+K', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('opens on Ctrl+K', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
      });
      window.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('toggles on repeated Cmd+K', () => {
    const { result } = renderHook(() => useCommandPalette());

    // First press opens
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(result.current.isOpen).toBe(true);

    // Second press closes
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('close() sets isOpen to false', () => {
    const { result } = renderHook(() => useCommandPalette());

    // Open first
    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    // Close
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('open() sets isOpen to true', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('toggle() flips isOpen', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('ignores K without modifier', () => {
    const { result } = renderHook(() => useCommandPalette());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useCommandPalette());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
