import type { Story } from '@ladle/react';
import { BacklinkItem } from './BacklinkItem.js';

export default {
  title: 'Components/BacklinkItem',
};

export const Default: Story = () => (
  <div className="w-64">
    <BacklinkItem
      title="Daily Note - 2026-01-09"
      snippet="...discussed the sidebar design with the team and decided..."
      onClick={() => alert('Navigate to daily note')}
    />
  </div>
);

export const WithHighlight: Story = () => (
  <div className="w-64 space-y-2">
    <BacklinkItem
      title="Architecture Review"
      snippet="...the right panel should show backlinks similar to Obsidian..."
      highlightText="right panel"
      onClick={() => alert('Navigate')}
    />
    <BacklinkItem
      title="Design Notes"
      snippet="...sidebar component uses compound patterns for flexibility..."
      highlightText="sidebar component"
      onClick={() => alert('Navigate')}
    />
  </div>
);

export const NoSnippet: Story = () => (
  <div className="w-64">
    <BacklinkItem title="Meeting Notes" onClick={() => alert('Navigate')} />
  </div>
);

export const LongTitle: Story = () => (
  <div className="w-64 space-y-2">
    <BacklinkItem
      title="This is a very long document title that should truncate with an ellipsis when it exceeds the available width"
      snippet="...some snippet text here..."
      onClick={() => alert('Navigate')}
    />
  </div>
);

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">Backlinks Section</h2>
      <div className="w-64 space-y-1">
        <BacklinkItem
          title="Daily Note - 2026-01-09"
          snippet="...discussed the sidebar design with the team and decided on compound components..."
          highlightText="sidebar"
          onClick={() => alert('Navigate to daily note')}
        />
        <BacklinkItem
          title="Meeting Notes: Architecture Review"
          snippet="...the right panel should show backlinks similar to Obsidian..."
          highlightText="right panel"
          onClick={() => alert('Navigate to meeting')}
        />
        <BacklinkItem
          title="Project Plan"
          snippet="...see the sidebar component for navigation patterns..."
          highlightText="sidebar component"
          onClick={() => alert('Navigate to project')}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">3 documents link here</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Unlinked Mentions</h2>
      <div className="w-64 space-y-1">
        <BacklinkItem
          title="Development Log"
          snippet="...finished implementing sidebar component with 8 sub-parts..."
          highlightText="sidebar component"
          onClick={() => alert('Navigate')}
        />
        <BacklinkItem
          title="Architecture Notes"
          snippet="...the sidebar organism demonstrates flexibility through composition..."
          highlightText="sidebar"
          onClick={() => alert('Navigate')}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">2 unlinked mentions found</p>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Empty State</h2>
      <div className="w-64">
        <p className="text-sm text-gray-400">No backlinks yet</p>
      </div>
    </section>
  </div>
);

export const Interactive: Story = () => {
  return (
    <div className="w-80 p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Backlinks (5)</h3>
      <div className="space-y-1">
        <BacklinkItem
          title="Daily Note - 2026-01-10"
          snippet="...working on the right panel component design today..."
          highlightText="right panel"
          onClick={() => alert('Navigate to daily note')}
        />
        <BacklinkItem
          title="Feature Planning"
          snippet="...need to implement backlinks in the right panel..."
          highlightText="right panel"
          onClick={() => alert('Navigate to planning')}
        />
        <BacklinkItem
          title="Design System Docs"
          snippet="...the right panel will use compound components..."
          highlightText="right panel"
          onClick={() => alert('Navigate to docs')}
        />
        <BacklinkItem
          title="Implementation Notes"
          snippet="...PropertyItem goes in the right panel properties section..."
          highlightText="right panel"
          onClick={() => alert('Navigate to notes')}
        />
        <BacklinkItem
          title="Architecture Decision"
          snippet="...decided to make the right panel 240px to match the sidebar..."
          highlightText="right panel"
          onClick={() => alert('Navigate to decision')}
        />
      </div>
    </div>
  );
};

export const NonClickable: Story = () => (
  <div className="w-64">
    <BacklinkItem title="Read-only Item" snippet="...this item has no onClick handler..." />
    <p className="text-xs text-gray-500 mt-2">No hover effect when non-clickable</p>
  </div>
);
