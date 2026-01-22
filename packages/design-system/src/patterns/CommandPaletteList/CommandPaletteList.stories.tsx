import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

import { CommandPaletteList } from './CommandPaletteList.js';
import { CommandPaletteSection } from '../CommandPaletteSection/CommandPaletteSection.js';
import { CommandPaletteItem } from '../CommandPaletteItem/CommandPaletteItem.js';

export default {
  title: 'Patterns/CommandPaletteList',
};

export const Default: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteList>
      <CommandPaletteSection label="Recent">
        <CommandPaletteItem icon={File} title="Meeting Notes" badge="Page" selected />
        <CommandPaletteItem icon={CalendarBlank} title="2026-01-21" badge="Daily Note" />
        <CommandPaletteItem icon={User} title="John Smith" badge="Person" />
      </CommandPaletteSection>
    </CommandPaletteList>
  </div>
);

export const ManyItems: Story = () => {
  const items = Array.from({ length: 20 }, (_, i) => ({
    title: `Document ${i + 1}`,
    badge: i % 3 === 0 ? 'Page' : i % 3 === 1 ? 'Daily Note' : 'Person',
  }));

  return (
    <div className="w-[480px] rounded-lg border border-border bg-background">
      <CommandPaletteList>
        <CommandPaletteSection label="Search Results">
          {items.map((item, index) => (
            <CommandPaletteItem
              key={item.title}
              icon={File}
              title={item.title}
              badge={item.badge}
              selected={index === 0}
            />
          ))}
        </CommandPaletteSection>
      </CommandPaletteList>
    </div>
  );
};

export const EmptyState: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteList
      isEmpty
      emptyState={
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <MagnifyingGlass className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No results for &quot;xyz&quot;</p>
          <p className="text-xs text-muted-foreground/70">Try a different search term</p>
        </div>
      }
    />
  </div>
);

export const ShortList: Story = () => (
  <div className="w-[480px] rounded-lg border border-border bg-background">
    <CommandPaletteList>
      <CommandPaletteSection label="Recent">
        <CommandPaletteItem icon={File} title="Only One Item" badge="Page" selected />
      </CommandPaletteSection>
    </CommandPaletteList>
  </div>
);
