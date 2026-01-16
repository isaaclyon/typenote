import * as React from 'react';
import { useResizablePanel } from '../../hooks/useResizablePanel.js';

const RAIL_WIDTH = 48;
const DEFAULT_WIDTH = 240;
const DEFAULT_MIN_WIDTH = 180;
const DEFAULT_MAX_WIDTH = 400;
const DEFAULT_SNAP_THRESHOLD = 120;

export interface UseResizableSidebarOptions {
  /** Which side of the layout */
  side: 'left' | 'right';
  /** Default width when expanded */
  defaultWidth?: number | undefined;
  /** Minimum width before snap-to-collapse */
  minWidth?: number | undefined;
  /** Maximum width */
  maxWidth?: number | undefined;
  /** Width below which sidebar snaps to collapsed */
  snapThreshold?: number | undefined;
  /** localStorage key for width */
  widthStorageKey?: string | undefined;
  /** localStorage key for collapsed state */
  collapsedStorageKey?: string | undefined;
  /** Default collapsed state */
  defaultCollapsed?: boolean | undefined;
}

export interface UseResizableSidebarReturn {
  /** Current width (rail width if collapsed) */
  width: number;
  /** Whether sidebar is collapsed */
  collapsed: boolean;
  /** Whether actively resizing */
  isResizing: boolean;
  /** Toggle collapsed state */
  toggle: () => void;
  /** Set collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Start resize operation */
  handleResizeStart: (e: React.MouseEvent) => void;
}

/**
 * Hook for resizable sidebar with snap-to-collapse behavior.
 *
 * Combines resize logic (from useResizablePanel) with collapse state management.
 * When dragging below snapThreshold, automatically collapses.
 * When expanding, restores previous width.
 *
 * @example
 * const { width, collapsed, isResizing, toggle, handleResizeStart } = useResizableSidebar({
 *   side: 'left',
 *   widthStorageKey: 'sidebar.left.width',
 *   collapsedStorageKey: 'sidebar.left.collapsed',
 * });
 */
export function useResizableSidebar({
  side,
  defaultWidth = DEFAULT_WIDTH,
  minWidth = DEFAULT_MIN_WIDTH,
  maxWidth = DEFAULT_MAX_WIDTH,
  snapThreshold = DEFAULT_SNAP_THRESHOLD,
  widthStorageKey,
  collapsedStorageKey,
  defaultCollapsed = false,
}: UseResizableSidebarOptions): UseResizableSidebarReturn {
  // Collapsed state with localStorage persistence
  const [collapsed, setCollapsedState] = React.useState(() => {
    if (collapsedStorageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(collapsedStorageKey);
        if (stored !== null) {
          return stored === 'true';
        }
      } catch {
        // localStorage unavailable (private browsing, quota exceeded, etc.)
      }
    }
    return defaultCollapsed;
  });

  // Track the last expanded width for restoration
  const [lastExpandedWidth, setLastExpandedWidth] = React.useState<number>(() => {
    if (widthStorageKey && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(widthStorageKey);
        if (stored !== null) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed)) {
            return Math.max(minWidth, Math.min(maxWidth, parsed));
          }
        }
      } catch {
        // localStorage unavailable (private browsing, quota exceeded, etc.)
      }
    }
    return defaultWidth;
  });

  // Use the generic resize panel hook
  // If snap-to-collapse is enabled (snapThreshold > 0), allow dragging to 0 for detection
  // If snap is disabled (snapThreshold = 0), enforce hard stop at minWidth
  const {
    width: resizeWidth,
    isResizing,
    handleResizeStart: panelHandleResizeStart,
    setWidth,
  } = useResizablePanel({
    defaultWidth: lastExpandedWidth,
    minWidth: snapThreshold > 0 ? 0 : minWidth, // Hard stop at minWidth when snap disabled
    maxWidth,
    direction: side,
    storageKey: widthStorageKey,
    onResizeEnd: (finalWidth) => {
      // Snap-to-collapse if below threshold
      if (finalWidth < snapThreshold) {
        setCollapsedState(true);
        // Don't update lastExpandedWidth - keep previous valid width
      } else {
        // Clamp to actual minWidth for final value
        const clampedWidth = Math.max(minWidth, finalWidth);
        setWidth(clampedWidth);
        setLastExpandedWidth(clampedWidth);
      }
    },
  });

  // Wrap handleResizeStart to handle snap threshold
  const handleResizeStart = React.useCallback(
    (e: React.MouseEvent) => {
      panelHandleResizeStart(e);
    },
    [panelHandleResizeStart]
  );

  // Persist collapsed state to localStorage
  React.useEffect(() => {
    if (collapsedStorageKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(collapsedStorageKey, collapsed.toString());
      } catch {
        // localStorage unavailable (private browsing, quota exceeded, etc.)
      }
    }
  }, [collapsed, collapsedStorageKey]);

  // Toggle collapsed state
  const toggle = React.useCallback(() => {
    setCollapsedState((c) => {
      if (c) {
        // Expanding - restore last width
        setWidth(lastExpandedWidth);
      }
      return !c;
    });
  }, [lastExpandedWidth, setWidth]);

  // Set collapsed with width restoration
  const setCollapsed = React.useCallback(
    (newCollapsed: boolean) => {
      if (!newCollapsed && collapsed) {
        // Expanding - restore last width
        setWidth(lastExpandedWidth);
      }
      setCollapsedState(newCollapsed);
    },
    [collapsed, lastExpandedWidth, setWidth]
  );

  return {
    width: collapsed ? RAIL_WIDTH : resizeWidth,
    collapsed,
    isResizing,
    toggle,
    setCollapsed,
    handleResizeStart,
  };
}
