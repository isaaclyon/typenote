import * as React from 'react';
import type { Story } from '@ladle/react';

import { ThemeToggle, type Theme } from './ThemeToggle.js';

export default {
  title: 'Patterns / ThemeToggle',
};

export const Overview: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Interactive</h2>
        <div className="flex items-center gap-4">
          <ThemeToggle
            theme={theme}
            onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
          <span className="text-sm text-muted-foreground">
            Current theme: <strong>{theme}</strong>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Note: This only toggles the component state, not the actual page theme.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Light Mode State</h2>
        <div className="flex items-center gap-4">
          <ThemeToggle theme="light" onToggle={() => {}} />
          <span className="text-sm text-muted-foreground">Shows Sun icon</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Dark Mode State</h2>
        <div className="flex items-center gap-4">
          <ThemeToggle theme="dark" onToggle={() => {}} />
          <span className="text-sm text-muted-foreground">Shows Moon icon</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ThemeToggle theme="light" onToggle={() => {}} size="xs" showTooltip={false} />
            <span className="text-xs text-muted-foreground">xs</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme="light" onToggle={() => {}} size="sm" showTooltip={false} />
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme="light" onToggle={() => {}} size="md" showTooltip={false} />
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle theme="light" onToggle={() => {}} size="lg" showTooltip={false} />
            <span className="text-xs text-muted-foreground">lg</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Without Tooltip</h2>
        <div className="flex items-center gap-4">
          <ThemeToggle theme="light" onToggle={() => {}} showTooltip={false} />
          <span className="text-sm text-muted-foreground">No tooltip on hover</span>
        </div>
      </section>
    </div>
  );
};

export const LightMode: Story = () => (
  <div className="p-6">
    <ThemeToggle theme="light" onToggle={() => console.log('Toggle to dark')} />
  </div>
);

export const DarkMode: Story = () => (
  <div className="p-6">
    <ThemeToggle theme="dark" onToggle={() => console.log('Toggle to light')} />
  </div>
);

export const InChromeContext: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="p-6">
      <div className="flex h-9 items-center justify-end rounded-md border border-dashed border-border bg-muted/30 px-4">
        <ThemeToggle
          theme={theme}
          onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Default size (sm) ThemeToggle in a chrome row context (36px tall)
      </p>
    </div>
  );
};

export const InTitleBarContext: Story = () => {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    <div className="p-6">
      <div className="flex h-9 items-center justify-end rounded-md border border-dashed border-border bg-muted/30 px-4">
        <ThemeToggle
          theme={theme}
          size="xs"
          onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Extra small (xs) ThemeToggle in a TitleBar context (36px tall)
      </p>
    </div>
  );
};
