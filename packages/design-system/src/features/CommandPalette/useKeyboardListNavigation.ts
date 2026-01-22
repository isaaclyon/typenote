import { useState, useEffect, useCallback, type RefObject } from 'react';

import type { CommandPaletteItemData } from './types.js';

interface UseKeyboardListNavigationOptions {
  items: CommandPaletteItemData[];
  onSelect: (item: CommandPaletteItemData) => void;
  onClose: () => void;
  listRef?: RefObject<HTMLDivElement | null>;
}

interface UseKeyboardListNavigationReturn {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Hook for managing keyboard navigation in a list of items.
 * Handles arrow key navigation, Enter to select, and Escape to close.
 * Automatically scrolls the selected item into view.
 */
export function useKeyboardListNavigation({
  items,
  onSelect,
  onClose,
  listRef,
}: UseKeyboardListNavigationOptions): UseKeyboardListNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when items change (e.g., new search results)
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  // Scroll selected item into view when selection changes
  useEffect(() => {
    if (!listRef?.current) return;

    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);

    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, listRef]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (items.length === 0) {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((current) => (current + 1) % items.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((current) => (current - 1 + items.length) % items.length);
          break;
        case 'Enter': {
          event.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedItem) {
            onSelect(selectedItem);
          }
          break;
        }
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    },
    [items, selectedIndex, onSelect, onClose]
  );

  return {
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
  };
}
