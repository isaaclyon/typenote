import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useResizablePanel } from './useResizablePanel.js';

describe('useResizablePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Helper to simulate mouse events on document
  function fireMouseMove(clientX: number) {
    const event = new MouseEvent('mousemove', { clientX, bubbles: true });
    document.dispatchEvent(event);
  }

  function fireMouseUp() {
    const event = new MouseEvent('mouseup', { bubbles: true });
    document.dispatchEvent(event);
  }

  describe('initial state', () => {
    it('returns defaultWidth when no localStorage value exists', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      expect(result.current.width).toBe(240);
      expect(result.current.isResizing).toBe(false);
    });

    it('reads initial width from localStorage if storageKey provided', () => {
      localStorage.setItem('test.width', '300');

      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          storageKey: 'test.width',
        })
      );

      expect(result.current.width).toBe(300);
    });

    it('clamps localStorage value to min/max bounds', () => {
      localStorage.setItem('test.width', '500'); // Above max

      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          storageKey: 'test.width',
        })
      );

      expect(result.current.width).toBe(400); // Clamped to max
    });

    it('ignores invalid localStorage values', () => {
      localStorage.setItem('test.width', 'not-a-number');

      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          storageKey: 'test.width',
        })
      );

      expect(result.current.width).toBe(240); // Falls back to default
    });
  });

  describe('resize drag (left direction)', () => {
    it('updates width during drag based on mouse movement', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      // Simulate mousedown at x=240
      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      expect(result.current.isResizing).toBe(true);

      // Drag right by 50px (increasing width for left sidebar)
      act(() => fireMouseMove(290));
      expect(result.current.width).toBe(290); // 240 + 50
    });

    it('clamps width to minWidth during drag', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      // Drag left by 100px (would be 140, below min)
      act(() => fireMouseMove(140));
      expect(result.current.width).toBe(180); // Clamped to min
    });

    it('clamps width to maxWidth during drag', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      // Drag right by 200px (would be 440, above max)
      act(() => fireMouseMove(440));
      expect(result.current.width).toBe(400); // Clamped to max
    });

    it('sets isResizing to false on mouseup', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      expect(result.current.isResizing).toBe(true);

      act(() => fireMouseUp());
      expect(result.current.isResizing).toBe(false);
    });
  });

  describe('resize drag (right direction)', () => {
    it('inverts delta for right-side panels', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'right',
        })
      );

      // For right sidebar, handle is on left edge
      // Dragging left (negative clientX) should increase width
      const mockEvent = { clientX: 500, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      // Drag left by 50px (clientX decreases, but width should increase for right sidebar)
      act(() => fireMouseMove(450));
      expect(result.current.width).toBe(290); // 240 + 50 (inverted)
    });
  });

  describe('localStorage persistence', () => {
    it('saves width to localStorage on drag end', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          storageKey: 'test.width',
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      act(() => fireMouseMove(300));
      act(() => fireMouseUp());

      expect(localStorage.getItem('test.width')).toBe('300');
    });

    it('does not save to localStorage if no storageKey provided', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      act(() => fireMouseMove(300));
      act(() => fireMouseUp());

      expect(localStorage.length).toBe(0);
    });
  });

  describe('callbacks', () => {
    it('calls onResize during drag with current width', () => {
      const onResize = vi.fn();
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          onResize,
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      act(() => fireMouseMove(280));
      expect(onResize).toHaveBeenCalledWith(280);
    });

    it('calls onResizeEnd on drag complete with final width', () => {
      const onResizeEnd = vi.fn();
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
          onResizeEnd,
        })
      );

      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      act(() => fireMouseMove(300));
      act(() => fireMouseUp());

      expect(onResizeEnd).toHaveBeenCalledWith(300);
    });
  });

  describe('setWidth', () => {
    it('allows programmatic width changes', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      act(() => {
        result.current.setWidth(350);
      });

      expect(result.current.width).toBe(350);
    });

    it('clamps programmatic width changes to bounds', () => {
      const { result } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      act(() => {
        result.current.setWidth(500);
      });

      expect(result.current.width).toBe(400); // Clamped to max
    });
  });

  describe('cleanup', () => {
    it('removes document event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { result, unmount } = renderHook(() =>
        useResizablePanel({
          defaultWidth: 240,
          minWidth: 180,
          maxWidth: 400,
          direction: 'left',
        })
      );

      // Start a drag
      const mockEvent = { clientX: 240, preventDefault: vi.fn(), stopPropagation: vi.fn() };
      act(() => {
        result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
      });

      // Unmount without mouseup
      unmount();

      // Should have removed listeners
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
