/**
 * SuggestionPopup Component
 *
 * Autocomplete dropdown for wiki-links and mentions.
 * Shows matching objects and a "Create new" option when query is non-empty.
 */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ObjectSummary } from '@typenote/api';
import { ScrollArea, cn } from '@typenote/design-system';
import { FileText, Plus } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SuggestionPopupProps {
  items: ObjectSummary[];
  isLoading: boolean;
  query: string;
  onSelect: (item: ObjectSummary | { createNew: true; title: string }) => void;
}

export interface SuggestionPopupRef {
  onKeyDown: (event: { key: string }) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const SuggestionPopup = forwardRef<SuggestionPopupRef, SuggestionPopupProps>(
  ({ items, isLoading, query, onSelect }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Use refs to track current values for imperative handle (avoids stale closures)
    const selectedIndexRef = useRef(0);
    const itemsRef = useRef(items);
    const queryRef = useRef(query);
    const onSelectRef = useRef(onSelect);

    // Keep refs in sync with props
    itemsRef.current = items;
    queryRef.current = query;
    onSelectRef.current = onSelect;

    // Include "Create new" as an extra option when query is non-empty
    const hasCreateNew = query.trim().length > 0;

    // Reset selection when items change
    useEffect(() => {
      setSelectedIndex(0);
      selectedIndexRef.current = 0;
    }, [items, query]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ key }) => {
        const currentItems = itemsRef.current;
        const currentQuery = queryRef.current;
        const currentHasCreateNew = currentQuery.trim().length > 0;
        const currentTotalItems = currentItems.length + (currentHasCreateNew ? 1 : 0);

        if (key === 'ArrowUp') {
          const next = (selectedIndexRef.current - 1 + currentTotalItems) % currentTotalItems;
          selectedIndexRef.current = next;
          setSelectedIndex(next);
          return true;
        }
        if (key === 'ArrowDown') {
          const next = (selectedIndexRef.current + 1) % currentTotalItems;
          selectedIndexRef.current = next;
          setSelectedIndex(next);
          return true;
        }
        if (key === 'Enter') {
          const currentIndex = selectedIndexRef.current;
          const selectedItem = currentItems[currentIndex];
          if (selectedItem !== undefined) {
            onSelectRef.current(selectedItem);
          } else if (currentHasCreateNew) {
            onSelectRef.current({ createNew: true, title: currentQuery.trim() });
          }
          return true;
        }
        return false;
      },
    }));

    // Loading state
    if (isLoading) {
      return (
        <div
          className="bg-popover border rounded-md shadow-md p-2 min-w-[200px]"
          data-testid="suggestion-popup"
        >
          <div className="text-sm text-muted-foreground px-2 py-1">Searching...</div>
        </div>
      );
    }

    return (
      <div
        className="bg-popover border rounded-md shadow-md min-w-[200px] max-w-[300px]"
        data-testid="suggestion-popup"
      >
        <ScrollArea className="max-h-[200px]">
          {items.length === 0 && !hasCreateNew && (
            <div className="text-sm text-muted-foreground px-3 py-2">No results</div>
          )}

          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-2 text-sm',
                'hover:bg-accent focus:bg-accent cursor-pointer',
                selectedIndex === index && 'bg-accent'
              )}
              onClick={() => onSelect(item)}
              data-testid={`suggestion-item-${item.id}`}
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">{item.typeKey}</span>
            </button>
          ))}

          {hasCreateNew && (
            <button
              type="button"
              className={cn(
                'w-full text-left px-3 py-2 flex items-center gap-2 text-sm',
                'hover:bg-accent focus:bg-accent cursor-pointer border-t',
                selectedIndex === items.length && 'bg-accent'
              )}
              onClick={() => onSelect({ createNew: true, title: query.trim() })}
              data-testid="suggestion-create-new"
            >
              <Plus className="h-4 w-4 shrink-0 text-primary" />
              <span>Create "{query.trim()}"</span>
            </button>
          )}
        </ScrollArea>
      </div>
    );
  }
);

SuggestionPopup.displayName = 'SuggestionPopup';
