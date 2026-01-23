import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';

import { HeaderBar } from './HeaderBar.js';

export default {
  title: 'Features / HeaderBar',
};

// ============================================================================
// Sample data
// ============================================================================

const pageBreadcrumbs = [
  { label: 'Pages', icon: File, iconColor: '#78716c', onClick: () => console.log('Pages') },
  {
    label: 'Project Notes',
    icon: File,
    iconColor: '#78716c',
    onClick: () => console.log('Project Notes'),
  },
  { label: 'My Note', icon: File, iconColor: '#78716c' },
];

const dailyNoteBreadcrumbs = [
  {
    label: 'Daily Notes',
    icon: CalendarBlank,
    iconColor: '#6495ED',
    onClick: () => console.log('Daily Notes'),
  },
  { label: 'January 19, 2026', icon: CalendarBlank, iconColor: '#6495ED' },
];

const personBreadcrumbs = [
  { label: 'People', icon: User, iconColor: '#ffb74d', onClick: () => console.log('People') },
  { label: 'John Doe', icon: User, iconColor: '#ffb74d' },
];

// ============================================================================
// Stories
// ============================================================================

/**
 * Default HeaderBar with breadcrumbs centered.
 * Controls (search, theme, settings) live in the sidebar.
 */
export const Default: Story = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-md border border-border overflow-hidden">
      <HeaderBar breadcrumbs={pageBreadcrumbs} />
    </div>
    <p className="text-xs text-muted-foreground">
      Simplified HeaderBar: only breadcrumbs (centered). Controls moved to the sidebar.
    </p>
  </div>
);

export const DailyNote: Story = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-md border border-border overflow-hidden">
      <HeaderBar breadcrumbs={dailyNoteBreadcrumbs} />
    </div>
    <p className="text-xs text-muted-foreground">
      HeaderBar showing a Daily Note with blue calendar icons.
    </p>
  </div>
);

export const PersonObject: Story = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-md border border-border overflow-hidden">
      <HeaderBar breadcrumbs={personBreadcrumbs} />
    </div>
    <p className="text-xs text-muted-foreground">
      HeaderBar showing a Person object with orange user icons.
    </p>
  </div>
);

export const NoBreadcrumbs: Story = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-md border border-border overflow-hidden">
      <HeaderBar />
    </div>
    <p className="text-xs text-muted-foreground">
      HeaderBar without breadcrumbs — empty bar (40px height preserved).
    </p>
  </div>
);

export const InAppContext: Story = () => (
  <div className="p-6">
    <div className="flex h-[400px] rounded-md border border-border overflow-hidden">
      {/* Simulated Sidebar */}
      <div className="w-[240px] shrink-0 border-r border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">Sidebar</p>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <HeaderBar breadcrumbs={pageBreadcrumbs} />
        <div className="flex-1 bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">Content area</p>
        </div>
      </div>
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      HeaderBar in context: spans content area only, not the sidebar.
    </p>
  </div>
);

export const FullAppLayout: Story = () => (
  <div className="p-6">
    <div className="flex h-[500px] flex-col rounded-md border border-border overflow-hidden">
      {/* TitleBar simulation */}
      <div className="h-7 w-full shrink-0 bg-background border-b border-border flex items-center px-4">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Below TitleBar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Sidebar</p>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <HeaderBar breadcrumbs={pageBreadcrumbs} />
          <div className="flex-1 bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              New layout: Controls in the sidebar, breadcrumbs in HeaderBar (here).
            </p>
          </div>
        </div>
      </div>
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Complete layout: TitleBar (top) + Sidebar (left) + HeaderBar with breadcrumbs
    </p>
  </div>
);
