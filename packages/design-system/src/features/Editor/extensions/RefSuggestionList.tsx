/**
 * RefSuggestionList Component
 *
 * Dropdown UI for the reference suggestion popup.
 * Renders a list of matching objects with keyboard navigation.
 */

import * as React from 'react';
import { cn } from '../../../lib/utils.js';
import type { RefSuggestionItem } from './RefSuggestion.js';

// Default colors for built-in types
const TYPE_COLORS: Record<string, string> = {
  Page: '#6366F1',
  DailyNote: '#F59E0B',
  Person: '#EC4899',
  Event: '#8B5CF6',
  Place: '#10B981',
  Task: '#EF4444',
};

export interface RefSuggestionListProps {
  items: RefSuggestionItem[];
  query: string;
  selectedIndex: number;
  onSelect: (item: RefSuggestionItem) => void;
  onCreate: ((title: string) => void) | undefined;
}

export const RefSuggestionList = React.forwardRef<HTMLDivElement, RefSuggestionListProps>(
  ({ items, query, selectedIndex, onSelect, onCreate }, ref) => {
    const showCreate = onCreate && query.trim().length > 0;
    const totalItems = items.length + (showCreate ? 1 : 0);

    if (totalItems === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            'min-w-[200px] max-w-[300px]'
          )}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No results found</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
          'min-w-[200px] max-w-[300px]',
          'max-h-[300px] overflow-y-auto'
        )}
      >
        {items.map((item, index) => {
          const color = item.color ?? TYPE_COLORS[item.objectType] ?? '#71717A';
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.objectId}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                'outline-none transition-colors',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              {/* Color dot indicator */}
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {/* Title */}
              <span className="truncate">{item.title || 'Untitled'}</span>
              {/* Type label */}
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {item.objectType}
              </span>
            </button>
          );
        })}

        {/* Create new option */}
        {showCreate && (
          <>
            {items.length > 0 && <div className="my-1 h-px bg-border" />}
            <button
              type="button"
              onClick={() => onCreate(query.trim())}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                'outline-none transition-colors',
                selectedIndex === items.length
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <span className="text-muted-foreground">Create</span>
              <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>
            </button>
          </>
        )}
      </div>
    );
  }
);

RefSuggestionList.displayName = 'RefSuggestionList';
