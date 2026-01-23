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
 * Default title bar with sidebar collapse toggle.
 * In the Capacities-style layout, the TitleBar is minimal - just a draggable
 * region with the collapse toggle positioned after traffic lights.
 */
export const Default: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <TitleBar
        sidebarCollapsed={collapsed}
        onSidebarCollapseToggle={() => setCollapsed(!collapsed)}
      />
      <div className="h-[200px] p-4">
        <p className="text-sm text-muted-foreground">
          Sidebar collapsed: <strong>{collapsed ? 'Yes' : 'No'}</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          The title bar is 28px tall with just a collapse toggle on the left. Search, settings, and
          theme controls have moved to the sidebar.
        </p>
      </div>
    </div>
  );
};

/**
 * Empty title bar - just a draggable region with no controls.
 */
export const Empty: Story = () => (
  <div className="border border-border rounded-md overflow-hidden bg-background">
    <TitleBar />
    <div className="h-[200px] p-4">
      <p className="text-sm text-muted-foreground">
        Title bar with no controls — entire region is draggable.
      </p>
    </div>
  </div>
);

/**
 * Simulating macOS layout with traffic light placeholder and collapse toggle.
 * The actual traffic lights are rendered by Electron at x:16, y:16.
 * The collapse toggle appears immediately after the traffic lights.
 */
export const MacOSSimulation: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <TitleBar
        sidebarCollapsed={collapsed}
        onSidebarCollapseToggle={() => setCollapsed(!collapsed)}
      >
        {/* Placeholder showing where macOS traffic lights appear */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" title="Close" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" title="Minimize" />
          <div className="h-3 w-3 rounded-full bg-green-400" title="Maximize" />
        </div>
      </TitleBar>
      <div className="h-[200px] p-4">
        <p className="text-sm text-muted-foreground">
          Simulated macOS: traffic lights on left, collapse toggle next to them.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Sidebar collapsed: <strong>{collapsed ? 'Yes' : 'No'}</strong>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Real traffic lights are rendered by Electron at{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">
            trafficLightPosition: {'{'} x: 16, y: 16 {'}'}
          </code>
        </p>
      </div>
    </div>
  );
};

/**
 * Full app simulation showing TitleBar with collapse toggle above sidebar and content.
 * This demonstrates the Capacities-style layout where:
 * - TitleBar has only the collapse toggle
 * - Sidebar header has search
 * - Sidebar footer has settings/theme
 */
export const FullAppLayout: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      {/* Title bar with just collapse toggle */}
      <TitleBar
        sidebarCollapsed={collapsed}
        onSidebarCollapseToggle={() => setCollapsed(!collapsed)}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-yellow-400" />
          <div className="h-3 w-3 rounded-full bg-green-400" />
        </div>
      </TitleBar>

      {/* Below title bar: sidebar + content */}
      <div className="flex h-[400px]">
        {/* Sidebar placeholder */}
        <div
          className="shrink-0 border-r border-border bg-background flex flex-col transition-[width] duration-200"
          style={{ width: collapsed ? 56 : 240 }}
        >
          {/* Sidebar header placeholder */}
          <div className="p-2 flex gap-2">
            <div className="h-8 flex-1 bg-muted/50 rounded text-xs flex items-center justify-center text-muted-foreground">
              {collapsed ? '+' : '[+ New] [🔍]'}
            </div>
          </div>
          {/* Sidebar content placeholder */}
          <div className="flex-1 p-2">
            <div className="text-xs text-muted-foreground">{collapsed ? '📄' : '📄 Pages'}</div>
          </div>
          {/* Sidebar footer placeholder */}
          <div className="p-2 border-t border-border">
            <div className="text-xs text-muted-foreground">{collapsed ? '⚙️' : '[⚙️] [☀️]'}</div>
          </div>
        </div>

        {/* Main content with simplified HeaderBar (breadcrumbs only) */}
        <div className="flex flex-1 flex-col">
          <div className="flex h-10 items-center px-4 bg-background border-b border-border">
            <p className="text-xs text-muted-foreground">📄 Pages / 📄 My Note (breadcrumbs)</p>
          </div>
          <div className="flex-1 p-4">
            <p className="text-sm text-muted-foreground">Capacities-style layout:</p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>• TitleBar: collapse toggle only (after traffic lights)</li>
              <li>• Sidebar header: [+ New] and [🔍 Search]</li>
              <li>• Sidebar footer: [⚙️ Settings] and [☀️ Theme]</li>
              <li>• HeaderBar: breadcrumbs only</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dark mode demonstration.
 */
export const DarkMode: Story = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="dark border border-border rounded-md overflow-hidden bg-background">
      <TitleBar
        sidebarCollapsed={collapsed}
        onSidebarCollapseToggle={() => setCollapsed(!collapsed)}
      >
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
            Dark mode with minimal TitleBar (collapse toggle only).
          </p>
        </div>
      </div>
    </div>
  );
};
