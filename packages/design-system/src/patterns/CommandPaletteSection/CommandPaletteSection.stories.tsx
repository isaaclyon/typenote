import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';

import { CommandPaletteSection } from './CommandPaletteSection.js';
import { CommandPaletteItem } from '../CommandPaletteItem/CommandPaletteItem.js';

export default {
  title: 'Patterns/CommandPaletteSection',
};

export const RecentObjects: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteSection label="Recent">
      <CommandPaletteItem icon={File} title="Meeting Notes" badge="Page" />
      <CommandPaletteItem icon={CalendarBlank} title="2026-01-21" badge="Daily Note" />
      <CommandPaletteItem icon={User} title="John Smith" badge="Person" />
    </CommandPaletteSection>
  </div>
);

export const QuickActions: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteSection label="Quick Actions">
      <CommandPaletteItem icon={Plus} title="New Page" shortcut="⌘N" />
      <CommandPaletteItem icon={CalendarBlank} title="New Daily Note" shortcut="⌘D" />
      <CommandPaletteItem icon={Gear} title="Settings" shortcut="⌘," />
    </CommandPaletteSection>
  </div>
);

export const SearchResults: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteSection label="Search Results">
      <CommandPaletteItem icon={File} title="Project Meeting Notes" badge="Page" />
      <CommandPaletteItem icon={File} title="Team Meeting Recap" badge="Page" />
      <CommandPaletteItem icon={File} title="Meeting Agenda Template" badge="Page" />
    </CommandPaletteSection>
  </div>
);

export const MultipleSections: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteSection label="Recent">
      <CommandPaletteItem icon={File} title="Meeting Notes" badge="Page" selected />
      <CommandPaletteItem icon={CalendarBlank} title="2026-01-21" badge="Daily Note" />
    </CommandPaletteSection>
    <CommandPaletteSection label="Quick Actions">
      <CommandPaletteItem icon={Plus} title="New Page" shortcut="⌘N" />
      <CommandPaletteItem icon={Gear} title="Settings" shortcut="⌘," />
    </CommandPaletteSection>
  </div>
);

export const EmptySection: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteSection label="Recent">
      <div className="px-3 py-4 text-center text-sm text-muted-foreground">No recent items</div>
    </CommandPaletteSection>
  </div>
);
