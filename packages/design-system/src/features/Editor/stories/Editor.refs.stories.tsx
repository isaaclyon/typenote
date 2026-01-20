/**
 * Editor - References and Tags stories
 *
 * Wiki-links (`[[`), mentions (`@`), and hashtags (`#`).
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { Editor } from '../Editor.js';
import type { RefNodeAttributes, TagNodeAttributes } from '../types.js';
import {
  mockObjects,
  mockRefSearch,
  mockRefCreate,
  mockTags,
  mockTagSearch,
  mockTagCreate,
  mockHeadingSearch,
  mockBlockSearch,
  mockBlockIdInsert,
} from './shared.js';

// Import editor.css for ref-node styles
import '../editor.css';

export default {
  title: 'Features / Editor / References',
};

// Icons for built-in types
const TYPE_ICONS: Record<string, PhosphorIcon> = {
  Page: File,
  DailyNote: CalendarBlank,
  Person: User,
  Event: Calendar,
  Place: MapPin,
  Task: CheckSquare,
};

// ============================================================================
// Reference Stories
// ============================================================================

export const References: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleRefClick = (attrs: RefNodeAttributes) => {
    setLastAction(`Clicked: ${attrs.displayTitle} (${attrs.objectType})`);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Type @ or [[ to insert a reference..."
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={handleRefClick}
        onRefCreate={mockRefCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Type <code className="bg-muted px-1 rounded">@</code> or{' '}
          <code className="bg-muted px-1 rounded">[[</code> to open the reference picker.
        </p>
        <p>Try searching for: &quot;Alice&quot;, &quot;Page&quot;, &quot;Task&quot;, etc.</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

export const ExistingRefs: Story = () => {
  const contentWithRefs: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Meeting Notes' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Discussed the ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789B',
              objectType: 'Page',
              displayTitle: 'Project Roadmap',
              color: '#6366F1',
            },
          },
          { type: 'text', text: ' with ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789C',
              objectType: 'Person',
              displayTitle: 'Alice Johnson',
              color: '#EC4899',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Action item: ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789H',
              objectType: 'Task',
              displayTitle: 'Fix login bug',
              color: '#EF4444',
            },
          },
          { type: 'text', text: ' by end of week.' },
        ],
      },
    ],
  };

  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={contentWithRefs}
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={(attrs) => setLastAction(`Navigate to: ${attrs.displayTitle}`)}
        onRefCreate={mockRefCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Editor with pre-existing references. Click any reference to navigate.</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

ExistingRefs.storyName = 'Existing Refs';

export const RefTypeColors: Story = () => (
  <div className="space-y-4 p-6">
    <p className="text-sm text-foreground leading-relaxed">
      Reference nodes use type-colored icons and underlines. Hover to see the enhanced underline:
    </p>
    <div className="space-y-3 mt-4">
      {mockObjects.map((obj) => {
        const Icon = TYPE_ICONS[obj.objectType] ?? File;
        const refColor = obj.color ?? '#71717A';
        return (
          <div key={obj.objectId} className="flex items-center gap-4">
            <span
              className="ref-node inline-flex items-center gap-1 cursor-pointer"
              style={{ '--ref-color': refColor } as React.CSSProperties}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" weight="regular" style={{ color: refColor }} />
              <span className="ref-node-text">{obj.title}</span>
            </span>
            <span className="text-xs text-muted-foreground">{obj.objectType}</span>
          </div>
        );
      })}
    </div>
    <p className="text-xs text-muted-foreground mt-4">
      Each object type has a distinct icon and color. Underline is subtle by default, thicker on
      hover.
    </p>
  </div>
);

RefTypeColors.storyName = 'Ref Type Colors';

// ============================================================================
// Alias Stories
// ============================================================================

export const AliasedRefs: Story = () => {
  const contentWithAliases: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Wiki-Link Aliases' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'References can have custom display text using the ' },
          { type: 'text', marks: [{ type: 'code' }], text: '[[Page|alias]]' },
          { type: 'text', text: ' syntax.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Check out our ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789B',
              objectType: 'Page',
              displayTitle: 'Project Roadmap',
              color: '#6366F1',
              alias: 'roadmap',
            },
          },
          { type: 'text', text: ' for Q1 milestones. Reach out to ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789C',
              objectType: 'Person',
              displayTitle: 'Alice Johnson',
              color: '#EC4899',
              alias: 'Alice',
            },
          },
          { type: 'text', text: ' for questions.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This ref has no alias: ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789A',
              objectType: 'Page',
              displayTitle: 'Getting Started Guide',
              color: '#6366F1',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  };

  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={contentWithAliases}
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={(attrs) => {
          const display = attrs.alias ?? attrs.displayTitle;
          setLastAction(`Clicked: "${display}" → ${attrs.displayTitle}`);
        }}
        onRefCreate={mockRefCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Refs with aliases show the alias text. Right-click a ref to edit or clear its alias.</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

AliasedRefs.storyName = 'Aliased Refs';

export const RefAliasSyntax: Story = () => (
  <div className="space-y-4 p-6">
    <Editor
      placeholder="Type [[Page|custom alias]] to create a ref with an alias..."
      enableRefs
      onRefSearch={mockRefSearch}
      onRefCreate={mockRefCreate}
    />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Use <code className="bg-muted px-1 rounded">[[Search|alias]]</code> syntax to insert a ref
        with custom display text.
      </p>
      <p>Examples:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">[[Alice Johnson|Alice]]</code> — shows
          &quot;Alice&quot;
        </li>
        <li>
          <code className="bg-muted px-1 rounded">[[Project Roadmap|the plan]]</code> — shows
          &quot;the plan&quot;
        </li>
      </ul>
    </div>
  </div>
);

RefAliasSyntax.storyName = 'Ref Alias (Syntax)';

export const RefAliasEditing: Story = () => {
  const contentForEditing: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Right-click this reference to edit its alias: ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789B',
              objectType: 'Page',
              displayTitle: 'Project Roadmap',
              color: '#6366F1',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={contentForEditing}
        enableRefs
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>To edit an alias:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-0.5 ml-2">
          <li>Right-click a reference node</li>
          <li>Click &quot;Edit alias...&quot;</li>
          <li>Enter custom text and press Enter</li>
          <li>Clear the field to remove the alias</li>
        </ol>
      </div>
    </div>
  );
};

RefAliasEditing.storyName = 'Ref Alias (Editing)';

// ============================================================================
// Tag Stories
// ============================================================================

export const Tags: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleTagClick = (attrs: TagNodeAttributes) => {
    setLastAction(`Clicked tag: ${attrs.displayName}`);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Type # to insert a tag..."
        enableTags
        onTagSearch={mockTagSearch}
        onTagClick={handleTagClick}
        onTagCreate={mockTagCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Type <code className="bg-muted px-1 rounded">#</code> to open the tag picker.
        </p>
        <p>Try searching for: &quot;important&quot;, &quot;work&quot;, &quot;todo&quot;</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

export const ExistingTags: Story = () => {
  const contentWithTags: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Quick Notes' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Remember to follow up on the ' },
          {
            type: 'tagNode',
            attrs: {
              tagId: '01TAG00000000000000001',
              displayName: 'important',
              color: '#EF4444',
            },
          },
          { type: 'text', text: ' items from the ' },
          {
            type: 'tagNode',
            attrs: {
              tagId: '01TAG00000000000000006',
              displayName: 'meeting',
              color: '#EC4899',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'New ' },
          {
            type: 'tagNode',
            attrs: {
              tagId: '01TAG00000000000000002',
              displayName: 'idea',
              color: '#8B5CF6',
            },
          },
          { type: 'text', text: ': Build a knowledge graph.' },
        ],
      },
    ],
  };

  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={contentWithTags}
        enableTags
        onTagSearch={mockTagSearch}
        onTagClick={(attrs) => setLastAction(`Navigate to tag: ${attrs.displayName}`)}
        onTagCreate={mockTagCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Editor with pre-existing tags. Click any tag to navigate.</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

ExistingTags.storyName = 'Existing Tags';

export const TagColors: Story = () => (
  <div className="space-y-4 p-6">
    <p className="text-sm text-foreground leading-relaxed">
      Tag nodes display as colored pills. Hover to see the enhanced background:
    </p>
    <div className="space-y-3 mt-4">
      {mockTags.map((tag) => {
        const tagColor = tag.color ?? '#71717A';
        return (
          <div key={tag.tagId} className="flex items-center gap-4">
            <span
              className="tag-node inline-flex cursor-pointer"
              style={{ '--tag-color': tagColor } as React.CSSProperties}
            >
              <span className="tag-node-pill">#{tag.name}</span>
            </span>
          </div>
        );
      })}
    </div>
    <p className="text-xs text-muted-foreground mt-4">
      Each tag displays with its assigned color. Background is subtle, darkens on hover.
    </p>
  </div>
);

TagColors.storyName = 'Tag Colors';

// ============================================================================
// Heading & Block Reference Stories
// ============================================================================

export const HeadingReferences: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleRefClick = (attrs: RefNodeAttributes) => {
    const suffix = attrs.headingText ? ` > ${attrs.headingText}` : '';
    setLastAction(`Navigate to: ${attrs.displayTitle}${suffix}`);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Type [[Getting Started Guide# to search headings..."
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={handleRefClick}
        onRefCreate={mockRefCreate}
        onHeadingSearch={mockHeadingSearch}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Heading References:</strong> Type{' '}
          <code className="bg-muted px-1 rounded">[[Object#</code> to search headings within that
          object.
        </p>
        <p>
          Try: <code className="bg-muted px-1 rounded">[[Getting Started Guide#Install</code>
        </p>
        <p className="text-xs opacity-70">
          (The object name must match exactly before the # is recognized)
        </p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

HeadingReferences.storyName = 'Heading References';

export const BlockReferences: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleRefClick = (attrs: RefNodeAttributes) => {
    const suffix = attrs.blockId ? `#^${attrs.blockId}` : '';
    setLastAction(`Navigate to: ${attrs.displayTitle}${suffix}`);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Type [[Getting Started Guide#^ to search blocks..."
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={handleRefClick}
        onRefCreate={mockRefCreate}
        onBlockSearch={mockBlockSearch}
        onBlockIdInsert={mockBlockIdInsert}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Block References:</strong> Type{' '}
          <code className="bg-muted px-1 rounded">[[Object#^</code> to search blocks within that
          object.
        </p>
        <p>
          Try: <code className="bg-muted px-1 rounded">[[Getting Started Guide#^install</code>
        </p>
        <p className="text-xs opacity-70">
          Blocks with existing ^aliases show the alias badge. Selecting a block without an alias
          auto-generates a 6-char ID.
        </p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

BlockReferences.storyName = 'Block References';

export const ExistingHeadingBlockRefs: Story = () => {
  const contentWithHeadingBlockRefs: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Document with Granular References' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'See the ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789A',
              objectType: 'Page',
              displayTitle: 'Getting Started Guide',
              color: '#6366F1',
              headingText: 'Installation',
            },
          },
          { type: 'text', text: ' section for setup instructions.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'The key insight is documented here: ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789A',
              objectType: 'Page',
              displayTitle: 'Getting Started Guide',
              color: '#6366F1',
              blockId: 'key-insight',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'For Q1 priorities, refer to ' },
          {
            type: 'refNode',
            attrs: {
              objectId: '01J1234567890123456789B',
              objectType: 'Page',
              displayTitle: 'Project Roadmap',
              color: '#6366F1',
              blockId: 'q1-summary',
            },
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  };

  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        content={contentWithHeadingBlockRefs}
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={(attrs) => {
          let target = attrs.displayTitle;
          if (attrs.headingText) target += ` > ${attrs.headingText}`;
          if (attrs.blockId) target += `#^${attrs.blockId}`;
          setLastAction(`Navigate to: ${target}`);
        }}
        onRefCreate={mockRefCreate}
        onHeadingSearch={mockHeadingSearch}
        onBlockSearch={mockBlockSearch}
        onBlockIdInsert={mockBlockIdInsert}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Pre-existing heading and block references.</strong>
        </p>
        <p>
          Heading refs show <code className="bg-muted px-1 rounded">Page &gt; Heading</code>
        </p>
        <p>
          Block refs show <code className="bg-muted px-1 rounded">Page#^blockId</code>
        </p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

ExistingHeadingBlockRefs.storyName = 'Existing Heading/Block Refs';

export const AllReferenceTypes: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Try all reference types: [[Object]], [[Object#Heading]], [[Object#^block]]"
        enableRefs
        enableTags
        onRefSearch={mockRefSearch}
        onRefClick={(attrs) => {
          let desc = attrs.displayTitle;
          if (attrs.headingText) desc += ` > ${attrs.headingText}`;
          if (attrs.blockId) desc += `#^${attrs.blockId}`;
          if (attrs.alias) desc = `"${attrs.alias}" → ${desc}`;
          setLastAction(`Clicked: ${desc}`);
        }}
        onRefCreate={mockRefCreate}
        onHeadingSearch={mockHeadingSearch}
        onBlockSearch={mockBlockSearch}
        onBlockIdInsert={mockBlockIdInsert}
        onTagSearch={mockTagSearch}
        onTagCreate={mockTagCreate}
      />
      <div className="text-xs text-muted-foreground space-y-2">
        <p>
          <strong>Complete Reference System:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <code className="bg-muted px-1 rounded">@</code> or{' '}
            <code className="bg-muted px-1 rounded">[[</code> — Object reference
          </li>
          <li>
            <code className="bg-muted px-1 rounded">[[Object#</code> — Heading reference
          </li>
          <li>
            <code className="bg-muted px-1 rounded">[[Object#^</code> — Block reference
          </li>
          <li>
            <code className="bg-muted px-1 rounded">[[Object|alias]]</code> — Custom display text
          </li>
          <li>
            <code className="bg-muted px-1 rounded">#</code> — Tags
          </li>
        </ul>
        <p className="mt-2">
          Objects to try: &quot;Getting Started Guide&quot;, &quot;Project Roadmap&quot;
        </p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

AllReferenceTypes.storyName = 'All Reference Types';
