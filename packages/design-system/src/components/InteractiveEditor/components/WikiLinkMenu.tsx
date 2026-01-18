import * as React from 'react';
import { FileText, Calendar, CheckSquare, User, CalendarDays, MapPin, Plus } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '../../ui/command.js';
import type { WikiLinkItem, ObjectType } from '../types.js';

export interface WikiLinkMenuProps {
  /** Items to display */
  items: WikiLinkItem[];
  /** Search query */
  query: string;
  /** Called when search query changes */
  onQueryChange?: (query: string) => void;
  /** Called when item is selected */
  onSelect: (item: WikiLinkItem) => void;
  /** Called to create new item - async for IPC */
  onCreate?: (title: string) => Promise<void>;
  /** Selected index for keyboard navigation */
  selectedIndex?: number;
  /** Whether to show create option */
  showCreate?: boolean;
}

/**
 * Get icon component for object type
 */
function getTypeIcon(type: ObjectType) {
  switch (type) {
    case 'Page':
      return FileText;
    case 'DailyNote':
      return Calendar;
    case 'Task':
      return CheckSquare;
    case 'Person':
      return User;
    case 'Event':
      return CalendarDays;
    case 'Place':
      return MapPin;
    default:
      return FileText;
  }
}

/**
 * WikiLinkMenu - Command-based menu for selecting wiki-links.
 *
 * Uses shadcn's Command component for filtering and keyboard navigation.
 * Supports both existing items and creating new ones.
 *
 * @example
 * ```tsx
 * <WikiLinkMenu
 *   items={filteredNotes}
 *   query={searchQuery}
 *   onSelect={handleSelect}
 *   onCreate={handleCreate}
 * />
 * ```
 */
export const WikiLinkMenu = React.forwardRef<HTMLDivElement, WikiLinkMenuProps>(
  ({ items, query, onQueryChange, onSelect, onCreate, showCreate = true }, ref) => {
    const showCreateOption = showCreate && onCreate && query.trim().length > 0;

    return (
      <Command ref={ref} className="w-64" shouldFilter={false}>
        {onQueryChange && (
          <CommandInput placeholder="Search notes..." value={query} onValueChange={onQueryChange} />
        )}
        <CommandList>
          <CommandEmpty>{showCreateOption ? null : 'No notes found'}</CommandEmpty>

          {items.length > 0 && (
            <CommandGroup heading="Notes">
              {items.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <CommandItem key={item.id} value={item.id} onSelect={() => onSelect(item)}>
                    <Icon className="mr-2 h-4 w-4 opacity-70" />
                    <span className="truncate">{item.title}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}

          {showCreateOption && (
            <CommandGroup heading="Create">
              <CommandItem value={`create-${query}`} onSelect={() => onCreate(query.trim())}>
                <Plus className="mr-2 h-4 w-4 opacity-70" />
                <span>Create &quot;{query.trim()}&quot;</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    );
  }
);

WikiLinkMenu.displayName = 'WikiLinkMenu';
