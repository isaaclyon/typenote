import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';

import { CommandPaletteItem } from './CommandPaletteItem.js';

export default {
  title: 'Patterns/CommandPaletteItem',
};

export const Default: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem icon={File} title="Meeting Notes" badge="Page" />
    <CommandPaletteItem icon={CalendarBlank} title="2026-01-21" badge="Daily Note" />
    <CommandPaletteItem icon={User} title="John Smith" badge="Person" />
  </div>
);

export const Selected: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem icon={File} title="Meeting Notes" badge="Page" />
    <CommandPaletteItem icon={CalendarBlank} title="2026-01-21" badge="Daily Note" selected />
    <CommandPaletteItem icon={User} title="John Smith" badge="Person" />
  </div>
);

export const WithShortcuts: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem icon={Plus} title="New Page" shortcut="⌘N" />
    <CommandPaletteItem icon={CalendarBlank} title="New Daily Note" shortcut="⌘D" />
    <CommandPaletteItem icon={Gear} title="Settings" shortcut="⌘," />
  </div>
);

export const Actions: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem icon={Plus} title="New Page" />
    <CommandPaletteItem icon={CalendarBlank} title="New Daily Note" />
    <CommandPaletteItem icon={Gear} title="Settings" />
  </div>
);

export const Disabled: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem icon={File} title="Available" badge="Page" />
    <CommandPaletteItem icon={File} title="Disabled Item" badge="Page" disabled />
    <CommandPaletteItem icon={File} title="Also Available" badge="Page" />
  </div>
);

export const LongTitle: Story = () => (
  <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
    <CommandPaletteItem
      icon={File}
      title="This is a very long title that should be truncated when it exceeds the available width"
      badge="Page"
    />
    <CommandPaletteItem icon={File} title="Short title" badge="Page" />
  </div>
);

export const Interactive: Story = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const items = [
    { icon: File, title: 'Meeting Notes', badge: 'Page' },
    { icon: CalendarBlank, title: '2026-01-21', badge: 'Daily Note' },
    { icon: User, title: 'John Smith', badge: 'Person' },
  ];

  return (
    <div className="w-[480px] space-y-1 rounded-lg border border-border bg-background p-2">
      {items.map((item, index) => (
        <CommandPaletteItem
          key={item.title}
          icon={item.icon}
          title={item.title}
          badge={item.badge}
          selected={selectedIndex === index}
          onClick={() => setSelectedIndex(index)}
        />
      ))}
      <p className="mt-4 text-xs text-muted-foreground">Click items to select</p>
    </div>
  );
};
