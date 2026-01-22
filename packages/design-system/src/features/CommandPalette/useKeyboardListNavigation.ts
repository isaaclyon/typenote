import { useState, useEffect, useCallback } from 'react';

import type { CommandPaletteItemData } from './types.js';

interface UseKeyboardListNavigationOptions {
  items: CommandPaletteItemData[];
  onSelect: (item: CommandPaletteItemData) => void;
  onClose: () => void;
}

interface UseKeyboardListNavigationReturn {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Hook for managing keyboard navigation in a list of items.
 * Handles arrow key navigation, Enter to select, and Escape to close.
 */
export function useKeyboardListNavigation({
  items,
  onSelect,
  onClose,
}: UseKeyboardListNavigationOptions): UseKeyboardListNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when items change (e.g., new search results)
  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

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
