/**
 * EditorBottomSections Stories
 *
 * Visual design review for backlinks and unlinked mentions sections.
 * These stories use mocked data to showcase UX/interactions without IPC backend.
 */

import type { Story } from '@ladle/react';
import React from 'react';
import { Link as LinkIcon, Link2 as Link2Icon } from 'lucide-react';
import { CollapsibleSection } from '../CollapsibleSection/CollapsibleSection.js';
import { BacklinkItem } from '../BacklinkItem/BacklinkItem.js';
import { EmptyState } from '../EmptyState/EmptyState.js';

// Mock data
const mockBacklinks = [
  {
    id: '1',
    title: 'Daily Note - 2026-01-10',
    snippet: 'Discussed the new feature implementation for backlinks in the editor.',
    typeIcon: 'Calendar',
    typeColor: '#F59E0B',
  },
  {
    id: '2',
    title: 'Project Planning',
    snippet: 'Review the architecture decisions for the TypeNote knowledge base.',
    typeIcon: 'FileText',
    typeColor: '#6B7280',
  },
  {
    id: '3',
    title: 'Meeting Notes - Design Review',
    snippet: 'The team agreed on the collapsible section approach for better UX.',
    typeIcon: 'CalendarClock',
    typeColor: '#8B5CF6',
  },
];

const mockUnlinkedMentions = [
  {
    id: '4',
    title: 'Dev Log - 2026-01-09',
    snippet: 'Working on TypeNote editor improvements and refactoring components.',
    typeIcon: 'Calendar',
    typeColor: '#F59E0B',
  },
  {
    id: '5',
    title: 'Research Notes',
    snippet: 'Investigating best practices for knowledge management in TypeNote.',
    typeIcon: 'FileText',
    typeColor: '#6B7280',
  },
];

// Container matching editor layout
const EditorContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-3xl mx-auto p-8 bg-white min-h-screen">
    {/* Simulated editor content */}
    <div className="prose prose-sm max-w-none mb-8">
      <h1>Document Title</h1>
      <p>
        This is sample editor content. The backlinks and unlinked mentions sections appear below the
        editor content, separated by a subtle divider.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua.
      </p>
    </div>

    {/* Bottom sections */}
    {children}
  </div>
);

/**
 * Default: Both sections with content
 */
export const Default: Story = () => (
  <EditorContainer>
    <div className="mt-8 space-y-6">
      <CollapsibleSection
        title="Backlinks"
        icon={LinkIcon}
        count={mockBacklinks.length}
        storageKey="ladle.backlinks.collapsed"
      >
        <div className="space-y-2">
          {mockBacklinks.map((backlink) => (
            <BacklinkItem
              key={backlink.id}
              title={backlink.title}
              snippet={backlink.snippet}
              typeIcon={backlink.typeIcon}
              typeColor={backlink.typeColor}
            />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Unlinked Mentions"
        icon={Link2Icon}
        count={mockUnlinkedMentions.length}
        storageKey="ladle.unlinkedMentions.collapsed"
      >
        <div className="space-y-2">
          {mockUnlinkedMentions.map((mention) => (
            <BacklinkItem
              key={mention.id}
              title={mention.title}
              snippet={mention.snippet}
              typeIcon={mention.typeIcon}
              typeColor={mention.typeColor}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  </EditorContainer>
);

/**
 * Empty States: No backlinks or mentions
 */
export const EmptyStates: Story = () => (
  <EditorContainer>
    <div className="mt-8 space-y-6">
      <CollapsibleSection title="Backlinks" icon={LinkIcon} count={0}>
        <EmptyState
          title="No backlinks yet"
          description="Other documents that link to this one will appear here."
        />
      </CollapsibleSection>

      <CollapsibleSection title="Unlinked Mentions" icon={Link2Icon} count={0}>
        <EmptyState
          title="No unlinked mentions"
          description="Documents that mention this title without linking will appear here."
        />
      </CollapsibleSection>
    </div>
  </EditorContainer>
);

/**
 * Loading States: Skeleton placeholders
 */
export const LoadingStates: Story = () => (
  <EditorContainer>
    <div className="mt-8 space-y-6">
      <CollapsibleSection title="Backlinks" icon={LinkIcon}>
        <div className="space-y-1">
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Unlinked Mentions" icon={Link2Icon}>
        <div className="space-y-1">
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-md animate-pulse" />
        </div>
      </CollapsibleSection>
    </div>
  </EditorContainer>
);

/**
 * Mixed States: Backlinks with content, mentions empty
 */
export const MixedStates: Story = () => (
  <EditorContainer>
    <div className="mt-8 space-y-6">
      <CollapsibleSection
        title="Backlinks"
        icon={LinkIcon}
        count={mockBacklinks.length}
        storageKey="ladle.backlinks.mixed"
      >
        <div className="space-y-1">
          {mockBacklinks.map((backlink) => (
            <BacklinkItem
              key={backlink.id}
              title={backlink.title}
              snippet={backlink.snippet}
              typeIcon={backlink.typeIcon}
              typeColor={backlink.typeColor}
            />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Unlinked Mentions" icon={Link2Icon} count={0}>
        <EmptyState
          title="No unlinked mentions"
          description="Documents that mention this title without linking will appear here."
        />
      </CollapsibleSection>
    </div>
  </EditorContainer>
);

/**
 * Many Items: Test scrolling and density
 */
export const ManyItems: Story = () => {
  const typeVariants = [
    { icon: 'Calendar', color: '#F59E0B' }, // DailyNote
    { icon: 'FileText', color: '#6B7280' }, // Page
    { icon: 'CalendarClock', color: '#8B5CF6' }, // Event
    { icon: 'User', color: '#3B82F6' }, // Person
  ];

  const manyBacklinks = Array.from({ length: 15 }, (_, i) => {
    const variantIndex = i % typeVariants.length;
    const variant = typeVariants[variantIndex];
    if (!variant) throw new Error('Invalid variant index');
    return {
      id: `backlink-${i}`,
      title: `Document ${i + 1} - ${['Daily Note', 'Project Plan', 'Meeting Notes', 'Research'][i % 4]}`,
      snippet: `This document contains a reference to the current document. ${i % 2 === 0 ? 'It discusses the implementation details and design decisions.' : 'Brief mention in passing context.'}`,
      typeIcon: variant.icon,
      typeColor: variant.color,
    };
  });

  const manyMentions = Array.from({ length: 8 }, (_, i) => {
    const variantIndex = i % typeVariants.length;
    const variant = typeVariants[variantIndex];
    if (!variant) throw new Error('Invalid variant index');
    return {
      id: `mention-${i}`,
      title: `Unlinked Doc ${i + 1}`,
      snippet: `Contains text that matches the title but isn't explicitly linked.`,
      typeIcon: variant.icon,
      typeColor: variant.color,
    };
  });

  return (
    <EditorContainer>
      <div className="mt-8 space-y-6">
        <CollapsibleSection
          title="Backlinks"
          icon={LinkIcon}
          count={manyBacklinks.length}
          storageKey="ladle.backlinks.many"
        >
          <div className="space-y-1">
            {manyBacklinks.map((backlink) => (
              <BacklinkItem
              key={backlink.id}
              title={backlink.title}
              snippet={backlink.snippet}
              typeIcon={backlink.typeIcon}
              typeColor={backlink.typeColor}
            />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Unlinked Mentions"
          icon={Link2Icon}
          count={manyMentions.length}
          storageKey="ladle.unlinkedMentions.many"
        >
          <div className="space-y-1">
            {manyMentions.map((mention) => (
              <BacklinkItem
              key={mention.id}
              title={mention.title}
              snippet={mention.snippet}
              typeIcon={mention.typeIcon}
              typeColor={mention.typeColor}
            />
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </EditorContainer>
  );
};

/**
 * Interaction States: Demonstrate hover and click interactions
 */
export const InteractionStates: Story = () => {
  const [clicked, setClicked] = React.useState<string | null>(null);

  return (
    <EditorContainer>
      <div className="mt-8 space-y-6">
        <CollapsibleSection
          title="Backlinks"
          icon={LinkIcon}
          count={mockBacklinks.length}
          storageKey="ladle.backlinks.interaction"
        >
          <div className="space-y-1">
            {mockBacklinks.map((backlink) => (
              <BacklinkItem
                key={backlink.id}
                title={backlink.title}
                snippet={backlink.snippet}
                typeIcon={backlink.typeIcon}
                typeColor={backlink.typeColor}
                onClick={() => setClicked(backlink.title)}
              />
            ))}
          </div>
        </CollapsibleSection>

        {clicked && (
          <div className="p-4 bg-accent-50 border border-accent-200 rounded-md">
            <p className="text-sm text-accent-700">
              Clicked: <strong>{clicked}</strong>
            </p>
          </div>
        )}

        <CollapsibleSection
          title="Unlinked Mentions"
          icon={Link2Icon}
          count={mockUnlinkedMentions.length}
          storageKey="ladle.unlinkedMentions.interaction"
        >
          <div className="space-y-1">
            {mockUnlinkedMentions.map((mention) => (
              <BacklinkItem
                key={mention.id}
                title={mention.title}
                snippet={mention.snippet}
                typeIcon={mention.typeIcon}
                typeColor={mention.typeColor}
                onClick={() => setClicked(mention.title)}
              />
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </EditorContainer>
  );
};

/**
 * Collapsed by Default: Show initial collapsed state
 */
export const CollapsedByDefault: Story = () => (
  <EditorContainer>
    <div className="mt-8 space-y-6">
      <CollapsibleSection
        title="Backlinks"
        icon={LinkIcon}
        count={mockBacklinks.length}
        defaultExpanded={false}
        storageKey="ladle.backlinks.collapsed-default"
      >
        <div className="space-y-1">
          {mockBacklinks.map((backlink) => (
            <BacklinkItem
              key={backlink.id}
              title={backlink.title}
              snippet={backlink.snippet}
              typeIcon={backlink.typeIcon}
              typeColor={backlink.typeColor}
            />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Unlinked Mentions"
        icon={Link2Icon}
        count={mockUnlinkedMentions.length}
        defaultExpanded={false}
        storageKey="ladle.unlinkedMentions.collapsed-default"
      >
        <div className="space-y-1">
          {mockUnlinkedMentions.map((mention) => (
            <BacklinkItem
              key={mention.id}
              title={mention.title}
              snippet={mention.snippet}
              typeIcon={mention.typeIcon}
              typeColor={mention.typeColor}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  </EditorContainer>
);

/**
 * All Type Icons: Showcase all built-in object type icons with colors
 */
export const AllTypeIcons: Story = () => {
  const allTypes = [
    {
      id: 'daily-note',
      title: 'Daily Note Example',
      snippet: 'Daily notes use calendar icon with amber color',
      typeIcon: 'Calendar',
      typeColor: '#F59E0B',
    },
    {
      id: 'page',
      title: 'Page Example',
      snippet: 'Pages use file-text icon with gray color',
      typeIcon: 'FileText',
      typeColor: '#6B7280',
    },
    {
      id: 'person',
      title: 'Person Example',
      snippet: 'Person objects use user icon with blue color',
      typeIcon: 'User',
      typeColor: '#3B82F6',
    },
    {
      id: 'event',
      title: 'Event Example',
      snippet: 'Events use calendar-clock icon with purple color',
      typeIcon: 'CalendarClock',
      typeColor: '#8B5CF6',
    },
    {
      id: 'place',
      title: 'Place Example',
      snippet: 'Places use map-pin icon with green color',
      typeIcon: 'MapPin',
      typeColor: '#10B981',
    },
    {
      id: 'task',
      title: 'Task Example',
      snippet: 'Tasks use check-square icon with red color',
      typeIcon: 'CheckSquare',
      typeColor: '#EF4444',
    },
  ];

  return (
    <EditorContainer>
      <div className="mt-8 space-y-6">
        <CollapsibleSection
          title="Type Icons Showcase"
          icon={LinkIcon}
          count={allTypes.length}
          storageKey="ladle.type-icons"
        >
          <div className="space-y-2">
            {allTypes.map((item) => (
              <BacklinkItem
                key={item.id}
                title={item.title}
                snippet={item.snippet}
                typeIcon={item.typeIcon}
                typeColor={item.typeColor}
              />
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </EditorContainer>
  );
};
