import * as React from 'react';
import type { Story } from '@ladle/react';
import { CommandPalette } from './CommandPalette.js';
import type { CommandItem } from './types.js';
import { FileText, Search, Settings, User, Calendar, Tag, Trash } from 'lucide-react';

const sampleCommands: CommandItem[] = [
  {
    id: '1',
    label: 'New Note',
    icon: FileText,
    shortcut: '⌘N',
    category: 'Create',
    onSelect: () => console.log('New Note'),
  },
  {
    id: '2',
    label: 'Search Notes',
    icon: Search,
    shortcut: '⌘F',
    category: 'Navigate',
    onSelect: () => console.log('Search Notes'),
  },
  {
    id: '3',
    label: 'Settings',
    icon: Settings,
    shortcut: '⌘,',
    category: 'Navigate',
    onSelect: () => console.log('Settings'),
  },
  {
    id: '4',
    label: 'Profile',
    icon: User,
    category: 'Navigate',
    onSelect: () => console.log('Profile'),
  },
  {
    id: '5',
    label: 'Jump to Today',
    icon: Calendar,
    shortcut: 'T',
    category: 'Navigate',
    onSelect: () => console.log('Jump to Today'),
  },
  {
    id: '6',
    label: 'Manage Tags',
    icon: Tag,
    category: 'Organize',
    onSelect: () => console.log('Manage Tags'),
  },
  {
    id: '7',
    label: 'Delete Note',
    icon: Trash,
    shortcut: '⌘⌫',
    category: 'Actions',
    onSelect: () => console.log('Delete Note'),
  },
];

export const Default: Story = () => {
  const [open, setOpen] = React.useState(false);

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

  return (
    <div className="p-8">
      <div className="text-sm text-gray-600 mb-4">
        Press <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">⌘K</kbd> to open
        the command palette
      </div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
      >
        Open Command Palette
      </button>

      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={sampleCommands}
        placeholder="Search commands..."
      />
    </div>
  );
};

export const Preview_AlwaysOpen: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen Command Palette
        </button>
      )}
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={sampleCommands}
        placeholder="Search commands..."
      />
    </div>
  );
};

export const Preview_WithSearch: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium mb-4"
        >
          Reopen Command Palette
        </button>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Try typing "note" or "settings" to filter commands. Use arrow keys to navigate and Enter to
        select.
      </p>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={sampleCommands}
        placeholder="Type to search..."
      />
    </div>
  );
};

export const Preview_EmptyState: Story = () => {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium"
        >
          Reopen Command Palette
        </button>
      )}
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={[]}
        placeholder="No commands available..."
      />
    </div>
  );
};

export const Preview_ManyCommands: Story = () => {
  const [open, setOpen] = React.useState(true);

  const manyCommands: CommandItem[] = Array.from({ length: 25 }, (_, i) => ({
    id: `cmd-${i}`,
    label: `Command ${i + 1}`,
    icon: i % 2 === 0 ? FileText : Search,
    shortcut: i < 10 ? `⌘${i}` : undefined,
    category: i % 3 === 0 ? 'Create' : i % 3 === 1 ? 'Navigate' : 'Actions',
    onSelect: () => console.log(`Command ${i + 1}`),
  }));

  return (
    <div className="p-8">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 text-sm font-medium mb-4"
        >
          Reopen Command Palette
        </button>
      )}
      <p className="text-sm text-gray-600 mb-4">
        Scrollable list with many commands. Try searching to filter.
      </p>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={manyCommands}
        placeholder="Search 25 commands..."
      />
    </div>
  );
};
