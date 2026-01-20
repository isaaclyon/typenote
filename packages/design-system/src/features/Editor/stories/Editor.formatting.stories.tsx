/**
 * Editor - Formatting stories
 *
 * Text marks, headings, highlight, and other inline formatting.
 */

import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';

export default {
  title: 'Features / Editor / Formatting',
};

// ============================================================================
// Content Samples
// ============================================================================

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

// ============================================================================
// Stories
// ============================================================================

export const AllMarks: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={allMarksContent} />
    <p className="text-xs text-muted-foreground">
      Demonstrates all supported text formatting: bold, italic, strikethrough, code, and headings.
    </p>
  </div>
);

AllMarks.storyName = 'All Marks';

export const Highlight: Story = () => (
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
