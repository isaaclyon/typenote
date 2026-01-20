/**
 * Editor - Core stories
 *
 * Basic editor behavior: empty state, controlled mode, read-only, focus, etc.
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';
import {
  basicContent,
  longContent,
  mockRefSearch,
  mockRefCreate,
  mockTagSearch,
  mockTagCreate,
} from './shared.js';

export default {
  title: 'Features / Editor',
};

// ============================================================================
// Basic Stories
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
// Full Featured (All features enabled)
// ============================================================================

export const FullFeatured: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="space-y-4 p-6">
      <Editor
        placeholder="Full-featured editor: / for blocks, @ or [[ for refs, # for tags..."
        enableSlashCommands
        enableRefs
        onRefSearch={mockRefSearch}
        onRefClick={(attrs) => setLastAction(`Navigate to: ${attrs.displayTitle}`)}
        onRefCreate={mockRefCreate}
        enableTags
        onTagSearch={mockTagSearch}
        onTagClick={(attrs) => setLastAction(`Navigate to tag: ${attrs.displayName}`)}
        onTagCreate={mockTagCreate}
      />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>This editor has all features enabled:</p>
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

FullFeatured.storyName = 'Full Featured';
