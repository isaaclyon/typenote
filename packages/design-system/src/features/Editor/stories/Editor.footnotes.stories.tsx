/**
 * Editor - Footnote stories
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';

// ============================================================================
// Mock content
// ============================================================================

const footnoteContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Footnotes in TypeNote' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Footnotes keep supporting details out of the main flow' },
        { type: 'footnoteRef', attrs: { key: 'intro' } },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'They are ordered by first appearance' },
        { type: 'footnoteRef', attrs: { key: 'ordering' } },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Definitions are automatically moved to the end.' }],
    },
    {
      type: 'footnoteDef',
      attrs: { key: 'ordering' },
      content: [{ type: 'text', text: 'The editor maintains ref-first ordering.' }],
    },
    {
      type: 'footnoteDef',
      attrs: { key: 'intro' },
      content: [{ type: 'text', text: 'Footnotes use Obsidian-style [^key] syntax.' }],
    },
  ],
};

const footnoteWarnings: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Missing references show a warning' },
        { type: 'footnoteRef', attrs: { key: 'missing' } },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'footnoteDef',
      attrs: { key: 'dup' },
      content: [{ type: 'text', text: 'First definition for duplicate key.' }],
    },
    {
      type: 'footnoteDef',
      attrs: { key: 'dup' },
      content: [{ type: 'text', text: 'Second definition triggers duplicate warning.' }],
    },
  ],
};

// ============================================================================
// Stories
// ============================================================================

export const BasicFootnotes: Story = () => {
  const [content, setContent] = React.useState(footnoteContent);

  return (
    <div className="space-y-4 p-6">
      <Editor content={content} onChange={setContent} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Footnote definitions are moved to the end with a separator.</p>
        <p>
          Try typing <code className="bg-muted px-1 rounded">[^note]</code> in a paragraph.
        </p>
      </div>
    </div>
  );
};

BasicFootnotes.storyName = 'Basic';

export const Warnings: Story = () => {
  const [content, setContent] = React.useState(footnoteWarnings);

  return (
    <div className="space-y-4 p-6">
      <Editor content={content} onChange={setContent} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Missing definitions highlight inline refs.</p>
        <p>Duplicate definitions display a warning below the block.</p>
      </div>
    </div>
  );
};

Warnings.storyName = 'Missing/Duplicate';

export const InputRules: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type [^key] for refs or [^key]: for definitions..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Ref input: <code className="bg-muted px-1 rounded">[^source]</code>
      </p>
      <p>
        Definition input: <code className="bg-muted px-1 rounded">[^source]:</code> then space.
      </p>
    </div>
  </div>
);

InputRules.storyName = 'Input Rules';
