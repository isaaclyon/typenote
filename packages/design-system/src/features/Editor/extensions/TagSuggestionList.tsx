/**
 * TagSuggestionList Component
 *
 * Dropdown UI for the tag suggestion popup.
 * Renders a list of matching tags with keyboard navigation.
 */

import * as React from 'react';

import { cn } from '../../../lib/utils.js';

/**
 * A suggestion item representing a tag.
 */
export interface TagSuggestionItem {
  tagId: string;
  name: string;
  color?: string | null;
}

export interface TagSuggestionListProps {
  items: TagSuggestionItem[];
  query: string;
  selectedIndex: number;
  onSelect: (item: TagSuggestionItem) => void;
  onCreate: ((name: string) => void) | undefined;
}

export const TagSuggestionList = React.forwardRef<HTMLDivElement, TagSuggestionListProps>(
  ({ items, query, selectedIndex, onSelect, onCreate }, ref) => {
    const showCreate = onCreate && query.trim().length > 0;
    const totalItems = items.length + (showCreate ? 1 : 0);

    if (totalItems === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            'min-w-[180px] max-w-[240px]'
          )}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No tags found</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
          'min-w-[180px] max-w-[240px]',
          'max-h-[300px] overflow-y-auto'
        )}
      >
        {items.map((item, index) => {
          const color = item.color ?? '#71717A';
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.tagId}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                'outline-none transition-colors',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              {/* Color indicator dot */}
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {/* Tag name with # prefix */}
              <span className="truncate">#{item.name}</span>
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
              <span className="font-medium">#{query.trim()}</span>
            </button>
          </>
        )}
      </div>
    );
  }
);

TagSuggestionList.displayName = 'TagSuggestionList';
