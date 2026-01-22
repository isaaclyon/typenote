import * as React from 'react';
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { cn } from '../../lib/utils.js';
import { Dialog, DialogOverlay, DialogPortal } from '../../primitives/Dialog/Dialog.js';
import { SearchInput } from '../../patterns/SearchInput/SearchInput.js';
import { CommandPaletteItem } from '../../patterns/CommandPaletteItem/CommandPaletteItem.js';
import { CommandPaletteSection } from '../../patterns/CommandPaletteSection/CommandPaletteSection.js';
import { CommandPaletteList } from '../../patterns/CommandPaletteList/CommandPaletteList.js';
import { useKeyboardListNavigation } from './useKeyboardListNavigation.js';
import type {
  CommandPaletteItemData,
  CommandPaletteObjectItem,
  CommandPaletteActionItem,
} from './types.js';

export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;

  /** Recently accessed objects (shown when not searching) */
  recentItems: CommandPaletteObjectItem[];
  /** Quick actions like "New Page", "Settings" */
  actions: CommandPaletteActionItem[];
  /** Search results (shown when user has typed a query) */
  searchResults?: CommandPaletteObjectItem[];

  /** Current search query (controlled) */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (query: string) => void;
  /** Callback when an item is selected */
  onSelect: (item: CommandPaletteItemData) => void;

  /** Placeholder text for search input */
  searchPlaceholder?: string;
  /** Message shown when search has no results */
  emptySearchMessage?: string;
}

const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  (
    {
      open,
      onOpenChange,
      recentItems,
      actions,
      searchResults,
      searchQuery,
      onSearchChange,
      onSelect,
      searchPlaceholder = 'Search or jump to...',
      emptySearchMessage = 'No results found',
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const isSearching = searchQuery.length > 0;

    // Flatten all visible items for keyboard navigation
    const flatItems = useMemo<CommandPaletteItemData[]>(() => {
      if (isSearching && searchResults) {
        return searchResults;
      }
      return [...recentItems, ...actions];
    }, [isSearching, searchResults, recentItems, actions]);

    const handleClose = useCallback(() => {
      onOpenChange(false);
    }, [onOpenChange]);

    const { selectedIndex, setSelectedIndex, handleKeyDown } = useKeyboardListNavigation({
      items: flatItems,
      onSelect,
      onClose: handleClose,
    });

    // Focus input when dialog opens
    useEffect(() => {
      if (open) {
        // Small delay to ensure dialog is mounted
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return () => clearTimeout(timer);
      }
    }, [open]);

    // Clear search when closing
    useEffect(() => {
      if (!open && searchQuery) {
        onSearchChange('');
      }
    }, [open, searchQuery, onSearchChange]);

    const handleClear = useCallback(() => {
      onSearchChange('');
      inputRef.current?.focus();
    }, [onSearchChange]);

    // Calculate selected index within each section for proper highlighting
    const getItemIndex = (sectionStartIndex: number, itemIndex: number): number => {
      return sectionStartIndex + itemIndex;
    };

    const renderItem = (item: CommandPaletteItemData, globalIndex: number): React.ReactNode => {
      const isSelected = selectedIndex === globalIndex;

      if (item.type === 'object') {
        return (
          <CommandPaletteItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            badge={item.objectType}
            selected={isSelected}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setSelectedIndex(globalIndex)}
          />
        );
      }

      return (
        <CommandPaletteItem
          key={item.id}
          icon={item.icon}
          title={item.title}
          shortcut={item.shortcut}
          selected={isSelected}
          onClick={() => onSelect(item)}
          onMouseEnter={() => setSelectedIndex(globalIndex)}
        />
      );
    };

    const isEmpty = isSearching && searchResults && searchResults.length === 0;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className={cn(
              'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]',
              'rounded-lg border border-border bg-background shadow-lg',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
            )}
            data-state={open ? 'open' : 'closed'}
            onKeyDown={handleKeyDown}
          >
            {/* Search Input */}
            <div className="border-b border-border p-3">
              <SearchInput
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClear={handleClear}
                placeholder={searchPlaceholder}
                size="md"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {/* Results List */}
            <CommandPaletteList
              isEmpty={isEmpty}
              emptyState={
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <MagnifyingGlass className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{emptySearchMessage}</p>
                  <p className="text-xs text-muted-foreground/70">Try a different search term</p>
                </div>
              }
            >
              {isSearching && searchResults ? (
                // Search results mode
                <CommandPaletteSection label="Search Results">
                  {searchResults.map((item, index) => renderItem(item, index))}
                </CommandPaletteSection>
              ) : (
                // Default mode: Recent + Actions
                <>
                  {recentItems.length > 0 ? (
                    <CommandPaletteSection label="Recent">
                      {recentItems.map((item, index) => renderItem(item, getItemIndex(0, index)))}
                    </CommandPaletteSection>
                  ) : null}
                  {actions.length > 0 ? (
                    <CommandPaletteSection label="Quick Actions">
                      {actions.map((item, index) =>
                        renderItem(item, getItemIndex(recentItems.length, index))
                      )}
                    </CommandPaletteSection>
                  ) : null}
                </>
              )}
            </CommandPaletteList>
          </div>
        </DialogPortal>
      </Dialog>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };
