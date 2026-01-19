/**
 * useRefSuggestion Hook
 *
 * Manages the state for the reference suggestion popup.
 * Handles positioning, keyboard navigation, and selection.
 */

import * as React from 'react';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { RefSuggestionItem } from './RefSuggestion.js';

export interface UseRefSuggestionReturn {
  /**
   * Whether the suggestion popup is visible.
   */
  isOpen: boolean;

  /**
   * Current list of suggestion items.
   */
  items: RefSuggestionItem[];

  /**
   * Current search query.
   */
  query: string;

  /**
   * Currently selected item index.
   */
  selectedIndex: number;

  /**
   * Position for the popup (client coordinates).
   */
  position: { top: number; left: number } | null;

  /**
   * Select an item by index and execute the command.
   */
  selectItem: (index: number) => void;

  /**
   * Render callbacks to pass to the suggestion extension.
   */
  render: () => {
    onStart: (props: SuggestionProps<RefSuggestionItem>) => void;
    onUpdate: (props: SuggestionProps<RefSuggestionItem>) => void;
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
    onExit: () => void;
  };
}

export function useRefSuggestion(): UseRefSuggestionReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState<RefSuggestionItem[]>([]);
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  // Store the current command function from suggestion props
  const commandRef = React.useRef<((item: RefSuggestionItem) => void) | null>(null);

  const selectItem = React.useCallback(
    (index: number) => {
      const item = items[index];
      if (item && commandRef.current) {
        commandRef.current(item);
      }
    },
    [items]
  );

  const render = React.useCallback(() => {
    return {
      onStart: (props: SuggestionProps<RefSuggestionItem>) => {
        setIsOpen(true);
        setItems(props.items);
        setQuery(props.query);
        setSelectedIndex(0);
        commandRef.current = props.command;

        // Get position from client rect
        const rect = props.clientRect?.();
        if (rect) {
          setPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      },

      onUpdate: (props: SuggestionProps<RefSuggestionItem>) => {
        setItems(props.items);
        setQuery(props.query);
        commandRef.current = props.command;

        // Clamp selected index to valid range
        setSelectedIndex((prev) => Math.min(prev, Math.max(0, props.items.length - 1)));

        // Update position
        const rect = props.clientRect?.();
        if (rect) {
          setPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        }
      },

      onKeyDown: (props: { event: KeyboardEvent }) => {
        const { event } = props;

        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev <= 0 ? items.length - 1 : prev - 1));
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        if (event.key === 'Escape') {
          setIsOpen(false);
          return true;
        }

        return false;
      },

      onExit: () => {
        setIsOpen(false);
        setItems([]);
        setQuery('');
        setSelectedIndex(0);
        setPosition(null);
        commandRef.current = null;
      },
    };
  }, [items.length, selectItem, selectedIndex]);

  return {
    isOpen,
    items,
    query,
    selectedIndex,
    position,
    selectItem,
    render,
  };
}
