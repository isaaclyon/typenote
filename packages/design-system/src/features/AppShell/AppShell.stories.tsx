import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import { Moon } from '@phosphor-icons/react/dist/ssr/Moon';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { NotePencil } from '@phosphor-icons/react/dist/ssr/NotePencil';
import { Sun } from '@phosphor-icons/react/dist/ssr/Sun';
import { Archive } from '@phosphor-icons/react/dist/ssr/Archive';

import { AppShell } from './AppShell.js';
import { SidebarHeader } from '../Sidebar/SidebarHeader.js';
import { SidebarSection } from '../Sidebar/SidebarSection.js';
import { SidebarFooter } from '../Sidebar/SidebarFooter.js';
import { SidebarItem } from '../Sidebar/SidebarItem.js';
import { PlaceholderAction } from '../../patterns/PlaceholderAction/PlaceholderAction.js';
import { EmptyState } from '../../patterns/EmptyState/EmptyState.js';
import type { Theme } from '../../patterns/ThemeToggle/ThemeToggle.js';
import type { BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';
import type { SidebarFooterAction } from '../Sidebar/types.js';

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
  { icon: CheckSquare, label: 'Tasks', count: 9, iconColor: '#f87171' },
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

const getSearchShortcut = (): string => {
  if (typeof navigator === 'undefined') {
    return 'Ctrl+K';
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? '⌘K' : 'Ctrl+K';
};

const defaultSearchShortcut = getSearchShortcut();

const titleBarTrafficLights = (
  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
    <div className="h-3 w-3 rounded-full bg-red-400" />
    <div className="h-3 w-3 rounded-full bg-yellow-400" />
    <div className="h-3 w-3 rounded-full bg-green-400" />
  </div>
);

// ============================================================================
// Sidebar footer actions
// ============================================================================

const buildFooterActions = (theme: Theme, onToggleTheme: () => void): SidebarFooterAction[] => [
  {
    icon: Archive,
    label: 'Archive',
    onClick: () => console.log('Archive clicked'),
  },
  {
    icon: theme === 'light' ? Moon : Sun,
    label: theme === 'light' ? 'Dark mode' : 'Light mode',
    onClick: onToggleTheme,
  },
  {
    icon: Gear,
    label: 'Settings',
    onClick: () => console.log('Settings clicked'),
  },
];

// ============================================================================
// Reusable sidebar content
// ============================================================================

interface SidebarContentProps {
  activeItem: string;
  onItemClick: (label: string) => void;
  onSearchClick?: () => void;
  searchShortcut?: string;
  footerActions?: SidebarFooterAction[];
  collapsed?: boolean;
}

function renderSidebarContent({
  activeItem,
  onItemClick,
  onSearchClick,
  searchShortcut,
  footerActions,
  collapsed = false,
}: SidebarContentProps) {
  return (
    <>
      <SidebarHeader
        onNewClick={() => console.log('New note clicked')}
        {...(onSearchClick && { onSearchClick })}
        {...(searchShortcut && { searchShortcut })}
      />
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
      {footerActions && footerActions.length > 0 && <SidebarFooter actions={footerActions} />}
    </>
  );
}

// ============================================================================
// Stories
// ============================================================================

/**
 * Default AppShell with expanded sidebar, breadcrumbs, and controls in sidebar.
 */
export const Default: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Pages');
  const [theme, setTheme] = React.useState<Theme>('light');
  const footerActions = buildFooterActions(theme, () =>
    setTheme(theme === 'light' ? 'dark' : 'light')
  );

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={renderSidebarContent({
          activeItem,
          onItemClick: setActiveItem,
          onSearchClick: () => console.log('Search clicked'),
          searchShortcut: defaultSearchShortcut,
          footerActions,
          collapsed,
        })}
        titleBarChildren={titleBarTrafficLights}
        breadcrumbs={pageBreadcrumbs}
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Content area for <strong>{activeItem}</strong>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Sidebar collapsed: {collapsed ? 'Yes' : 'No'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Note: Controls (search, theme, settings) live in the sidebar header/footer. Breadcrumbs
            render in the TitleBar.
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
  const footerActions = buildFooterActions(theme, () =>
    setTheme(theme === 'light' ? 'dark' : 'light')
  );

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={renderSidebarContent({
          activeItem,
          onItemClick: setActiveItem,
          onSearchClick: () => console.log('Search clicked'),
          searchShortcut: defaultSearchShortcut,
          footerActions,
          collapsed,
        })}
        titleBarChildren={titleBarTrafficLights}
        breadcrumbs={dailyNoteBreadcrumbs}
      >
        <div className="p-6">
          <p className="text-sm text-muted-foreground">
            Collapsed sidebar mode. Hover icons for tooltips.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Click the expand button in the TitleBar to expand.
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
  const footerActions = buildFooterActions(theme, () =>
    setTheme(theme === 'light' ? 'dark' : 'light')
  );

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={renderSidebarContent({
          activeItem,
          onItemClick: setActiveItem,
          onSearchClick: () => console.log('Search clicked'),
          searchShortcut: defaultSearchShortcut,
          footerActions,
          collapsed,
        })}
        titleBarChildren={titleBarTrafficLights}
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
  const footerActions = buildFooterActions(theme, () =>
    setTheme(theme === 'light' ? 'dark' : 'light')
  );

  return (
    <div className="h-[600px] w-full border border-border rounded-md overflow-hidden">
      <AppShell
        sidebarCollapsed={collapsed}
        onSidebarCollapsedChange={setCollapsed}
        sidebarContent={renderSidebarContent({
          activeItem,
          onItemClick: setActiveItem,
          onSearchClick: () => console.log('Search clicked'),
          searchShortcut: defaultSearchShortcut,
          footerActions,
          collapsed,
        })}
        titleBarChildren={titleBarTrafficLights}
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
  const footerActions = buildFooterActions(theme, () =>
    setTheme(theme === 'light' ? 'dark' : 'light')
  );

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
        sidebarContent={renderSidebarContent({
          activeItem,
          onItemClick: handleItemClick,
          onSearchClick: () => console.log('Search clicked - would open command palette'),
          searchShortcut: defaultSearchShortcut,
          footerActions,
          collapsed,
        })}
        titleBarChildren={titleBarTrafficLights}
        breadcrumbs={breadcrumbs}
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
              <li>Toggle sidebar collapse with the button in the TitleBar</li>
              <li>Click search in the sidebar header to log to console</li>
              <li>Click the theme action in the sidebar footer to toggle theme</li>
              <li>Click settings in the sidebar footer to log to console</li>
              <li>Breadcrumbs are in the TitleBar, controls are in the sidebar</li>
            </ul>
          </div>
        </div>
      </AppShell>
    </div>
  );
};
