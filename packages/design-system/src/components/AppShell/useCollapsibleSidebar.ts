import * as React from 'react';
import type { UseCollapsibleSidebarOptions, UseCollapsibleSidebarReturn } from './types.js';

/**
 * Hook for managing collapsible sidebar state with optional localStorage persistence.
 *
 * Follows the same pattern as CollapsibleSection for consistency.
 *
 * @example
 * const { collapsed, toggle } = useCollapsibleSidebar({
 *   defaultCollapsed: false,
 *   storageKey: 'app.leftSidebar.collapsed'
 * });
 */
export function useCollapsibleSidebar({
  defaultCollapsed = false,
  storageKey,
}: UseCollapsibleSidebarOptions = {}): UseCollapsibleSidebarReturn {
  // Initialize from localStorage if storageKey provided
  // (Same pattern as CollapsibleSection lines 32-40)
  const [collapsed, setCollapsed] = React.useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultCollapsed;
  });

  // Persist to localStorage when state changes
  // (Same pattern as CollapsibleSection lines 43-47)
  React.useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, collapsed.toString());
    }
  }, [collapsed, storageKey]);

  const toggle = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  return { collapsed, toggle, setCollapsed };
}
