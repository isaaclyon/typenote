import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { NotePencil } from '@phosphor-icons/react/dist/ssr/NotePencil';

import { AppShell } from './AppShell.js';
import { SidebarHeader } from '../Sidebar/SidebarHeader.js';
import { SidebarSection } from '../Sidebar/SidebarSection.js';
import { SidebarItem } from '../Sidebar/SidebarItem.js';
import { PlaceholderAction } from '../../patterns/PlaceholderAction/PlaceholderAction.js';
import { EmptyState } from '../../patterns/EmptyState/EmptyState.js';
import type { Theme } from '../../patterns/ThemeToggle/ThemeToggle.js';
import type { BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';

export default {
  title: 'Features / AppShell',
};

// ============================================================================
// Sample data
// ============================================================================

const typeItems = [
  { icon: CalendarBlank, label: 'Daily Notes', count: 365, iconColor: '#6495ED' },
  { icon: File, label: 'Pages', count: 42, iconColor: '#78716c' },
  { icon: User, label: 'People', count: 18, iconColor: '#ffb74d' },
  { icon: Calendar, label: 'Events', count: 7, iconColor: '#81c784' },
  { icon: MapPin, label: 'Places', count: 12, iconColor: '#e57373' },
];

const pageBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Pages', icon: File, iconColor: '#78716c', onClick: () => console.log('Pages') },
  {
    label: 'Project Notes',
    icon: File,
    iconColor: '#78716c',
    onClick: () => console.log('Project Notes'),
  },
  { label: 'My Note', icon: File, iconColor: '#78716c' },
];

const dailyNoteBreadcrumbs: BreadcrumbItem[] = [
  {
    label: 'Daily Notes',
    icon: CalendarBlank,
    iconColor: '#6495ED',
    onClick: () => console.log('Daily Notes'),
  },
  { label: 'January 19, 2026', icon: CalendarBlank, iconColor: '#6495ED' },
];

// ============================================================================
// Reusable sidebar content
// ============================================================================

interface SidebarContentProps {
  activeItem: string;
  onItemClick: (label: string) => void;
  collapsed?: boolean;
}

function SidebarContent({ activeItem, onItemClick, collapsed = false }: SidebarContentProps) {
  return (
    <>
      <SidebarHeader onNewClick={() => console.log('New note clicked')} />
      <SidebarSection label="Types">
        {typeItems.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            count={item.count}
            iconColor={item.iconColor}
            active={activeItem === item.label}
            onClick={() => onItemClick(item.label)}
          />
        ))}
        <PlaceholderAction
          icon={Plus}
          label="Add new type"
          onClick={() => console.log('Add type')}
          collapsed={collapsed}
        />
      </SidebarSection>
    </>
  );
}

// ============================================================================
// Stories
// ============================================================================

/**
 * Default AppShell with expanded sidebar, breadcrumbs, and all HeaderBar elements.
 */
export const Default: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Pages');
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={
          <SidebarContent
            activeItem={activeItem}
            onItemClick={setActiveItem}
            collapsed={collapsed}
          />
        }
        breadcrumbs={pageBreadcrumbs}
        onSearchClick={() => console.log('Search clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Content area for <strong>{activeItem}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sidebar collapsed: {collapsed ? 'Yes' : 'No'}
          </p>
        </div>
      </AppShell>
    </div>
  );
};

/**
 * AppShell with sidebar in collapsed (56px) mode.
 */
export const CollapsedSidebar: Story = () => {
  const [collapsed, setCollapsed] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={
          <SidebarContent
            activeItem={activeItem}
            onItemClick={setActiveItem}
            collapsed={collapsed}
          />
        }
        breadcrumbs={dailyNoteBreadcrumbs}
        onSearchClick={() => console.log('Search clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Collapsed sidebar mode. Hover icons for tooltips.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Click the expand button in the sidebar header to expand.
          </p>
        </div>
      </AppShell>
    </div>
  );
};

/**
 * AppShell without breadcrumbs — suitable for home/dashboard views.
 */
export const NoBreadcrumbs: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={
          <SidebarContent
            activeItem={activeItem}
            onItemClick={setActiveItem}
            collapsed={collapsed}
          />
        }
        onSearchClick={() => console.log('Search clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            No breadcrumbs — suitable for home or dashboard views.
          </p>
        </div>
      </AppShell>
    </div>
  );
};

/**
 * AppShell with EmptyState in the content area.
 */
export const WithEmptyState: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Pages');
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={
          <SidebarContent
            activeItem={activeItem}
            onItemClick={setActiveItem}
            collapsed={collapsed}
          />
        }
        onSearchClick={() => console.log('Search clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={NotePencil}
            heading="No page selected"
            description="Select a page from the sidebar or create a new one to get started."
            action={{ label: 'Create new page', onClick: () => console.log('Create page') }}
          />
        </div>
      </AppShell>
    </div>
  );
};

/**
 * Fully interactive AppShell — toggle sidebar, switch themes, navigate.
 */
export const Interactive: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');
  const [theme, setTheme] = React.useState<Theme>('light');
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>(dailyNoteBreadcrumbs);

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    // Update breadcrumbs based on selected item
    const item = typeItems.find((t) => t.label === label);
    if (item) {
      setBreadcrumbs([{ label: item.label, icon: item.icon, iconColor: item.iconColor }]);
    }
  };

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={
          <SidebarContent
            activeItem={activeItem}
            onItemClick={handleItemClick}
            collapsed={collapsed}
          />
        }
        breadcrumbs={breadcrumbs}
        onSearchClick={() => console.log('Search clicked - would open command palette')}
        onSettingsClick={() => console.log('Settings clicked - would open settings modal')}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-2">{activeItem}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            This is the content area for the selected item.
          </p>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>Try these interactions:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Click sidebar items to navigate</li>
              <li>Toggle sidebar collapse with the button in sidebar header</li>
              <li>Click the sun/moon icon to toggle theme (visual only in Ladle)</li>
              <li>Click search to log to console</li>
            </ul>
          </div>
        </div>
      </AppShell>
    </div>
  );
};
