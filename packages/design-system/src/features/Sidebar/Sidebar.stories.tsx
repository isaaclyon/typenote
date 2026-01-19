import * as React from 'react';
import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { Star } from '@phosphor-icons/react/dist/ssr/Star';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';
import { Moon } from '@phosphor-icons/react/dist/ssr/Moon';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { PushPin } from '@phosphor-icons/react/dist/ssr/PushPin';

import { Sidebar } from './Sidebar.js';
import { SidebarHeader } from './SidebarHeader.js';
import { SidebarSection } from './SidebarSection.js';
import { SidebarFooter } from './SidebarFooter.js';
import { SidebarItem } from './SidebarItem.js';
import type { SidebarFooterAction } from './types.js';

export default {
  title: 'Features / Sidebar',
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

const favoriteItems = [
  { icon: Star, label: 'Getting Started', iconColor: '#ffb74d' },
  { icon: Star, label: 'Project Ideas', iconColor: '#ffb74d' },
];

const footerActions: SidebarFooterAction[] = [
  { icon: Gear, label: 'Settings', onClick: () => console.log('Settings') },
  { icon: Moon, label: 'Toggle theme', onClick: () => console.log('Theme') },
];

const itemActions = [
  { label: 'Duplicate', icon: Copy, onClick: () => console.log('Duplicate') },
  { label: 'Pin to top', icon: PushPin, onClick: () => console.log('Pin') },
  { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
];

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');

  return (
    <div className="flex h-[600px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
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
              onClick={() => setActiveItem(item.label)}
              actions={itemActions}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Selected: <strong>{activeItem}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Collapsed: <strong>{collapsed ? 'Yes' : 'No'}</strong>
        </p>
      </div>
    </div>
  );
};

export const Collapsed: Story = () => {
  const [collapsed, setCollapsed] = React.useState(true);
  const [activeItem, setActiveItem] = React.useState('Pages');

  return (
    <div className="flex h-[600px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
        />
        <SidebarSection>
          {typeItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              count={item.count}
              iconColor={item.iconColor}
              active={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Hover icons to see tooltips. Click expand button to expand.
        </p>
      </div>
    </div>
  );
};

export const WithSecondarySections: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');

  return (
    <div className="flex h-[600px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
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
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </SidebarSection>
        <SidebarSection label="Favorites">
          {favoriteItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              iconColor={item.iconColor}
              active={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">Two sections: Types and Favorites</p>
      </div>
    </div>
  );
};

export const WithManyItems: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Item 1');

  const manyItems = Array.from({ length: 30 }, (_, i) => ({
    icon: File,
    label: `Item ${i + 1}`,
    count: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="flex h-[500px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
        />
        <SidebarSection label="All Items">
          {manyItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              count={item.count}
              active={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Scroll to see all 30 items. Header and footer stay fixed.
        </p>
      </div>
    </div>
  );
};

export const WithActionsAndCounts: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');

  return (
    <div className="flex h-[600px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
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
              onClick={() => setActiveItem(item.label)}
              actions={itemActions}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Hover items to see counts and action menu (three dots).
        </p>
      </div>
    </div>
  );
};

export const NoLabels: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState('Daily Notes');

  return (
    <div className="flex h-[600px] border border-border rounded-md overflow-hidden">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader
          onSearchClick={() => console.log('Search clicked')}
          onNewClick={() => console.log('New clicked')}
        />
        <SidebarSection>
          {typeItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              count={item.count}
              iconColor={item.iconColor}
              active={activeItem === item.label}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </SidebarSection>
        <SidebarFooter actions={footerActions} />
      </Sidebar>
      <div className="flex-1 p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">Section without a label header.</p>
      </div>
    </div>
  );
};
