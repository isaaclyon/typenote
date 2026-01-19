import type { Story } from '@ladle/react';
import { ScrollArea } from './ScrollArea.js';

export default {
  title: 'Primitives / ScrollArea',
};

// ============================================================================
// Default (Vertical)
// ============================================================================

export const Default: Story = () => (
  <ScrollArea className="h-72 w-48 rounded-md border border-gray-200">
    <div className="p-4">
      <h4 className="mb-4 text-sm font-medium">Scrollable Content</h4>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="py-2 text-sm">
          Item {i + 1}
        </div>
      ))}
    </div>
  </ScrollArea>
);

// ============================================================================
// Horizontal
// ============================================================================

export const Horizontal: Story = () => (
  <ScrollArea orientation="horizontal" className="w-72 rounded-md border border-gray-200">
    <div className="flex gap-4 p-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-gray-100 text-sm"
        >
          {i + 1}
        </div>
      ))}
    </div>
  </ScrollArea>
);

// ============================================================================
// Both Orientations
// ============================================================================

export const BothOrientations: Story = () => (
  <ScrollArea orientation="both" className="h-72 w-72 rounded-md border border-gray-200">
    <div className="p-4" style={{ width: '600px' }}>
      <h4 className="mb-4 text-sm font-medium">Scroll Both Ways</h4>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} className="whitespace-nowrap py-2 text-sm">
          This is a very long line of text for item {i + 1} that extends beyond the container width
          to demonstrate horizontal scrolling.
        </div>
      ))}
    </div>
  </ScrollArea>
);

// ============================================================================
// Sidebar Example
// ============================================================================

export const SidebarExample: Story = () => (
  <div className="w-60 rounded-md border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-4 py-3">
      <span className="text-sm font-medium">Navigation</span>
    </div>
    <ScrollArea className="h-64">
      <div className="p-2">
        {[
          'Dashboard',
          'Projects',
          'Tasks',
          'Calendar',
          'Documents',
          'Reports',
          'Team',
          'Settings',
          'Notifications',
          'Help',
          'Feedback',
          'Account',
          'Billing',
          'Integrations',
          'API Keys',
        ].map((item) => (
          <div key={item} className="cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-gray-50">
            {item}
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

// ============================================================================
// Custom Styling
// ============================================================================

export const CustomStyling: Story = () => (
  <ScrollArea
    className="h-72 w-48 rounded-lg border-2 border-accent-200 bg-accent-50"
    viewportClassName="p-4"
  >
    <h4 className="mb-4 text-sm font-medium text-accent-700">Custom Styled</h4>
    {Array.from({ length: 15 }).map((_, i) => (
      <div key={i} className="py-2 text-sm text-accent-600">
        Accent item {i + 1}
      </div>
    ))}
  </ScrollArea>
);
