import * as React from 'react';
import { useState } from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { Clock } from '@phosphor-icons/react/dist/ssr/Clock';

import { CommandPalette } from './CommandPalette.js';
import { Button } from '../../primitives/Button/Button.js';
import type { CommandPaletteObjectItem, CommandPaletteActionItem } from './types.js';

export default {
  title: 'Features/CommandPalette',
};

const sampleRecentItems: CommandPaletteObjectItem[] = [
  { type: 'object', id: '1', icon: File, title: 'Meeting Notes', objectType: 'Page' },
  { type: 'object', id: '2', icon: CalendarBlank, title: '2026-01-21', objectType: 'Daily Note' },
  { type: 'object', id: '3', icon: User, title: 'John Smith', objectType: 'Person' },
  { type: 'object', id: '4', icon: File, title: 'Project Roadmap', objectType: 'Page' },
];

const sampleActions: CommandPaletteActionItem[] = [
  { type: 'action', id: 'new-page', icon: Plus, title: 'New Page', shortcut: '⌘N' },
  { type: 'action', id: 'new-daily', icon: CalendarBlank, title: 'New Daily Note', shortcut: '⌘D' },
  { type: 'action', id: 'settings', icon: Gear, title: 'Settings', shortcut: '⌘,' },
];

export const Default: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-[400px]">
      <Button onClick={() => setOpen(true)}>Open Command Palette (⌘K)</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={sampleRecentItems}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const WithSearchResults: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('meeting');

  const searchResults: CommandPaletteObjectItem[] = [
    { type: 'object', id: '1', icon: File, title: 'Meeting Notes', objectType: 'Page' },
    { type: 'object', id: '5', icon: File, title: 'Team Meeting Recap', objectType: 'Page' },
    { type: 'object', id: '6', icon: File, title: 'Meeting Agenda Template', objectType: 'Page' },
  ];

  return (
    <div className="min-h-[400px]">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={sampleRecentItems}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const EmptySearch: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('xyz');

  return (
    <div className="min-h-[400px]">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={sampleRecentItems}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={[]}
        emptySearchMessage="No results for 'xyz'"
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const ManyItems: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const manyRecentItems: CommandPaletteObjectItem[] = Array.from({ length: 15 }, (_, i) => ({
    type: 'object' as const,
    id: `item-${i}`,
    icon: i % 3 === 0 ? File : i % 3 === 1 ? CalendarBlank : User,
    title: `Document ${i + 1}`,
    objectType: i % 3 === 0 ? 'Page' : i % 3 === 1 ? 'Daily Note' : 'Person',
  }));

  return (
    <div className="min-h-[400px]">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={manyRecentItems}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const ActionsOnly: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-[400px]">
      <p className="mb-4 text-sm text-muted-foreground">No recent items - only actions are shown</p>
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={[]}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const KeyboardNavigation: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSelected, setLastSelected] = useState<string | null>(null);

  return (
    <div className="min-h-[400px]">
      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium">Keyboard shortcuts:</p>
        <ul className="text-sm text-muted-foreground">
          <li>↑/↓ - Navigate items</li>
          <li>Enter - Select item</li>
          <li>Escape - Close palette</li>
        </ul>
        {lastSelected ? (
          <p className="text-sm text-accent-600">Last selected: {lastSelected}</p>
        ) : null}
      </div>
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={sampleRecentItems}
        actions={sampleActions}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(item) => {
          setLastSelected(item.title);
          setOpen(false);
        }}
      />
    </div>
  );
};

export const WithShortcuts: Story = () => {
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const actionsWithShortcuts: CommandPaletteActionItem[] = [
    { type: 'action', id: 'new-page', icon: Plus, title: 'New Page', shortcut: '⌘N' },
    {
      type: 'action',
      id: 'new-daily',
      icon: CalendarBlank,
      title: 'New Daily Note',
      shortcut: '⌘D',
    },
    { type: 'action', id: 'quick-open', icon: Clock, title: 'Quick Open', shortcut: '⌘O' },
    { type: 'action', id: 'settings', icon: Gear, title: 'Settings', shortcut: '⌘,' },
  ];

  return (
    <div className="min-h-[400px]">
      <Button onClick={() => setOpen(true)}>Open Command Palette</Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        recentItems={sampleRecentItems.slice(0, 2)}
        actions={actionsWithShortcuts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelect={(item) => {
          console.log('Selected:', item);
          setOpen(false);
        }}
      />
    </div>
  );
};
