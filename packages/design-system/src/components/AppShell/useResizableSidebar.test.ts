import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useResizableSidebar } from './useResizableSidebar.js';

describe('useResizableSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // Helper to simulate mouse events
  function fireMouseMove(clientX: number) {
    const event = new MouseEvent('mousemove', { clientX, bubbles: true });
    document.dispatchEvent(event);
  }

  function fireMouseUp() {
    const event = new MouseEvent('mouseup', { bubbles: true });
    document.dispatchEvent(event);
  }

  function startResize(
    result: { current: ReturnType<typeof useResizableSidebar> },
    clientX: number
  ) {
    const mockEvent = { clientX, preventDefault: vi.fn(), stopPropagation: vi.fn() };
    act(() => {
      result.current.handleResizeStart(mockEvent as unknown as React.MouseEvent);
    });
  }

  describe('initial state', () => {
    it('returns default width when not collapsed', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left' }));

      expect(result.current.width).toBe(240);
      expect(result.current.collapsed).toBe(false);
      expect(result.current.isResizing).toBe(false);
    });

    it('returns rail width (48px) when collapsed', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({ side: 'left', defaultCollapsed: true })
      );

      expect(result.current.width).toBe(48);
      expect(result.current.collapsed).toBe(true);
    });

    it('reads collapsed state from localStorage', () => {
      localStorage.setItem('test.collapsed', 'true');

      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          collapsedStorageKey: 'test.collapsed',
        })
      );

      expect(result.current.collapsed).toBe(true);
    });

    it('reads width from localStorage', () => {
      localStorage.setItem('test.width', '300');

      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          widthStorageKey: 'test.width',
        })
      );

      expect(result.current.width).toBe(300);
    });
  });

  describe('toggle', () => {
    it('toggles collapsed state', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left' }));

      expect(result.current.collapsed).toBe(false);

      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(true);

      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(false);
    });

    it('persists collapsed state to localStorage', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          collapsedStorageKey: 'test.collapsed',
        })
      );

      act(() => result.current.toggle());
      expect(localStorage.getItem('test.collapsed')).toBe('true');
    });
  });

  describe('snap-to-collapse', () => {
    it('collapses when drag ends below snap threshold (120px)', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left' }));

      // Start resize at 240
      startResize(result, 240);

      // Drag left to 100px (below threshold)
      act(() => fireMouseMove(100));

      // Release - should snap to collapsed
      act(() => fireMouseUp());

      expect(result.current.collapsed).toBe(true);
      expect(result.current.width).toBe(48); // Rail width
    });

    it('does not collapse when drag ends above snap threshold', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left' }));

      // Start resize at 240
      startResize(result, 240);

      // Drag left to 190px (above threshold)
      act(() => fireMouseMove(190));

      // Release - should not collapse
      act(() => fireMouseUp());

      expect(result.current.collapsed).toBe(false);
      expect(result.current.width).toBe(190);
    });

    it('respects custom snap threshold', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({ side: 'left', snapThreshold: 150 })
      );

      startResize(result, 240);
      act(() => fireMouseMove(140)); // Below custom threshold
      act(() => fireMouseUp());

      expect(result.current.collapsed).toBe(true);
    });
  });

  describe('restore width on expand', () => {
    it('restores previous width when expanding from collapsed', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          widthStorageKey: 'test.width',
        })
      );

      // Resize to 300px
      startResize(result, 240);
      act(() => fireMouseMove(300));
      act(() => fireMouseUp());

      expect(result.current.width).toBe(300);

      // Collapse
      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(true);
      expect(result.current.width).toBe(48);

      // Expand - should restore 300px
      act(() => result.current.toggle());
      expect(result.current.collapsed).toBe(false);
      expect(result.current.width).toBe(300);
    });

    it('uses default width if no previous width stored', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({ side: 'left', defaultCollapsed: true })
      );

      expect(result.current.width).toBe(48);

      // Expand - should use default 240px
      act(() => result.current.toggle());
      expect(result.current.width).toBe(240);
    });
  });

  describe('width clamping', () => {
    it('clamps to minWidth on drag end (above snap threshold)', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({ side: 'left', minWidth: 180, snapThreshold: 100 })
      );

      startResize(result, 240);
      act(() => fireMouseMove(160)); // Between snap threshold and minWidth
      act(() => fireMouseUp());

      // Width should be clamped to minWidth (not snapped because above threshold)
      expect(result.current.collapsed).toBe(false);
      expect(result.current.width).toBe(180);
    });

    it('clamps to maxWidth during drag', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left', maxWidth: 400 }));

      startResize(result, 240);
      act(() => fireMouseMove(450)); // Above max

      expect(result.current.width).toBe(400);
    });
  });

  describe('right sidebar', () => {
    it('inverts drag direction for right sidebar', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'right' }));

      // For right sidebar, dragging left (negative clientX change) increases width
      startResize(result, 500);
      act(() => fireMouseMove(450)); // Drag 50px left

      expect(result.current.width).toBe(290); // 240 + 50
    });
  });

  describe('setCollapsed', () => {
    it('allows programmatic collapse/expand', () => {
      const { result } = renderHook(() => useResizableSidebar({ side: 'left' }));

      act(() => result.current.setCollapsed(true));
      expect(result.current.collapsed).toBe(true);

      act(() => result.current.setCollapsed(false));
      expect(result.current.collapsed).toBe(false);
    });
  });

  describe('localStorage persistence', () => {
    it('saves width to localStorage on resize end', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          widthStorageKey: 'test.width',
        })
      );

      startResize(result, 240);
      act(() => fireMouseMove(350));
      act(() => fireMouseUp());

      expect(localStorage.getItem('test.width')).toBe('350');
    });

    it('saves collapsed state to localStorage on toggle', () => {
      const { result } = renderHook(() =>
        useResizableSidebar({
          side: 'left',
          collapsedStorageKey: 'test.collapsed',
        })
      );

      act(() => result.current.toggle());
      expect(localStorage.getItem('test.collapsed')).toBe('true');

      act(() => result.current.toggle());
      expect(localStorage.getItem('test.collapsed')).toBe('false');
    });
  });
});
