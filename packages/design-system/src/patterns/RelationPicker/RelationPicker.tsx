import * as React from 'react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { File } from '@phosphor-icons/react/dist/ssr/File';

import { cn } from '../../lib/utils.js';
import { Popover, PopoverTrigger, PopoverContent } from '../../primitives/Popover/Popover.js';
import { SearchInput } from '../SearchInput/SearchInput.js';
import { CommandPaletteItem } from '../CommandPaletteItem/CommandPaletteItem.js';
import { CommandPaletteList } from '../CommandPaletteList/CommandPaletteList.js';
import { Spinner } from '../../primitives/Spinner/Spinner.js';

export interface RelationOption {
  id: string;
  title: string;
  typeKey: string;
  typeName: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface RelationPickerProps {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  options: RelationOption[];
  loading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreate?: (title: string) => void;
  placeholder?: string;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const RelationPicker = React.forwardRef<HTMLDivElement, RelationPickerProps>(
  (
    {
      value,
      onChange = () => {},
      multiple = false,
      options,
      loading = false,
      searchQuery = '',
      onSearchChange = () => {},
      onCreate,
      placeholder = 'Search...',
      disabled = false,
      open = false,
      onOpenChange = () => {},
      children,
      className,
    },
    ref
  ) => {
    const [highlightedIndex, setHighlightedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const selectedIds = React.useMemo(() => {
      if (!value) return new Set<string>();
      return new Set(Array.isArray(value) ? value : [value]);
    }, [value]);

    const showCreateOption = onCreate && searchQuery.trim().length > 0;
    const totalItems = options.length + (showCreateOption ? 1 : 0);

    // Reset highlight when options change
    React.useEffect(() => {
      setHighlightedIndex(0);
    }, [options.length, searchQuery]);

    // Focus input when popover opens
    React.useEffect(() => {
      if (open) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }, [open]);

    const handleSelect = (option: RelationOption) => {
      if (multiple) {
        const newSet = new Set(selectedIds);
        if (newSet.has(option.id)) {
          newSet.delete(option.id);
        } else {
          newSet.add(option.id);
        }
        onChange(Array.from(newSet));
      } else {
        onChange(option.id);
        onOpenChange(false);
      }
    };

    const handleCreate = () => {
      onCreate?.(searchQuery.trim());
      onSearchChange('');
      if (!multiple) {
        onOpenChange(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex < options.length) {
            const option = options[highlightedIndex];
            if (option) handleSelect(option);
          } else if (showCreateOption) {
            handleCreate();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    };

    // Default icon for items without one
    const DefaultIcon = File;

    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          {children}
        </PopoverTrigger>
        <PopoverContent
          ref={ref}
          className={cn('w-72 p-0', className)}
          align="start"
          onKeyDown={handleKeyDown}
        >
          <div className="p-2">
            <SearchInput
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onClear={() => onSearchChange('')}
              placeholder={placeholder}
              size="sm"
            />
          </div>
          <CommandPaletteList
            className="max-h-60"
            isEmpty={!loading && options.length === 0 && !showCreateOption}
            emptyState={
              <div className="py-6 text-center text-sm text-muted-foreground">No results found</div>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : (
              <>
                {options.map((option, index) => (
                  <CommandPaletteItem
                    key={option.id}
                    icon={option.icon ?? DefaultIcon}
                    title={option.title}
                    badge={option.typeName}
                    selected={highlightedIndex === index || selectedIds.has(option.id)}
                    onClick={() => handleSelect(option)}
                  />
                ))}
                {showCreateOption && (
                  <CommandPaletteItem
                    icon={Plus}
                    title={`Create "${searchQuery.trim()}"`}
                    selected={highlightedIndex === options.length}
                    onClick={handleCreate}
                  />
                )}
              </>
            )}
          </CommandPaletteList>
        </PopoverContent>
      </Popover>
    );
  }
);

RelationPicker.displayName = 'RelationPicker';

export { RelationPicker };
