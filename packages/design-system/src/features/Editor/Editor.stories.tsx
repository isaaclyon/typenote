import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from './Editor.js';

export default {
  title: 'Features / Editor',
};

// ============================================================================
// Sample content
// ============================================================================

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
