import type { Story } from '@ladle/react';
import { useState } from 'react';
import { RightPanel } from './RightPanel.js';
import { RightPanelSection } from '../RightPanelSection/RightPanelSection.js';
import { PropertyItem } from '../PropertyItem/PropertyItem.js';
import { Tag } from '../Tag/Tag.js';
import { TagAddButton } from '../TagAddButton/TagAddButton.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';

export default {
  title: 'Components/RightPanel',
};

export const Default: Story = () => (
  <RightPanel>
    <RightPanelSection title="Properties">
      <div className="space-y-3">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Pages" value={255} type="number" />
      </div>
    </RightPanelSection>
  </RightPanel>
);

export const Complete: Story = () => {
  const [author, setAuthor] = useState('Isaac Asimov');
  const [pages, setPages] = useState(255);
  const [published, setPublished] = useState('1951-05-01');
  const [status, setStatus] = useState('Read');

  return (
    <RightPanel>
      {/* Properties Section */}
      <RightPanelSection title="Properties" storageKey="rightPanel.section.properties">
        <div className="space-y-3">
          <PropertyItem
            label="Author"
            value={author}
            type="text"
            onSave={(val) => setAuthor(val as string)}
          />
          <PropertyItem
            label="Pages"
            value={pages}
            type="number"
            onSave={(val) => setPages(val as number)}
          />
          <PropertyItem
            label="Published"
            value={published}
            type="date"
            onSave={(val) => setPublished(val as string)}
          />
          <PropertyItem
            label="Status"
            value={status}
            type="select"
            options={['Want to Read', 'Reading', 'Read', 'Abandoned']}
            onSave={(val) => setStatus(val as string)}
          />
        </div>
      </RightPanelSection>

      {/* Tags Section */}
      <RightPanelSection title="Tags" count={3} storageKey="rightPanel.section.tags">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Tag
              onClick={() => alert('Navigate to #project')}
              onRemove={() => alert('Remove #project')}
            >
              project
            </Tag>
            <Tag
              onClick={() => alert('Navigate to #backend')}
              onRemove={() => alert('Remove #backend')}
            >
              backend
            </Tag>
            <Tag
              onClick={() => alert('Navigate to #architecture')}
              onRemove={() => alert('Remove #architecture')}
            >
              architecture
            </Tag>
          </div>
          <TagAddButton onClick={() => alert('Add tag')} />
        </div>
      </RightPanelSection>

      {/* Backlinks Section */}
      <RightPanelSection title="Backlinks" count={5} storageKey="rightPanel.section.backlinks">
        <div className="space-y-1">
          <BacklinkItem
            title="Daily Note - 2026-01-09"
            snippet="...discussed the sidebar design with the team and decided on compound components..."
            highlightText="sidebar"
            onClick={() => alert('Navigate to daily note')}
          />
          <BacklinkItem
            title="Meeting Notes: Architecture Review"
            snippet="...the right panel should show backlinks similar to Obsidian for context discovery..."
            highlightText="right panel"
            onClick={() => alert('Navigate to meeting')}
          />
          <BacklinkItem
            title="Project Plan"
            snippet="...see the sidebar component for navigation patterns and structure..."
            highlightText="sidebar component"
            onClick={() => alert('Navigate to project')}
          />
          <BacklinkItem
            title="Implementation Notes"
            snippet="...PropertyItem goes in the right panel properties section with click-to-edit..."
            highlightText="right panel"
            onClick={() => alert('Navigate to notes')}
          />
          <BacklinkItem
            title="Design System Docs"
            snippet="...the right panel will use compound components for flexibility and reusability..."
            highlightText="right panel"
            onClick={() => alert('Navigate to docs')}
          />
        </div>
      </RightPanelSection>

      {/* Unlinked Mentions Section */}
      <RightPanelSection
        title="Unlinked Mentions"
        count={3}
        defaultExpanded={false}
        storageKey="rightPanel.section.unlinkedMentions"
      >
        <div className="space-y-1">
          <BacklinkItem
            title="Development Log"
            snippet="...finished implementing sidebar component with 8 sub-parts for the navigation system..."
            highlightText="sidebar component"
            onClick={() => alert('Navigate to log')}
          />
          <BacklinkItem
            title="Architecture Notes"
            snippet="...the sidebar organism demonstrates flexibility through composition and compound patterns..."
            highlightText="sidebar"
            onClick={() => alert('Navigate to notes')}
          />
          <BacklinkItem
            title="Code Review"
            snippet="...reviewed the sidebar implementation, looks great with proper TypeScript patterns..."
            highlightText="sidebar"
            onClick={() => alert('Navigate to review')}
          />
        </div>
      </RightPanelSection>
    </RightPanel>
  );
};

export const EmptyStates: Story = () => (
  <RightPanel>
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
  </RightPanel>
);

export const WithScrolling: Story = () => (
  <div className="h-screen flex">
    <div className="flex-1 bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Main Content Area</h1>
      <p className="text-gray-600">
        The right panel is fixed width (240px) with independent scrolling. Try scrolling in the
        right panel while this area remains static.
      </p>
    </div>
    <RightPanel>
      <RightPanelSection title="Properties">
        <div className="space-y-3">
          <PropertyItem label="Author" value="Isaac Asimov" type="text" />
          <PropertyItem label="Pages" value={255} type="number" />
          <PropertyItem label="Published" value="1951-05-01" type="date" />
          <PropertyItem label="Status" value="Read" type="text" />
        </div>
      </RightPanelSection>

      <RightPanelSection title="Tags" count={5}>
        <div className="flex flex-wrap gap-2">
          <Tag>project</Tag>
          <Tag>backend</Tag>
          <Tag>architecture</Tag>
          <Tag>design</Tag>
          <Tag>frontend</Tag>
          <TagAddButton />
        </div>
      </RightPanelSection>

      <RightPanelSection title="Backlinks" count={15}>
        <div className="space-y-1">
          {Array.from({ length: 15 }).map((_, i) => (
            <BacklinkItem
              key={i}
              title={`Document ${i + 1}`}
              snippet="...some snippet text that provides context about the link..."
              onClick={() => alert(`Navigate to document ${i + 1}`)}
            />
          ))}
        </div>
      </RightPanelSection>

      <RightPanelSection title="Unlinked Mentions" count={8}>
        <div className="space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <BacklinkItem
              key={i}
              title={`Mention ${i + 1}`}
              snippet="...mentioned in this document without an explicit link..."
              onClick={() => alert(`Navigate to mention ${i + 1}`)}
            />
          ))}
        </div>
      </RightPanelSection>
    </RightPanel>
  </div>
);

export const InteractiveDemo: Story = () => {
  const [tags, setTags] = useState([
    { id: 1, label: 'project' },
    { id: 2, label: 'backend' },
    { id: 3, label: 'architecture' },
  ]);

  const handleRemoveTag = (id: number) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  const handleAddTag = () => {
    const newTag = prompt('Enter tag name:');
    if (newTag) {
      setTags([...tags, { id: Date.now(), label: newTag }]);
    }
  };

  return (
    <RightPanel>
      <RightPanelSection title="Properties">
        <div className="space-y-3">
          <PropertyItem
            label="Title"
            value="Foundation"
            type="text"
            onSave={(val) => alert(`Saved: ${val}`)}
          />
          <PropertyItem
            label="Author"
            value="Isaac Asimov"
            type="text"
            onSave={(val) => alert(`Saved: ${val}`)}
          />
        </div>
      </RightPanelSection>

      <RightPanelSection title="Tags" count={tags.length}>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag
                key={tag.id}
                onClick={() => alert(`Navigate to #${tag.label}`)}
                onRemove={() => handleRemoveTag(tag.id)}
              >
                {tag.label}
              </Tag>
            ))}
          </div>
          <TagAddButton onClick={handleAddTag} />
        </div>
      </RightPanelSection>

      <RightPanelSection title="Backlinks" count={3}>
        <div className="space-y-1">
          <BacklinkItem
            title="Daily Note - 2026-01-10"
            snippet="...working on the right panel today..."
            onClick={() => alert('Navigate')}
          />
          <BacklinkItem
            title="Feature Planning"
            snippet="...need to implement properties section..."
            onClick={() => alert('Navigate')}
          />
          <BacklinkItem
            title="Architecture Decision"
            snippet="...decided to use 240px width..."
            onClick={() => alert('Navigate')}
          />
        </div>
      </RightPanelSection>
    </RightPanel>
  );
};
