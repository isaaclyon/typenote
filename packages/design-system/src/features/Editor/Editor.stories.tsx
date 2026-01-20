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

import { Editor } from './Editor.js';
import type {
  RefSuggestionItem,
  RefNodeAttributes,
  TagSuggestionItem,
  TagNodeAttributes,
} from './types.js';

// Import editor.css for ref-node styles in RefTypeColors story
import './editor.css';

// Icons for built-in types
const TYPE_ICONS: Record<string, PhosphorIcon> = {
  Page: File,
  DailyNote: CalendarBlank,
  Person: User,
  Event: Calendar,
  Place: MapPin,
  Task: CheckSquare,
};

export default {
  title: 'Features / Editor',
};

// ============================================================================
// Mock data for ref suggestions
// ============================================================================

const mockObjects: RefSuggestionItem[] = [
  {
    objectId: '01J1234567890123456789A',
    objectType: 'Page',
    title: 'Getting Started Guide',
    color: '#6366F1',
  },
  {
    objectId: '01J1234567890123456789B',
    objectType: 'Page',
    title: 'Project Roadmap',
    color: '#6366F1',
  },
  {
    objectId: '01J1234567890123456789C',
    objectType: 'Person',
    title: 'Alice Johnson',
    color: '#EC4899',
  },
  {
    objectId: '01J1234567890123456789D',
    objectType: 'Person',
    title: 'Bob Smith',
    color: '#EC4899',
  },
  {
    objectId: '01J1234567890123456789E',
    objectType: 'DailyNote',
    title: '2026-01-19',
    color: '#F59E0B',
  },
  {
    objectId: '01J1234567890123456789F',
    objectType: 'Event',
    title: 'Team Standup',
    color: '#8B5CF6',
  },
  {
    objectId: '01J1234567890123456789G',
    objectType: 'Place',
    title: 'San Francisco Office',
    color: '#10B981',
  },
  {
    objectId: '01J1234567890123456789H',
    objectType: 'Task',
    title: 'Fix login bug',
    color: '#EF4444',
  },
];

const mockSearch = async (query: string): Promise<RefSuggestionItem[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!query) return mockObjects.slice(0, 5);

  const lower = query.toLowerCase();
  return mockObjects.filter(
    (obj) => obj.title.toLowerCase().includes(lower) || obj.objectType.toLowerCase().includes(lower)
  );
};

const mockCreate = async (title: string): Promise<RefSuggestionItem> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    objectId: `01J${Date.now()}`,
    objectType: 'Page',
    title,
    color: '#6366F1',
  };
};

// ============================================================================
// Sample content
// ============================================================================

const highlightContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Highlighted Text' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Use the ' },
        { type: 'text', marks: [{ type: 'highlight' }], text: '==double equals==' },
        { type: 'text', text: ' syntax to highlight important text.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Highlights work great with other marks: ' },
        {
          type: 'text',
          marks: [{ type: 'highlight' }, { type: 'bold' }],
          text: 'bold + highlight',
        },
        { type: 'text', text: ' or ' },
        {
          type: 'text',
          marks: [{ type: 'highlight' }, { type: 'italic' }],
          text: 'italic + highlight',
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Keyboard shortcut: ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+Shift+H' },
        { type: 'text', text: ' toggles highlight.' },
      ],
    },
  ],
};

const linkContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Links and Autolink' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Standard Markdown links render as: ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://typenote.app', target: '_blank' } }],
          text: 'TypeNote website',
        },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Paste or type a URL to autolink: ' },
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'https://github.com', target: '_blank' } }],
          text: 'https://github.com',
        },
      ],
    },
  ],
};

const basicContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Welcome to TypeNote' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is a ' },
        { type: 'text', marks: [{ type: 'bold' }], text: 'block-based' },
        { type: 'text', text: ' editor built on TipTap.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'It supports ' },
        { type: 'text', marks: [{ type: 'italic' }], text: 'rich text formatting' },
        { type: 'text', text: ' with keyboard shortcuts.' },
      ],
    },
  ],
};

const allMarksContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Text Formatting' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }], text: 'Bold text' },
        { type: 'text', text: ' (Cmd+B)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'italic' }], text: 'Italic text' },
        { type: 'text', text: ' (Cmd+I)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'strike' }], text: 'Strikethrough text' },
        { type: 'text', text: ' (Cmd+Shift+S)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'code' }], text: 'Inline code' },
        { type: 'text', text: ' (Cmd+E)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'Bold and italic' },
        { type: 'text', text: ' combined' },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Headings' }],
    },
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Heading 1' }],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Heading 2' }],
    },
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: 'Heading 3' }],
    },
    {
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: 'Heading 4' }],
    },
    {
      type: 'heading',
      attrs: { level: 5 },
      content: [{ type: 'text', text: 'Heading 5' }],
    },
    {
      type: 'heading',
      attrs: { level: 6 },
      content: [{ type: 'text', text: 'Heading 6' }],
    },
  ],
};

const longContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Long Document' }],
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      type: 'paragraph' as const,
      content: [
        {
          type: 'text' as const,
          text: `Paragraph ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        },
      ],
    })),
  ],
};

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Start writing..." />
    <p className="text-xs text-muted-foreground">
      Empty editor with placeholder. Try typing, or use Markdown shortcuts like # for headings.
    </p>
  </div>
);

export const WithContent: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={basicContent} />
    <p className="text-xs text-muted-foreground">
      Editor with pre-populated content. Includes heading and formatted paragraphs.
    </p>
  </div>
);

export const AllMarks: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={allMarksContent} />
    <p className="text-xs text-muted-foreground">
      Demonstrates all supported text formatting: bold, italic, strikethrough, code, and headings.
    </p>
  </div>
);

export const WithLinks: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={linkContent} />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Markdown links render as clickable anchors.</p>
      <p>Try typing or pasting a URL to see autolink in action.</p>
    </div>
  </div>
);

export const WithHighlight: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={highlightContent} />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Type <code className="bg-muted px-1 rounded">==text==</code> to highlight text.
      </p>
      <p>
        Use <code className="bg-muted px-1 rounded">Cmd+Shift+H</code> to toggle highlight on
        selected text.
      </p>
    </div>
  </div>
);

export const Controlled: Story = () => {
  const [content, setContent] = React.useState<JSONContent>(basicContent);
  const [changeCount, setChangeCount] = React.useState(0);

  const handleChange = (newContent: JSONContent) => {
    setContent(newContent);
    setChangeCount((c) => c + 1);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={content} onChange={handleChange} />
      <div className="flex gap-4">
        <p className="text-xs text-muted-foreground">Changes: {changeCount}</p>
        <button
          onClick={() => {
            setContent(basicContent);
            setChangeCount(0);
          }}
          className="text-xs text-accent-600 hover:underline"
        >
          Reset content
        </button>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground">View JSON</summary>
        <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]">
          {JSON.stringify(content, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export const ReadOnly: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={basicContent} readOnly />
    <p className="text-xs text-muted-foreground">
      Read-only mode. Content is displayed but cannot be edited.
    </p>
  </div>
);

export const Focused: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="This editor auto-focuses on mount..." autoFocus />
    <p className="text-xs text-muted-foreground">
      Editor with autoFocus enabled. The cursor should be active when the story loads.
    </p>
  </div>
);

export const CustomPlaceholder: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="What's on your mind today?" />
    <p className="text-xs text-muted-foreground">Editor with custom placeholder text.</p>
  </div>
);

export const LongDocument: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={longContent} className="max-h-[300px] overflow-y-auto" />
    <p className="text-xs text-muted-foreground">
      Long document with scrolling. The editor container has a max-height and scrolls.
    </p>
  </div>
);

export const MultipleEditors: Story = () => (
  <div className="space-y-6 p-6">
    <div>
      <p className="mb-2 text-sm font-medium">Note 1</p>
      <Editor placeholder="First note..." />
    </div>
    <div>
      <p className="mb-2 text-sm font-medium">Note 2</p>
      <Editor placeholder="Second note..." />
    </div>
    <p className="text-xs text-muted-foreground">Multiple independent editor instances.</p>
  </div>
);

export const InAppContext: Story = () => {
  const [content, setContent] = React.useState<JSONContent>(basicContent);

  return (
    <div className="p-6">
      <div className="flex h-[500px] rounded-md border border-border overflow-hidden">
        {/* Simulated Sidebar */}
        <div className="w-[200px] shrink-0 border-r border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Sidebar</p>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          {/* Simulated HeaderBar */}
          <div className="h-10 shrink-0 border-b border-border bg-background px-4 flex items-center">
            <p className="text-xs text-muted-foreground">HeaderBar</p>
          </div>

          {/* Editor fills the content area - click anywhere to focus */}
          <Editor
            content={content}
            onChange={setContent}
            placeholder="Start writing your note..."
            className="flex-1 border-0 rounded-none"
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Click anywhere in the editor area (including margins) to focus. Content is centered at 650px
        max-width.
      </p>
    </div>
  );
};

// ============================================================================
// Phase 2: Reference Support Stories
// ============================================================================

export const WithRefs: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  const handleRefClick = (attrs: RefNodeAttributes) => {
    setLastAction(`Clicked: ${attrs.displayTitle} (${attrs.objectType})`);
  };

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Type @ or [[ to insert a reference..."
        enableRefs
        onRefSearch={mockSearch}
        onRefClick={handleRefClick}
        onRefCreate={mockCreate}
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

export const WithExistingRefs: Story = () => {
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
        onRefSearch={mockSearch}
        onRefClick={(attrs) => setLastAction(`Navigate to: ${attrs.displayTitle}`)}
        onRefCreate={mockCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Editor with pre-existing references. Click any reference to navigate.</p>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

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

// ============================================================================
// Phase 2b: Slash Command Stories
// ============================================================================

export const WithSlashCommands: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type / at the start of a line to insert blocks..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Type <code className="bg-muted px-1 rounded">/</code> at the start of a line to open the
        block menu.
      </p>
      <p>Try: /heading, /bullet, /quote, /code, /divider</p>
    </div>
  </div>
);

export const SlashCommandFiltering: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /h to filter to headings..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>The slash menu filters as you type:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/h</code> — shows headings
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/list</code> — shows lists
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/code</code> — shows code block
        </li>
      </ul>
    </div>
  </div>
);

export const SlashCommandDisabled: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Slash commands are disabled..." enableSlashCommands={false} />
    <p className="text-xs text-muted-foreground">
      Editor with <code className="bg-muted px-1 rounded">enableSlashCommands=false</code>. Typing /
      will not open the menu.
    </p>
  </div>
);

export const FullFeaturedEditor: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Full-featured editor: / for blocks, @ or [[ for refs, # for tags..."
        enableSlashCommands
        enableRefs
        onRefSearch={mockSearch}
        onRefClick={(attrs) => setLastAction(`Navigate to: ${attrs.displayTitle}`)}
        onRefCreate={mockCreate}
        enableTags
        onTagSearch={mockTagSearch}
        onTagClick={(attrs) => setLastAction(`Navigate to tag: ${attrs.displayName}`)}
        onTagCreate={mockTagCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>This editor has all Phase 2 features enabled:</p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>
            <code className="bg-muted px-1 rounded">/</code> — Slash commands for block types
          </li>
          <li>
            <code className="bg-muted px-1 rounded">@</code> or{' '}
            <code className="bg-muted px-1 rounded">[[</code> — Reference suggestions
          </li>
          <li>
            <code className="bg-muted px-1 rounded">#</code> — Tag suggestions
          </li>
        </ul>
        {lastAction && <p className="text-accent-600 mt-2">{lastAction}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// Phase 2b: Tag Support Stories
// ============================================================================

const mockTags: TagSuggestionItem[] = [
  { tagId: '01TAG00000000000000001', name: 'important', color: '#EF4444' },
  { tagId: '01TAG00000000000000002', name: 'idea', color: '#8B5CF6' },
  { tagId: '01TAG00000000000000003', name: 'todo', color: '#F59E0B' },
  { tagId: '01TAG00000000000000004', name: 'work', color: '#6366F1' },
  { tagId: '01TAG00000000000000005', name: 'personal', color: '#10B981' },
  { tagId: '01TAG00000000000000006', name: 'meeting', color: '#EC4899' },
  { tagId: '01TAG00000000000000007', name: 'research', color: '#06B6D4' },
];

const mockTagSearch = async (query: string): Promise<TagSuggestionItem[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (!query) return mockTags.slice(0, 5);

  const lower = query.toLowerCase();
  return mockTags.filter((tag) => tag.name.toLowerCase().includes(lower));
};

const mockTagCreate = async (name: string): Promise<TagSuggestionItem> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    tagId: `01TAG${Date.now()}`,
    name: name.toLowerCase().replace(/\s+/g, '-'),
    color: '#71717A',
  };
};

export const WithTags: Story = () => {
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

export const WithExistingTags: Story = () => {
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

// ============================================================================
// Task List Stories
// ============================================================================

export const WithTaskList: Story = () => {
  const contentWithTasks: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Project Tasks' }],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Set up project repository' }],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Create initial design mockups' }],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Implement authentication flow' }],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Write unit tests' }],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Click checkboxes to toggle completion!' }],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithTasks} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Task lists with interactive checkboxes. Completed items show strikethrough text.</p>
        <p>
          Use <code className="bg-muted px-1 rounded">/task</code> or{' '}
          <code className="bg-muted px-1 rounded">/todo</code> to insert a new task list.
        </p>
      </div>
    </div>
  );
};

export const TaskListViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /task or /todo to create a task list..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert task lists using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/task</code> — Task List
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/todo</code> — Task List
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/checkbox</code> — Task List
        </li>
      </ul>
      <p className="mt-2">Press Enter to create new items, Backspace on empty to exit.</p>
    </div>
  </div>
);

export const NestedTaskList: Story = () => {
  const contentWithNestedTasks: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Sprint Planning' }],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Backend API' }],
              },
              {
                type: 'taskList',
                content: [
                  {
                    type: 'taskItem',
                    attrs: { checked: true },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'User endpoints' }],
                      },
                    ],
                  },
                  {
                    type: 'taskItem',
                    attrs: { checked: false },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Auth middleware' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Frontend UI' }],
              },
              {
                type: 'taskList',
                content: [
                  {
                    type: 'taskItem',
                    attrs: { checked: true },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Component library' }],
                      },
                    ],
                  },
                  {
                    type: 'taskItem',
                    attrs: { checked: false },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Dashboard page' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithNestedTasks} />
      <p className="text-xs text-muted-foreground">
        Nested task lists for hierarchical todo tracking. Use Tab to indent, Shift+Tab to outdent.
      </p>
    </div>
  );
};

// ============================================================================
// Code Block Stories
// ============================================================================

export const WithCodeBlock: Story = () => {
  const contentWithCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Code Example' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Here is a TypeScript function:' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'The code above demonstrates basic TypeScript syntax.' }],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithCode} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Code block with Shiki syntax highlighting.</p>
        <p>Click the language badge to change the language, or the Copy button to copy code.</p>
      </div>
    </div>
  );
};

export const CodeBlockViaMarkdown: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type ```typescript and press Enter to create a code block..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Create code blocks using Markdown syntax:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">```typescript</code> + Enter
        </li>
        <li>
          <code className="bg-muted px-1 rounded">```python</code> + Enter
        </li>
        <li>
          <code className="bg-muted px-1 rounded">```</code> + Enter (plain text)
        </li>
      </ul>
    </div>
  </div>
);

export const CodeBlockViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /code to insert a code block..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Use <code className="bg-muted px-1 rounded">/code</code> slash command to insert a code
        block.
      </p>
      <p>Then use the language dropdown to select the syntax.</p>
    </div>
  </div>
);

export const CodeBlockLanguages: Story = () => {
  const contentWithMultipleLanguages: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Multi-Language Support' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'TypeScript' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [];`,
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Python' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'python' },
        content: [
          {
            type: 'text',
            text: `def fibonacci(n: int) -> list[int]:
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]`,
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Rust' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'rust' },
        content: [
          {
            type: 'text',
            text: `fn main() {
    let greeting = "Hello, Rust!";
    println!("{}", greeting);
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`,
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'JSON' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'json' },
        content: [
          {
            type: 'text',
            text: `{
  "name": "typenote",
  "version": "1.0.0",
  "dependencies": {
    "shiki": "^1.0.0",
    "tiptap": "^3.0.0"
  }
}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithMultipleLanguages} />
      <p className="text-xs text-muted-foreground">
        Shiki supports 25+ languages. Click the language badge to change syntax highlighting.
      </p>
    </div>
  );
};

export const CodeBlockCopyButton: Story = () => {
  const contentWithCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Click the Copy button to copy the code:' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'bash' },
        content: [
          {
            type: 'text',
            text: `npm install @typenote/design-system
npm run dev`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithCode} />
      <p className="text-xs text-muted-foreground">
        The Copy button shows a checkmark and &quot;Copied&quot; feedback for 2 seconds.
      </p>
    </div>
  );
};

export const CodeBlockLongLines: Story = () => {
  const contentWithLongCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Long lines scroll horizontally:' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `// This is a very long line that should scroll horizontally rather than wrap, demonstrating the overflow behavior of the code block component
const veryLongVariableName = "This string is intentionally very long to test horizontal scrolling in code blocks when the content exceeds the container width";

function anotherExampleFunction(param1: string, param2: number, param3: boolean, param4: object, param5: string[]): { result: string; count: number } {
  return { result: param1, count: param2 };
}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithLongCode} />
      <p className="text-xs text-muted-foreground">
        Long lines scroll horizontally. The code block maintains its max-width within the editor.
      </p>
    </div>
  );
};

export const CodeBlockPlainText: Story = () => {
  const contentWithPlainCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Code block without language (plain text):' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: null },
        content: [
          {
            type: 'text',
            text: `Some plain text content
without any syntax highlighting.

Just monospace formatting.`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithPlainCode} />
      <p className="text-xs text-muted-foreground">
        When no language is set, the code displays as plain text without highlighting.
      </p>
    </div>
  );
};

// ============================================================================
// Callout Stories
// ============================================================================

export const WithCallouts: Story = () => {
  const contentWithCallouts: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Callout Blocks' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Callouts help highlight important information:' }],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'info' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is an ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'info callout' },
              {
                type: 'text',
                text: '. Use it to provide additional context or helpful notes to readers.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'warning' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'warning callout' },
              {
                type: 'text',
                text: '. Use it to caution readers about potential issues or important considerations.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'tip' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'tip callout' },
              {
                type: 'text',
                text: '. Use it to share best practices, shortcuts, or helpful hints.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'error' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is an ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'error callout' },
              {
                type: 'text',
                text: '. Use it to highlight critical warnings, errors, or things to avoid.',
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithCallouts} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Four callout types with distinct colors: Info (blue), Warning (amber), Tip (green), Error
          (red).
        </p>
        <p>Click the icon/label to change the callout type via dropdown menu.</p>
      </div>
    </div>
  );
};

export const CalloutViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /info, /warning, /tip, or /error to insert a callout..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert callouts using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/info</code> — Info callout (blue)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/warning</code> — Warning callout (amber)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/tip</code> — Tip callout (green)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/error</code> — Error callout (red)
        </li>
      </ul>
      <p className="mt-2">
        Also searchable by: <code className="bg-muted px-1 rounded">note</code>,{' '}
        <code className="bg-muted px-1 rounded">caution</code>,{' '}
        <code className="bg-muted px-1 rounded">hint</code>,{' '}
        <code className="bg-muted px-1 rounded">danger</code>
      </p>
    </div>
  </div>
);

export const CalloutWithNestedContent: Story = () => {
  const contentWithNestedCallout: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Rich Callout Content' }],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'tip' },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Pro Tip: Keyboard Shortcuts' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Use these shortcuts to work faster:' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+B' },
                      { type: 'text', text: ' — Bold text' },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+I' },
                      { type: 'text', text: ' — Italic text' },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+K' },
                      { type: 'text', text: ' — Insert link' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'warning' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Breaking Change in v2.0' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The API endpoint has changed. Update your code:',
              },
            ],
          },
          {
            type: 'codeBlock',
            attrs: { language: 'typescript' },
            content: [
              {
                type: 'text',
                text: `// Old (v1.x)
const response = await api.getUser(id);

// New (v2.0)
const response = await api.users.get(id);`,
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithNestedCallout} />
      <p className="text-xs text-muted-foreground">
        Callouts support full nested content: headings, lists, code blocks, and more.
      </p>
    </div>
  );
};

export const CalloutTypeChange: Story = () => {
  const simpleCallout: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Click the icon to change the callout type:' }],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'info' },
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'This callout can be changed to any type. Click the "Info" label with the dropdown arrow to see the options.',
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={simpleCallout} />
      <p className="text-xs text-muted-foreground">
        Use the dropdown to switch between Info, Warning, Tip, and Error callout types.
      </p>
    </div>
  );
};

// ============================================================================
// Table Stories
// ============================================================================

export const WithTable: Story = () => {
  const contentWithTable: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Project Timeline' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Here is our quarterly roadmap:' }],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quarter' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Status' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Q1' }] }],
              },
              {
                type: 'tableCell',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Design System' }] },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Complete' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Q2' }] }],
              },
              {
                type: 'tableCell',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Editor Features' }] },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'In Progress' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Q3' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Desktop App' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Planned' }] }],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Click cells to edit. Use Tab to navigate between cells.' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithTable} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Table with header row. Tab/Shift+Tab navigates between cells.</p>
        <p>Drag column borders to resize. Header row has distinct styling.</p>
      </div>
    </div>
  );
};

export const TableViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /table to insert a table..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert tables using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/table</code> — Insert 3x3 table with header row
        </li>
      </ul>
      <p className="mt-2">
        Also searchable by: <code className="bg-muted px-1 rounded">grid</code>
      </p>
    </div>
  </div>
);

export const TableWithRichContent: Story = () => {
  const tableWithRichContent: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Feature Comparison' }],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Feature' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Description' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Tables' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Supports ' },
                      { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
                      { type: 'text', text: ', ' },
                      { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
                      { type: 'text', text: ', and ' },
                      { type: 'text', marks: [{ type: 'code' }], text: 'code' },
                      { type: 'text', text: ' formatting.' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Cell Content' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Cells can contain:' }],
                  },
                  {
                    type: 'bulletList',
                    content: [
                      {
                        type: 'listItem',
                        content: [
                          { type: 'paragraph', content: [{ type: 'text', text: 'Lists' }] },
                        ],
                      },
                      {
                        type: 'listItem',
                        content: [
                          {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Multiple paragraphs' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={tableWithRichContent} />
      <p className="text-xs text-muted-foreground">
        Table cells support rich content including formatted text, lists, and multiple paragraphs.
      </p>
    </div>
  );
};

export const EmptyTable: Story = () => {
  const emptyTable: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'An empty table for you to fill in:' }],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph' }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph' }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph' }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
          {
            type: 'tableRow',
            content: [
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
              { type: 'tableCell', content: [{ type: 'paragraph' }] },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Click any cell to start typing. Use Tab to move to the next cell.',
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={emptyTable} />
      <p className="text-xs text-muted-foreground">
        Empty 3x3 table. Click any cell and start typing.
      </p>
    </div>
  );
};

export const TableWithToolbar: Story = () => {
  const tableWithData: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Table Manipulation' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Click inside any table cell to see the floating toolbar above the table.',
          },
        ],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Status' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Developer' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bob' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Designer' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={tableWithData} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Floating toolbar</strong> appears when cursor is in a table:
        </p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>
            <strong>Rows icon</strong> — Insert row above/below, delete row
          </li>
          <li>
            <strong>Columns icon</strong> — Insert column left/right, delete column
          </li>
          <li>
            <strong>Trash icon</strong> — Delete entire table
          </li>
        </ul>
      </div>
    </div>
  );
};

TableWithToolbar.storyName = 'Table With Toolbar';
