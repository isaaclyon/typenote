import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseResizablePanelOptions {
  /** Initial width in pixels */
  defaultWidth: number;
  /** Minimum width in pixels */
  minWidth: number;
  /** Maximum width in pixels */
  maxWidth: number;
  /** Resize direction - 'left' for left sidebar, 'right' for right sidebar */
  direction: 'left' | 'right';
  /** localStorage key for width persistence */
  storageKey?: string | undefined;
  /** Called during resize with current width */
  onResize?: ((width: number) => void) | undefined;
  /** Called when resize completes */
  onResizeEnd?: ((width: number) => void) | undefined;
}

export interface UseResizablePanelReturn {
  /** Current width in pixels */
  width: number;
  /** Whether actively resizing */
  isResizing: boolean;
  /** Start resize operation (attach to handle mousedown) */
  handleResizeStart: (e: React.MouseEvent) => void;
  /** Programmatically set width */
  setWidth: (width: number) => void;
}

/**
 * Generic hook for resizable panels with optional localStorage persistence.
 *
 * Handles mouse drag events at document level so drag continues outside the handle.
 * Clamps width to min/max bounds during drag.
 *
 * @example
 * const { width, isResizing, handleResizeStart } = useResizablePanel({
 *   defaultWidth: 240,
 *   minWidth: 180,
 *   maxWidth: 400,
 *   direction: 'left',
 *   storageKey: 'sidebar.width',
 * });
 */
export function useResizablePanel({
  defaultWidth,
  minWidth,
  maxWidth,
  direction,
  storageKey,
  onResize,
  onResizeEnd,
}: UseResizablePanelOptions): UseResizablePanelReturn {
  // Clamp helper
  const clamp = useCallback(
    (value: number) => Math.max(minWidth, Math.min(maxWidth, value)),
    [minWidth, maxWidth]
  );

  // Initialize from localStorage if available
  const [width, setWidthState] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored !== null) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed)) {
            return clamp(parsed);
          }
        }
      } catch {
        // localStorage unavailable (private browsing, quota exceeded, etc.)
      }
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);

  // Refs for drag state (avoid re-renders during drag)
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Clamp and set width, call onResize callback
  const setWidth = useCallback(
    (newWidth: number) => {
      const clamped = clamp(newWidth);
      setWidthState(clamped);
      onResize?.(clamped);
    },
    [clamp, onResize]
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startXRef.current;
        // For left sidebar: drag right = increase width
        // For right sidebar: drag left = increase width (invert delta)
        const directionMultiplier = direction === 'left' ? 1 : -1;
        const newWidth = startWidthRef.current + deltaX * directionMultiplier;
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        cleanupRef.current = null;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Store cleanup function for unmount
      cleanupRef.current = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    },
    [width, direction, setWidth, clamp]
  );

  // Save to localStorage and call onResizeEnd when drag ends
  const prevIsResizing = useRef(isResizing);
  useEffect(() => {
    // Only trigger when transitioning from resizing to not resizing
    if (prevIsResizing.current && !isResizing) {
      // Save to localStorage if key provided
      if (storageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, width.toString());
        } catch {
          // localStorage unavailable (private browsing, quota exceeded, etc.)
        }
      }
      // Always call onResizeEnd callback
      onResizeEnd?.(width);
    }
    prevIsResizing.current = isResizing;
  }, [isResizing, width, storageKey, onResizeEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return { width, isResizing, handleResizeStart, setWidth };
}
