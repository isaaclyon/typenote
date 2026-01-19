import * as React from 'react';
import type { Story } from '@ladle/react';

import { TitleBar } from './TitleBar.js';

export default {
  title: 'Features / TitleBar',
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Default empty title bar - just a draggable region.
 * In Electron, this provides window movement when dragged.
 * In Ladle, drag behavior won't work but layout is visible.
 */
export const Default: Story = () => (
  <div className="border border-border rounded-md overflow-hidden bg-background">
    <TitleBar />
    <div className="h-[200px] p-4">
      <p className="text-sm text-muted-foreground">
        The title bar is the 28px region at the top. In Electron, it&apos;s draggable for window
        movement. No visible border — seamlessly blends with content.
      </p>
    </div>
  </div>
);

/**
 * Simulating macOS layout with traffic light placeholder.
 * The actual traffic lights are rendered by Electron at x:16, y:16.
 */
export const MacOSSimulation: Story = () => (
  <div className="border border-border rounded-md overflow-hidden bg-background">
    <TitleBar>
      {/* Placeholder showing where macOS traffic lights appear */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
        <div className="h-3 w-3 rounded-full bg-red-400" title="Close" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" title="Minimize" />
        <div className="h-3 w-3 rounded-full bg-green-400" title="Maximize" />
      </div>
    </TitleBar>
    <div className="h-[200px] p-4">
      <p className="text-sm text-muted-foreground">
        Simulated macOS traffic lights. Real buttons are rendered by Electron at{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">
          trafficLightPosition: {'{'} x: 16, y: 16 {'}'}
        </code>
      </p>
    </div>
  </div>
);

/**
 * Simulating Windows layout with overlay controls placeholder.
 * Windows uses native titleBarOverlay on the right side.
 */
export const WindowsSimulation: Story = () => (
  <div className="border border-border rounded-md overflow-hidden bg-background">
    <TitleBar>
      {/* Placeholder showing where Windows controls appear */}
      <div className="absolute right-0 top-0 flex h-full">
        <div className="flex h-full w-12 items-center justify-center hover:bg-muted">
          <span className="text-xs text-muted-foreground">—</span>
        </div>
        <div className="flex h-full w-12 items-center justify-center hover:bg-muted">
          <span className="text-xs text-muted-foreground">□</span>
        </div>
        <div className="flex h-full w-12 items-center justify-center hover:bg-red-500 hover:text-white">
          <span className="text-xs">×</span>
        </div>
      </div>
    </TitleBar>
    <div className="h-[200px] p-4">
      <p className="text-sm text-muted-foreground">
        Simulated Windows controls. Real buttons use{' '}
        <code className="text-xs bg-muted px-1 py-0.5 rounded">titleBarOverlay</code> config in
        Electron.
      </p>
    </div>
  </div>
);

/**
 * Full app simulation showing TitleBar above sidebar and content.
 * Both title bar and sidebar use white background for a clean, unified look.
 */
export const FullAppLayout: Story = () => (
  <div className="border border-border rounded-md overflow-hidden bg-background">
    {/* Title bar spans full width - white bg, no border */}
    <TitleBar>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
      </div>
    </TitleBar>

    {/* Below title bar: sidebar + content */}
    <div className="flex h-[400px]">
      {/* Sidebar - white bg to match title bar */}
      <div className="w-60 shrink-0 border-r border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">Sidebar</p>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        <p className="text-sm text-muted-foreground">
          Clean layout: Title bar and sidebar share white background. Only the sidebar has a right
          border to separate from content.
        </p>
      </div>
    </div>
  </div>
);

/**
 * Dark mode demonstration.
 */
export const DarkMode: Story = () => (
  <div className="dark border border-border rounded-md overflow-hidden bg-background">
    <TitleBar>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
        <div className="h-3 w-3 rounded-full bg-red-400" />
        <div className="h-3 w-3 rounded-full bg-yellow-400" />
        <div className="h-3 w-3 rounded-full bg-green-400" />
      </div>
    </TitleBar>
    <div className="flex h-[300px]">
      <div className="w-60 shrink-0 border-r border-border bg-background p-4">
        <p className="text-xs text-muted-foreground">Sidebar</p>
      </div>
      <div className="flex-1 p-4">
        <p className="text-sm text-muted-foreground">
          Dark mode: Same clean layout with dark background.
        </p>
      </div>
    </div>
  </div>
);
