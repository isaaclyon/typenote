import type { Story } from '@ladle/react';
import { RightPanelSection } from './RightPanelSection.js';
import { PropertyItem } from '../PropertyItem/PropertyItem.js';
import { Tag } from '../Tag/Tag.js';
import { TagAddButton } from '../TagAddButton/TagAddButton.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';

export default {
  title: 'Components/RightPanelSection',
};

export const Default: Story = () => (
  <div className="w-64">
    <RightPanelSection title="Properties">
      <div className="space-y-3">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Pages" value={255} type="number" />
      </div>
    </RightPanelSection>
  </div>
);

export const WithCount: Story = () => (
  <div className="w-64">
    <RightPanelSection title="Backlinks" count={5}>
      <div className="space-y-1">
        <BacklinkItem
          title="Daily Note - 2026-01-09"
          snippet="...discussed the sidebar design..."
        />
        <BacklinkItem title="Meeting Notes" snippet="...decided on compound components..." />
      </div>
    </RightPanelSection>
  </div>
);

export const DefaultCollapsed: Story = () => (
  <div className="w-64">
    <RightPanelSection title="Unlinked Mentions" count={3} defaultExpanded={false}>
      <div className="space-y-1">
        <BacklinkItem
          title="Development Log"
          snippet="...finished implementing sidebar component..."
        />
      </div>
    </RightPanelSection>
  </div>
);

export const NonCollapsible: Story = () => (
  <div className="w-64">
    <RightPanelSection title="Document Info" collapsible={false}>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Created: 2026-01-10</p>
        <p>Modified: 2026-01-10</p>
        <p>Words: 1,234</p>
      </div>
    </RightPanelSection>
  </div>
);

export const WithPersistence: Story = () => (
  <div className="w-64 space-y-4">
    <RightPanelSection title="Properties" storageKey="rightPanel.section.properties.collapsed">
      <div className="space-y-3">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Status" value="Read" type="text" />
      </div>
    </RightPanelSection>
    <RightPanelSection title="Tags" count={3} storageKey="rightPanel.section.tags.collapsed">
      <div className="flex flex-wrap gap-2">
        <Tag>project</Tag>
        <Tag>backend</Tag>
        <TagAddButton />
      </div>
    </RightPanelSection>
    <p className="text-xs text-gray-500">Collapse state persists to localStorage</p>
  </div>
);

export const AllSections: Story = () => (
  <div className="w-64 border border-gray-200 rounded-md overflow-hidden">
    {/* Properties Section */}
    <RightPanelSection title="Properties" storageKey="rightPanel.section.properties">
      <div className="space-y-3">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Pages" value={255} type="number" />
        <PropertyItem label="Published" value="1951-05-01" type="date" />
        <PropertyItem
          label="Status"
          value="Read"
          type="select"
          options={['Want to Read', 'Reading', 'Read']}
        />
      </div>
    </RightPanelSection>

    {/* Tags Section */}
    <RightPanelSection title="Tags" count={3} storageKey="rightPanel.section.tags">
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Tag onClick={() => alert('Navigate')}>project</Tag>
          <Tag onClick={() => alert('Navigate')}>backend</Tag>
          <Tag onClick={() => alert('Navigate')}>architecture</Tag>
        </div>
        <TagAddButton onClick={() => alert('Add tag')} />
      </div>
    </RightPanelSection>

    {/* Backlinks Section */}
    <RightPanelSection title="Backlinks" count={5} storageKey="rightPanel.section.backlinks">
      <div className="space-y-1">
        <BacklinkItem
          title="Daily Note - 2026-01-09"
          snippet="...discussed the sidebar design with the team..."
          highlightText="sidebar"
          onClick={() => alert('Navigate')}
        />
        <BacklinkItem
          title="Meeting Notes"
          snippet="...decided on compound components for flexibility..."
          onClick={() => alert('Navigate')}
        />
        <BacklinkItem
          title="Architecture Review"
          snippet="...the right panel should show backlinks..."
          highlightText="right panel"
          onClick={() => alert('Navigate')}
        />
      </div>
    </RightPanelSection>

    {/* Unlinked Mentions Section */}
    <RightPanelSection
      title="Unlinked Mentions"
      count={2}
      defaultExpanded={false}
      storageKey="rightPanel.section.unlinkedMentions"
    >
      <div className="space-y-1">
        <BacklinkItem
          title="Development Log"
          snippet="...finished implementing sidebar component with 8 sub-parts..."
          highlightText="sidebar component"
          onClick={() => alert('Navigate')}
        />
        <BacklinkItem
          title="Implementation Notes"
          snippet="...the sidebar uses CVA for variant management..."
          highlightText="sidebar"
          onClick={() => alert('Navigate')}
        />
      </div>
    </RightPanelSection>
  </div>
);

export const EmptyStates: Story = () => (
  <div className="w-64 border border-gray-200 rounded-md overflow-hidden">
    <RightPanelSection title="Properties">
      <div className="space-y-3">
        <PropertyItem label="Author" type="text" placeholder="Add author" />
        <PropertyItem label="Rating" type="number" placeholder="Not rated" />
      </div>
    </RightPanelSection>

    <RightPanelSection title="Tags" count={0}>
      <div className="space-y-2">
        <p className="text-sm text-gray-400">No tags yet</p>
        <TagAddButton onClick={() => alert('Add tag')} />
      </div>
    </RightPanelSection>

    <RightPanelSection title="Backlinks" count={0}>
      <p className="text-sm text-gray-400">No backlinks yet</p>
    </RightPanelSection>

    <RightPanelSection title="Unlinked Mentions" count={0} defaultExpanded={false}>
      <p className="text-sm text-gray-400">No unlinked mentions found</p>
    </RightPanelSection>
  </div>
);

export const Interactive: Story = () => {
  return (
    <div className="w-64 border border-gray-200 rounded-md overflow-hidden">
      <RightPanelSection title="Click to collapse">
        <p className="text-sm text-gray-600">
          Click the header to collapse this section. The chevron rotates to indicate state.
        </p>
      </RightPanelSection>

      <RightPanelSection title="Another Section" count={42}>
        <p className="text-sm text-gray-600">Each section can be independently collapsed.</p>
      </RightPanelSection>
    </div>
  );
};
