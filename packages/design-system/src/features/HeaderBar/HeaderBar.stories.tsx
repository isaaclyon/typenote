import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';

import { HeaderBar } from './HeaderBar.js';
import type { Theme } from '../../patterns/ThemeToggle/ThemeToggle.js';

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

export const Default: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-border overflow-hidden">
        <HeaderBar
          onSearchClick={() => console.log('Search clicked')}
          breadcrumbs={pageBreadcrumbs}
          onSettingsClick={() => console.log('Settings clicked')}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Full HeaderBar: breadcrumbs (left), search + theme toggle + settings (right).
      </p>
    </div>
  );
};

export const DailyNote: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-border overflow-hidden">
        <HeaderBar
          onSearchClick={() => console.log('Search clicked')}
          breadcrumbs={dailyNoteBreadcrumbs}
          onSettingsClick={() => console.log('Settings clicked')}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        HeaderBar showing a Daily Note with blue calendar icons.
      </p>
    </div>
  );
};

export const PersonObject: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-border overflow-hidden">
        <HeaderBar
          onSearchClick={() => console.log('Search clicked')}
          breadcrumbs={personBreadcrumbs}
          onSettingsClick={() => console.log('Settings clicked')}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        HeaderBar showing a Person object with orange user icons.
      </p>
    </div>
  );
};

export const NoBreadcrumbs: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-border overflow-hidden">
        <HeaderBar
          onSearchClick={() => console.log('Search clicked')}
          onSettingsClick={() => console.log('Settings clicked')}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        HeaderBar without breadcrumbs — right-side actions only.
      </p>
    </div>
  );
};

export const MinimalActions: Story = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-md border border-border overflow-hidden">
      <HeaderBar
        onSearchClick={() => console.log('Search clicked')}
        breadcrumbs={pageBreadcrumbs}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      HeaderBar with breadcrumbs and search only (no settings or theme toggle).
    </p>
  </div>
);

export const WindowsShortcut: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-md border border-border overflow-hidden">
        <HeaderBar
          onSearchClick={() => console.log('Search clicked')}
          breadcrumbs={pageBreadcrumbs}
          searchShortcut="Ctrl+K"
          onSettingsClick={() => console.log('Settings clicked')}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        HeaderBar with Windows-style keyboard shortcut (Ctrl+K).
      </p>
    </div>
  );
};

export const InAppContext: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="p-6">
      <div className="flex h-[400px] rounded-md border border-border overflow-hidden">
        {/* Simulated Sidebar */}
        <div className="w-[240px] shrink-0 border-r border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Sidebar</p>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          <HeaderBar
            onSearchClick={() => console.log('Search clicked')}
            breadcrumbs={pageBreadcrumbs}
            onSettingsClick={() => console.log('Settings clicked')}
            theme={theme}
            onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
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
};

export const FullAppLayout: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="p-6">
      <div className="flex h-[500px] flex-col rounded-md border border-border overflow-hidden">
        {/* TitleBar simulation */}
        <div className="h-7 w-full shrink-0 bg-background border-b border-border">
          <p className="pl-20 text-xs text-muted-foreground leading-7">TitleBar (28px)</p>
        </div>

        {/* Below TitleBar */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-[240px] shrink-0 border-r border-border bg-background p-4">
            <p className="text-xs text-muted-foreground">Sidebar</p>
          </div>

          {/* Main content area */}
          <div className="flex flex-1 flex-col">
            <HeaderBar
              onSearchClick={() => console.log('Search clicked')}
              breadcrumbs={pageBreadcrumbs}
              onSettingsClick={() => console.log('Settings clicked')}
              theme={theme}
              onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
            <div className="flex-1 bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Editor / Content</p>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Complete layout: TitleBar (top) + Sidebar (left) + HeaderBar (content) + Content
      </p>
    </div>
  );
};
