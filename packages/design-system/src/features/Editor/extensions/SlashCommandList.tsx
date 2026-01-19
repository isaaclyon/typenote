/**
 * SlashCommandList Component
 *
 * Dropdown UI for the slash command menu.
 * Renders a list of block types with keyboard navigation.
 */

import * as React from 'react';
import { cn } from '../../../lib/utils.js';
import type { SlashCommandItem } from './SlashCommand.js';

export interface SlashCommandListProps {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
}

export const SlashCommandList = React.forwardRef<HTMLDivElement, SlashCommandListProps>(
  ({ items, selectedIndex, onSelect }, ref) => {
    // Scroll selected item into view
    const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    React.useEffect(() => {
      const selectedItem = itemRefs.current[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' });
      }
    }, [selectedIndex]);

    if (items.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            'min-w-[200px] max-w-[300px]'
          )}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching commands</div>
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
          const Icon = item.icon;
          const isSelected = index === selectedIndex;

          return (
            <button
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                'outline-none transition-colors',
                isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" weight="regular" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

SlashCommandList.displayName = 'SlashCommandList';
