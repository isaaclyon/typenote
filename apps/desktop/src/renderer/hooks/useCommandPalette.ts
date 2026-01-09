/**
 * useCommandPalette Hook
 *
 * Manages command palette open/close state and keyboard shortcuts.
 * Listens for Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle.
 */

import { useState, useEffect, useCallback } from 'react';

export interface UseCommandPaletteResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useCommandPalette(): UseCommandPaletteResult {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return { isOpen, open, close, toggle };
}
