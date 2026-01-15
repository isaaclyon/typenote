import { useState, useEffect, useCallback } from 'react';
import type { UseCommandPaletteKeyboardOptions, UseCommandPaletteKeyboardReturn } from './types.js';

/**
 * useCommandPaletteKeyboard - Keyboard navigation hook for CommandPalette.
 *
 * Handles:
 * - ArrowUp/ArrowDown: Navigate items (with wrap-around)
 * - Enter: Select current item
 * - Escape: Close palette
 *
 * @example
 * const { selectedIndex, setSelectedIndex } = useCommandPaletteKeyboard({
 *   itemCount: items.length,
 *   onSelect: (index) => handleSelect(items[index]),
 *   onEscape: () => setOpen(false),
 *   enabled: isOpen,
 * });
 */
export function useCommandPaletteKeyboard(
  options: UseCommandPaletteKeyboardOptions
): UseCommandPaletteKeyboardReturn {
  const { itemCount, onSelect, onEscape, enabled = true } = options;

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when item count changes (e.g., search results update)
  useEffect(() => {
    if (selectedIndex >= itemCount) {
      setSelectedIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, selectedIndex]);

  // Reset to 0 when re-enabled (palette opens)
  useEffect(() => {
    if (enabled) {
      setSelectedIndex(0);
    }
  }, [enabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0)); // Wrap to start
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1)); // Wrap to end
          break;

        case 'Enter':
          e.preventDefault();
          onSelect(selectedIndex);
          break;

        case 'Escape':
          e.preventDefault();
          onEscape();
          break;
      }
    },
    [enabled, itemCount, selectedIndex, onSelect, onEscape]
  );

  // Add/remove event listener
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
}
