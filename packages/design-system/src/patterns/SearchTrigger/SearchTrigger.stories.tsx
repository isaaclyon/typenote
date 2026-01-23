import type { Story } from '@ladle/react';

import { SearchTrigger } from './SearchTrigger.js';

export default {
  title: 'Patterns / SearchTrigger',
};

export const Overview: Story = () => (
  <div className="space-y-10 p-6">
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Default Size</h2>
      <SearchTrigger onClick={() => alert('Opening command palette...')} />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Compact Size (for TitleBar)</h2>
      <SearchTrigger size="compact" onClick={() => alert('Opening command palette...')} />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Custom Placeholder</h2>
      <SearchTrigger
        placeholder="Search notes..."
        onClick={() => alert('Opening command palette...')}
      />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Windows Shortcut</h2>
      <SearchTrigger shortcut="Ctrl+K" onClick={() => alert('Opening command palette...')} />
    </section>

    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-600">Custom Shortcut</h2>
      <SearchTrigger
        shortcut="⌘P"
        placeholder="Quick open..."
        onClick={() => alert('Opening quick open...')}
      />
    </section>
  </div>
);

export const Default: Story = () => (
  <div className="p-6">
    <SearchTrigger onClick={() => console.log('Search clicked')} />
  </div>
);

export const InHeaderContext: Story = () => (
  <div className="p-6">
    <div className="flex h-10 items-center rounded-md border border-dashed border-border bg-muted/30 px-4">
      <SearchTrigger onClick={() => console.log('Search clicked')} />
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Default size SearchTrigger in a HeaderBar context (40px tall)
    </p>
  </div>
);

export const InTitleBarContext: Story = () => (
  <div className="p-6">
    <div className="flex h-7 items-center justify-end rounded-md border border-dashed border-border bg-muted/30 px-4">
      <SearchTrigger size="compact" onClick={() => console.log('Search clicked')} />
    </div>
    <p className="mt-4 text-xs text-muted-foreground">
      Compact size SearchTrigger in a TitleBar context (28px tall)
    </p>
  </div>
);

export const HoverState: Story = () => (
  <div className="p-6">
    <p className="mb-4 text-sm text-muted-foreground">
      Hover over the trigger to see the border and background change
    </p>
    <SearchTrigger onClick={() => console.log('Search clicked')} />
  </div>
);
