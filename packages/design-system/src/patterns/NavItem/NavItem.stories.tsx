import * as React from 'react';
import type { Story } from '@ladle/react';
import { House } from '@phosphor-icons/react/dist/ssr/House';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { Star } from '@phosphor-icons/react/dist/ssr/Star';
import { Folder } from '@phosphor-icons/react/dist/ssr/Folder';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { Tag } from '@phosphor-icons/react/dist/ssr/Tag';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { PencilSimple } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { Archive } from '@phosphor-icons/react/dist/ssr/Archive';

import { NavItem, type NavItemAction } from './NavItem.js';

export default {
  title: 'Patterns/NavItem',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => {
  const [activeItem, setActiveItem] = React.useState('home');

  const actions: NavItemAction[] = [
    { label: 'Rename', icon: PencilSimple, onClick: () => console.log('Rename') },
    { label: 'Duplicate', icon: Copy, onClick: () => console.log('Duplicate') },
    { label: 'Archive', icon: Archive, onClick: () => console.log('Archive') },
    { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
  ];

  return (
    <div className="w-64 space-y-6 p-6">
      <section className="space-y-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Navigation
        </h2>
        <NavItem
          icon={House}
          label="Home"
          active={activeItem === 'home'}
          onClick={() => setActiveItem('home')}
        />
        <NavItem
          icon={Calendar}
          label="Daily Notes"
          count={3}
          active={activeItem === 'daily'}
          onClick={() => setActiveItem('daily')}
        />
        <NavItem
          icon={Star}
          label="Favorites"
          iconColor="#f59e0b"
          count={12}
          active={activeItem === 'favorites'}
          onClick={() => setActiveItem('favorites')}
        />
      </section>

      <section className="space-y-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          With Actions
        </h2>
        <NavItem
          icon={Folder}
          label="Projects"
          count={8}
          actions={actions}
          active={activeItem === 'projects'}
          onClick={() => setActiveItem('projects')}
        />
        <NavItem
          icon={Tag}
          label="Tags"
          actions={actions}
          active={activeItem === 'tags'}
          onClick={() => setActiveItem('tags')}
        />
      </section>

      <section className="space-y-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">States</h2>
        <NavItem icon={House} label="Default" onClick={() => {}} />
        <NavItem icon={Star} label="Active" active onClick={() => {}} />
        <NavItem icon={Archive} label="Disabled" disabled onClick={() => {}} />
      </section>
    </div>
  );
};

// ============================================================================
// Icon Colors
// ============================================================================

export const IconColors: Story = () => (
  <div className="w-64 space-y-1 p-6">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Colored Icons
    </h2>
    <NavItem icon={User} label="People" iconColor="#3b82f6" onClick={() => {}} />
    <NavItem icon={CalendarBlank} label="Events" iconColor="#8b5cf6" onClick={() => {}} />
    <NavItem icon={MapPin} label="Places" iconColor="#10b981" onClick={() => {}} />
    <NavItem icon={Star} label="Favorites" iconColor="#f59e0b" onClick={() => {}} />
    <NavItem icon={Trash} label="Trash" iconColor="#ef4444" onClick={() => {}} />
  </div>
);

// ============================================================================
// With Counts
// ============================================================================

export const WithCounts: Story = () => (
  <div className="w-64 space-y-1 p-6">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Hover to see counts
    </h2>
    <NavItem icon={Folder} label="Documents" count={42} onClick={() => {}} />
    <NavItem icon={Tag} label="Tags" count={156} onClick={() => {}} />
    <NavItem icon={Star} label="Starred" count={7} iconColor="#f59e0b" onClick={() => {}} />
    <NavItem icon={Archive} label="Archived" count={0} onClick={() => {}} />
  </div>
);

// ============================================================================
// With Actions Menu
// ============================================================================

export const WithActionsMenu: Story = () => {
  const basicActions: NavItemAction[] = [
    { label: 'Edit', icon: PencilSimple, onClick: () => console.log('Edit') },
    { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
  ];

  const fullActions: NavItemAction[] = [
    { label: 'Rename', icon: PencilSimple, onClick: () => console.log('Rename') },
    { label: 'Duplicate', icon: Copy, onClick: () => console.log('Duplicate') },
    { label: 'Archive', icon: Archive, onClick: () => console.log('Archive') },
    { label: 'Delete', icon: Trash, onClick: () => console.log('Delete'), destructive: true },
  ];

  return (
    <div className="w-64 space-y-1 p-6">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Hover for action menu
      </h2>
      <NavItem icon={Folder} label="Simple Actions" actions={basicActions} onClick={() => {}} />
      <NavItem
        icon={Folder}
        label="Multiple Actions"
        count={12}
        actions={fullActions}
        onClick={() => {}}
      />
    </div>
  );
};

// ============================================================================
// Active States
// ============================================================================

export const ActiveStates: Story = () => (
  <div className="w-64 space-y-4 p-6">
    <section className="space-y-1">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Default</h2>
      <NavItem icon={House} label="Home" onClick={() => {}} />
      <NavItem icon={Star} label="With Count" count={5} onClick={() => {}} />
    </section>

    <section className="space-y-1">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Active</h2>
      <NavItem icon={House} label="Home" active onClick={() => {}} />
      <NavItem icon={Star} label="With Count" count={5} active onClick={() => {}} />
    </section>

    <section className="space-y-1">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Disabled</h2>
      <NavItem icon={House} label="Home" disabled onClick={() => {}} />
      <NavItem icon={Star} label="With Count" count={5} disabled onClick={() => {}} />
    </section>
  </div>
);

// ============================================================================
// Link Semantics
// ============================================================================

export const LinkSemantics: Story = () => (
  <div className="w-64 space-y-1 p-6">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
      As Links (href prop)
    </h2>
    <NavItem icon={House} label="Home" href="#home" />
    <NavItem icon={Calendar} label="Calendar" href="#calendar" />
    <NavItem icon={Star} label="Favorites" href="#favorites" iconColor="#f59e0b" />
  </div>
);

// ============================================================================
// Full Sidebar Example
// ============================================================================

export const SidebarExample: Story = () => {
  const [activeItem, setActiveItem] = React.useState('today');

  const pageActions: NavItemAction[] = [
    { label: 'Rename', icon: PencilSimple, onClick: () => {} },
    { label: 'Duplicate', icon: Copy, onClick: () => {} },
    { label: 'Delete', icon: Trash, onClick: () => {}, destructive: true },
  ];

  return (
    <div className="w-56 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
      <nav className="space-y-4">
        {/* Quick Access */}
        <section className="space-y-0.5">
          <NavItem
            icon={House}
            label="Home"
            active={activeItem === 'home'}
            onClick={() => setActiveItem('home')}
          />
          <NavItem
            icon={Calendar}
            label="Today"
            active={activeItem === 'today'}
            onClick={() => setActiveItem('today')}
          />
          <NavItem
            icon={Star}
            label="Pinned"
            iconColor="#f59e0b"
            count={4}
            active={activeItem === 'pinned'}
            onClick={() => setActiveItem('pinned')}
          />
        </section>

        {/* Types */}
        <section className="space-y-0.5">
          <h3 className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Types
          </h3>
          <NavItem
            icon={User}
            label="People"
            iconColor="#3b82f6"
            count={28}
            actions={pageActions}
            active={activeItem === 'people'}
            onClick={() => setActiveItem('people')}
          />
          <NavItem
            icon={CalendarBlank}
            label="Events"
            iconColor="#8b5cf6"
            count={12}
            actions={pageActions}
            active={activeItem === 'events'}
            onClick={() => setActiveItem('events')}
          />
          <NavItem
            icon={MapPin}
            label="Places"
            iconColor="#10b981"
            count={7}
            actions={pageActions}
            active={activeItem === 'places'}
            onClick={() => setActiveItem('places')}
          />
        </section>

        {/* System */}
        <section className="space-y-0.5">
          <h3 className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
            System
          </h3>
          <NavItem
            icon={Archive}
            label="Archive"
            active={activeItem === 'archive'}
            onClick={() => setActiveItem('archive')}
          />
          <NavItem
            icon={Trash}
            label="Trash"
            iconColor="#9ca3af"
            active={activeItem === 'trash'}
            onClick={() => setActiveItem('trash')}
          />
        </section>
      </nav>
    </div>
  );
};
