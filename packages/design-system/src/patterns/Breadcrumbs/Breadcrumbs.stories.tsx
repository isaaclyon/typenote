import type { Story } from '@ladle/react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Folder } from '@phosphor-icons/react/dist/ssr/Folder';
import { House } from '@phosphor-icons/react/dist/ssr/House';

import { Breadcrumbs } from './Breadcrumbs.js';

export default {
  title: 'Patterns / Breadcrumbs',
};

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Simple</h2>
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => console.log('Home') },
          { label: 'Pages', onClick: () => console.log('Pages') },
          { label: 'My Note' },
        ]}
      />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">With Type Icons</h2>
      <Breadcrumbs
        items={[
          { label: 'Pages', icon: File, iconColor: '#78716c', onClick: () => console.log('Pages') },
          {
            label: 'Project Notes',
            icon: File,
            iconColor: '#78716c',
            onClick: () => console.log('Project Notes'),
          },
          { label: 'My Note', icon: File, iconColor: '#78716c' },
        ]}
      />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Mixed Object Types</h2>
      <Breadcrumbs
        items={[
          {
            label: 'People',
            icon: User,
            iconColor: '#ffb74d',
            onClick: () => console.log('People'),
          },
          { label: 'John Doe', icon: User, iconColor: '#ffb74d' },
        ]}
      />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Daily Note</h2>
      <Breadcrumbs
        items={[
          {
            label: 'Daily Notes',
            icon: CalendarBlank,
            iconColor: '#6495ED',
            onClick: () => console.log('Daily Notes'),
          },
          { label: 'January 19, 2026', icon: CalendarBlank, iconColor: '#6495ED' },
        ]}
      />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Single Item (Current Page Only)</h2>
      <Breadcrumbs items={[{ label: 'Dashboard', icon: House }]} />
    </section>
  </div>
);

export const Simple: Story = () => (
  <div className="p-6">
    <Breadcrumbs
      items={[
        { label: 'Home', onClick: () => console.log('Home') },
        { label: 'Documents', onClick: () => console.log('Documents') },
        { label: 'Current File' },
      ]}
    />
  </div>
);

export const WithIcons: Story = () => (
  <div className="p-6">
    <Breadcrumbs
      items={[
        { label: 'Pages', icon: File, iconColor: '#78716c', onClick: () => console.log('Pages') },
        {
          label: 'Project Notes',
          icon: Folder,
          iconColor: '#78716c',
          onClick: () => console.log('Project Notes'),
        },
        { label: 'Meeting Notes', icon: File, iconColor: '#78716c' },
      ]}
    />
  </div>
);

export const LongPath: Story = () => (
  <div className="p-6">
    <Breadcrumbs
      items={[
        { label: 'Home', onClick: () => console.log('Home') },
        { label: 'Documents', onClick: () => console.log('Documents') },
        { label: 'Projects', onClick: () => console.log('Projects') },
        { label: '2026', onClick: () => console.log('2026') },
        { label: 'Q1', onClick: () => console.log('Q1') },
        { label: 'Final Report' },
      ]}
    />
  </div>
);

export const InTitleBarContext: Story = () => (
  <div className="p-6">
    <div className="flex h-9 items-center justify-center rounded-md border border-dashed border-border bg-muted/30">
      <Breadcrumbs
        items={[
          { label: 'Pages', icon: File, iconColor: '#78716c', onClick: () => console.log('Pages') },
          { label: 'My Note', icon: File, iconColor: '#78716c' },
        ]}
      />
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Breadcrumbs will be absolutely centered in the TitleBar
    </p>
  </div>
);
