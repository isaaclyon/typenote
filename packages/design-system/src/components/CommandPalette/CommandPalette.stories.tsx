import * as React from 'react';
import type { Story } from '@ladle/react';
import {
  CommandPalette,
  CommandPaletteInput,
  CommandPaletteList,
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteEmpty,
  CommandPaletteLoading,
  CommandPaletteSeparator,
  useCommandPaletteKeyboard,
} from './index.js';
import {
  FileText,
  Search,
  Settings,
  User,
  Calendar,
  Clock,
  Plus,
  CheckSquare,
  MapPin,
} from 'lucide-react';

// =============================================================================
// Sample Data
// =============================================================================

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
}

const recentItems: CommandItem[] = [
  { id: '1', label: 'Project Roadmap', icon: FileText, type: 'Page' },
  { id: '2', label: 'Meeting Notes', icon: FileText, type: 'Page' },
  { id: '3', label: 'Daily Standup', icon: Calendar, type: 'DailyNote' },
];

const searchResults: CommandItem[] = [
  { id: '4', label: 'Design System Docs', icon: FileText, type: 'Page' },
  { id: '5', label: 'API Reference', icon: FileText, type: 'Page' },
  { id: '6', label: 'Team Roster', icon: User, type: 'Person' },
];

const createCommands: CommandItem[] = [
  { id: 'c1', label: 'Create Page', icon: FileText, type: 'Page' },
  { id: 'c2', label: 'Create Task', icon: CheckSquare, type: 'Task' },
  { id: 'c3', label: 'Create Event', icon: Calendar, type: 'Event' },
  { id: 'c4', label: 'Create Place', icon: MapPin, type: 'Place' },
];

// =============================================================================
// Stories
// =============================================================================

/**
 * Default - Interactive command palette with keyboard navigation.
 * Press ⌘K to open, arrow keys to navigate, Enter to select, Escape to close.
 */
export const Default: Story = () => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  // All items flattened for keyboard navigation
  const allItems = React.useMemo(() => {
    if (query) {
      // Show search results + create commands when searching
      return [...searchResults, ...createCommands];
    }
    // Show recent items when no query
    return recentItems;
  }, [query]);

  const { selectedIndex } = useCommandPaletteKeyboard({
    itemCount: allItems.length,
    onSelect: (index) => {
      const item = allItems[index];
      if (item) {
        console.log('Selected:', item.label);
        setOpen(false);
        setQuery('');
      }
    },
    onEscape: () => {
      setOpen(false);
      setQuery('');
    },
    enabled: open,
  });

  // ⌘K to open
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track cumulative index for flat navigation
  let itemIndex = -1;

  return (
    <div className="p-8">
      <div className="text-sm text-gray-600 mb-4">
        Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">⌘K</kbd>{' '}
        to open the command palette
      </div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
      >
        Open Command Palette
      </button>

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search or create..."
        />
        <CommandPaletteList>
          {/* No query: show recent */}
          {!query && recentItems.length > 0 && (
            <CommandPaletteGroup heading="Recent">
              {recentItems.map((item) => {
                itemIndex++;
                return (
                  <CommandPaletteItem
                    key={item.id}
                    selected={selectedIndex === itemIndex}
                    onSelect={() => {
                      console.log('Selected:', item.label);
                      setOpen(false);
                    }}
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.type}</span>
                  </CommandPaletteItem>
                );
              })}
            </CommandPaletteGroup>
          )}

          {/* With query: show search results */}
          {query && searchResults.length > 0 && (
            <CommandPaletteGroup heading="Go to">
              {searchResults.map((item) => {
                itemIndex++;
                const Icon = item.icon;
                return (
                  <CommandPaletteItem
                    key={item.id}
                    selected={selectedIndex === itemIndex}
                    onSelect={() => {
                      console.log('Navigate to:', item.label);
                      setOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.type}</span>
                  </CommandPaletteItem>
                );
              })}
            </CommandPaletteGroup>
          )}

          {/* With query: show create commands */}
          {query && (
            <CommandPaletteGroup heading="Create new">
              {createCommands.map((item) => {
                itemIndex++;
                const Icon = item.icon;
                return (
                  <CommandPaletteItem
                    key={item.id}
                    selected={selectedIndex === itemIndex}
                    onSelect={() => {
                      console.log('Create:', item.type, 'with title:', query);
                      setOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 text-accent-500" />
                    <Icon className="h-4 w-4 text-gray-400" />
                    <span className="flex-1">
                      {item.type}: "{query}"
                    </span>
                  </CommandPaletteItem>
                );
              })}
            </CommandPaletteGroup>
          )}

          {/* Empty state */}
          {!query && recentItems.length === 0 && (
            <CommandPaletteEmpty>Type to search...</CommandPaletteEmpty>
          )}
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * With Groups - Shows multiple groups with different content.
 */
export const WithGroups: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('');

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search commands..."
        />
        <CommandPaletteList>
          <CommandPaletteGroup heading="Recent">
            {recentItems.map((item) => (
              <CommandPaletteItem
                key={item.id}
                onSelect={() => console.log('Selected:', item.label)}
              >
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-xs text-gray-400">{item.type}</span>
              </CommandPaletteItem>
            ))}
          </CommandPaletteGroup>

          <CommandPaletteSeparator />

          <CommandPaletteGroup heading="Actions">
            <CommandPaletteItem onSelect={() => console.log('Settings')}>
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="flex-1">Settings</span>
              <span className="text-xs text-gray-400 font-mono">⌘,</span>
            </CommandPaletteItem>
            <CommandPaletteItem onSelect={() => console.log('Search')}>
              <Search className="h-4 w-4 text-gray-400" />
              <span className="flex-1">Search</span>
              <span className="text-xs text-gray-400 font-mono">⌘F</span>
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * Loading State - Shows the loading indicator.
 */
export const LoadingState: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('searching...');

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput value={query} onValueChange={setQuery} placeholder="Search..." />
        <CommandPaletteList>
          <CommandPaletteLoading>Searching...</CommandPaletteLoading>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * Empty State - Shows the empty message when no results.
 */
export const EmptyState: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('xyz123');

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput value={query} onValueChange={setQuery} placeholder="Search..." />
        <CommandPaletteList>
          <CommandPaletteEmpty>No results found for "{query}"</CommandPaletteEmpty>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * Many Items - Tests scrolling with a large number of items.
 */
export const ManyItems: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('');

  const manyItems = Array.from({ length: 30 }, (_, i) => ({
    id: `item-${i}`,
    label: `Document ${i + 1}`,
    icon: FileText,
    type: i % 3 === 0 ? 'Page' : i % 3 === 1 ? 'Task' : 'Note',
  }));

  const { selectedIndex } = useCommandPaletteKeyboard({
    itemCount: manyItems.length,
    onSelect: (index) => {
      const item = manyItems[index];
      if (item) console.log('Selected:', item.label);
    },
    onEscape: () => setOpen(false),
    enabled: open,
  });

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}
      <p className="text-sm text-gray-600 mb-4">30 items. Use arrow keys to navigate.</p>

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput value={query} onValueChange={setQuery} placeholder="Search..." />
        <CommandPaletteList>
          <CommandPaletteGroup heading="All Documents">
            {manyItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <CommandPaletteItem
                  key={item.id}
                  selected={selectedIndex === i}
                  onSelect={() => console.log('Selected:', item.label)}
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.type}</span>
                </CommandPaletteItem>
              );
            })}
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * Disabled Items - Shows how disabled items look and behave.
 */
export const DisabledItems: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('');

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput value={query} onValueChange={setQuery} placeholder="Search..." />
        <CommandPaletteList>
          <CommandPaletteGroup heading="Actions">
            <CommandPaletteItem onSelect={() => console.log('Edit')}>
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="flex-1">Edit Document</span>
            </CommandPaletteItem>
            <CommandPaletteItem onSelect={() => {}} disabled>
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="flex-1">Delete Document</span>
              <span className="text-xs text-gray-400">(No permission)</span>
            </CommandPaletteItem>
            <CommandPaletteItem onSelect={() => console.log('Share')}>
              <User className="h-4 w-4 text-gray-400" />
              <span className="flex-1">Share Document</span>
            </CommandPaletteItem>
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};

/**
 * Selected State - Shows how selection highlighting looks.
 */
export const SelectedState: Story = () => {
  const [open, setOpen] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [selectedIdx, setSelectedIdx] = React.useState(1);

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen
        </button>
      )}
      <p className="text-sm text-gray-600 mb-4">Second item is selected.</p>

      <CommandPalette open={open} onOpenChange={setOpen}>
        <CommandPaletteInput value={query} onValueChange={setQuery} placeholder="Search..." />
        <CommandPaletteList>
          <CommandPaletteGroup heading="Documents">
            {recentItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <CommandPaletteItem
                  key={item.id}
                  selected={selectedIdx === i}
                  onSelect={() => setSelectedIdx(i)}
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                  <span className="flex-1 truncate">{item.label}</span>
                  <span className="text-xs text-gray-400">{item.type}</span>
                </CommandPaletteItem>
              );
            })}
          </CommandPaletteGroup>
        </CommandPaletteList>
      </CommandPalette>
    </div>
  );
};
