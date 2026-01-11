import type { Story } from '@ladle/react';
import { CollapsibleSection } from './CollapsibleSection.js';
import { PropertyItem } from '../PropertyItem/PropertyItem.js';
import { Tag } from '../Tag/Tag.js';
import { TagAddButton } from '../TagAddButton/TagAddButton.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/csr/ListBullets';
import { TagIcon as TagPhosphor } from '@phosphor-icons/react/dist/csr/Tag';
import { LinkIcon } from '@phosphor-icons/react/dist/csr/Link';
import { LinkSimpleIcon } from '@phosphor-icons/react/dist/csr/LinkSimple';

export default {
  title: 'Components/CollapsibleSection',
};

export const Default: Story = () => (
  <div className="w-64">
    <CollapsibleSection title="Properties">
      <div className="space-y-2">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Pages" value={255} type="number" />
      </div>
    </CollapsibleSection>
  </div>
);

export const WithCount: Story = () => (
  <div className="w-64">
    <CollapsibleSection title="Backlinks" count={5}>
      <div className="space-y-1">
        <BacklinkItem
          title="Daily Note - 2026-01-09"
          snippet="...discussed the sidebar design..."
        />
        <BacklinkItem title="Meeting Notes" snippet="...decided on compound components..." />
      </div>
    </CollapsibleSection>
  </div>
);

export const DefaultCollapsed: Story = () => (
  <div className="w-64">
    <CollapsibleSection title="Unlinked Mentions" count={3} defaultExpanded={false}>
      <div className="space-y-1">
        <BacklinkItem
          title="Development Log"
          snippet="...finished implementing sidebar component..."
        />
      </div>
    </CollapsibleSection>
  </div>
);

export const NonCollapsible: Story = () => (
  <div className="w-64">
    <CollapsibleSection title="Document Info" collapsible={false}>
      <div className="space-y-2 text-sm text-gray-600">
        <p>Created: 2026-01-10</p>
        <p>Modified: 2026-01-10</p>
        <p>Words: 1,234</p>
      </div>
    </CollapsibleSection>
  </div>
);

export const WithPersistence: Story = () => (
  <div className="w-64 space-y-4">
    <CollapsibleSection title="Properties" storageKey="rightPanel.section.properties.collapsed">
      <div className="space-y-2">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Status" value="Read" type="text" />
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Tags" count={3} storageKey="rightPanel.section.tags.collapsed">
      <div className="flex flex-wrap gap-2">
        <Tag>project</Tag>
        <Tag>backend</Tag>
        <TagAddButton />
      </div>
    </CollapsibleSection>
    <p className="text-xs text-gray-500">Collapse state persists to localStorage</p>
  </div>
);

export const WithAndWithoutIcons: Story = () => (
  <div className="flex gap-8">
    {/* Without icon */}
    <div className="w-64">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Without Icon</h3>
      <CollapsibleSection title="Properties">
        <div className="space-y-2">
          <PropertyItem label="Author" value="Isaac Asimov" type="text" />
          <PropertyItem label="Pages" value={255} type="number" />
        </div>
      </CollapsibleSection>
    </div>

    {/* With icon */}
    <div className="w-64">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">With Icon</h3>
      <CollapsibleSection title="Tags" icon={TagPhosphor} count={3}>
        <div className="flex flex-wrap gap-2">
          <Tag>project</Tag>
          <Tag>backend</Tag>
          <Tag>architecture</Tag>
        </div>
      </CollapsibleSection>
    </div>
  </div>
);

export const AllSections: Story = () => (
  <div className="w-64 border border-gray-200 rounded-md overflow-hidden bg-white">
    {/* Outer container with gap */}
    <div className="flex flex-col gap-6 p-4">
      {/* Properties Section */}
      <CollapsibleSection
        title="Properties"
        icon={ListBulletsIcon}
        storageKey="rightPanel.section.properties"
      >
        <div className="space-y-2">
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
      </CollapsibleSection>

      {/* Tags Section */}
      <CollapsibleSection
        title="Tags"
        icon={TagPhosphor}
        count={3}
        storageKey="rightPanel.section.tags"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Tag onClick={() => alert('Navigate')}>project</Tag>
            <Tag onClick={() => alert('Navigate')}>backend</Tag>
            <Tag onClick={() => alert('Navigate')}>architecture</Tag>
          </div>
          <TagAddButton onClick={() => alert('Add tag')} />
        </div>
      </CollapsibleSection>

      {/* Backlinks Section */}
      <CollapsibleSection
        title="Backlinks"
        icon={LinkIcon}
        count={5}
        storageKey="rightPanel.section.backlinks"
      >
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
      </CollapsibleSection>

      {/* Unlinked Mentions Section */}
      <CollapsibleSection
        title="Unlinked Mentions"
        icon={LinkSimpleIcon}
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
      </CollapsibleSection>
    </div>
  </div>
);

export const EmptyStates: Story = () => (
  <div className="w-64 border border-gray-200 rounded-md overflow-hidden">
    <CollapsibleSection title="Properties">
      <div className="space-y-2">
        <PropertyItem label="Author" type="text" placeholder="Add author" />
        <PropertyItem label="Rating" type="number" placeholder="Not rated" />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Tags" count={0}>
      <div className="space-y-2">
        <p className="text-sm text-gray-400">No tags yet</p>
        <TagAddButton onClick={() => alert('Add tag')} />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Backlinks" count={0}>
      <p className="text-sm text-gray-400">No backlinks yet</p>
    </CollapsibleSection>

    <CollapsibleSection title="Unlinked Mentions" count={0} defaultExpanded={false}>
      <p className="text-sm text-gray-400">No unlinked mentions found</p>
    </CollapsibleSection>
  </div>
);

export const Interactive: Story = () => {
  return (
    <div className="w-64 border border-gray-200 rounded-md overflow-hidden">
      <CollapsibleSection title="Click to collapse">
        <p className="text-sm text-gray-600">
          Click the header to collapse this section. The chevron rotates to indicate state.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="Another Section" count={42}>
        <p className="text-sm text-gray-600">Each section can be independently collapsed.</p>
      </CollapsibleSection>
    </div>
  );
};
