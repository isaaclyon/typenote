/**
 * Editor Stories - Block IDs
 *
 * Demonstrates block ID functionality (^block-id syntax) for referencing specific blocks.
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';
import { mockRefSearch, mockRefCreate, mockTagSearch, mockTagCreate } from './shared.js';

// ============================================================================
// Sample content with block IDs
// ============================================================================

const basicBlockIdContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Block IDs' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This paragraph has a block ID. ' },
        { type: 'blockIdNode', attrs: { id: 'intro' } },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'You can reference this block using ' },
        { type: 'text', marks: [{ type: 'code' }], text: '[[Page#^intro]]' },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Click on a block ID to copy its reference to clipboard.' }],
    },
  ],
};

const multipleBlocksContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Multiple Block IDs' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'First important point. ' },
        { type: 'blockIdNode', attrs: { id: 'point-1' } },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Second important point with more detail. ' },
        { type: 'blockIdNode', attrs: { id: 'point-2' } },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Final conclusion drawn from the above. ' },
        { type: 'blockIdNode', attrs: { id: 'conclusion' } },
      ],
    },
    {
      type: 'blockquote',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'A memorable quote worth referencing. ' },
            { type: 'blockIdNode', attrs: { id: 'quote-1' } },
          ],
        },
      ],
    },
  ],
};

const tryInputRuleContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Try the Input Rule' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Type ' },
        { type: 'text', marks: [{ type: 'code' }], text: ' ^my-id ' },
        { type: 'text', text: ' (with spaces) at the end of any line to create a block ID.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Valid IDs: ' },
        { type: 'text', marks: [{ type: 'code' }], text: '^my-block' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'code' }], text: '^section_1' },
        { type: 'text', text: ', ' },
        { type: 'text', marks: [{ type: 'code' }], text: '^_private' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: "Invalid IDs (won't convert): " },
        { type: 'text', marks: [{ type: 'code' }], text: '^123' },
        { type: 'text', text: ' (starts with number), ' },
        { type: 'text', marks: [{ type: 'code' }], text: '^hello world' },
        { type: 'text', text: ' (contains space)' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Try it here: ' }],
    },
  ],
};

const copyReferenceContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Copy References' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Click any block ID below to copy its reference.' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This is the definition of a key term. ' },
        { type: 'blockIdNode', attrs: { id: 'definition' } },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This contains an important formula. ' },
        { type: 'blockIdNode', attrs: { id: 'formula' } },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The copied reference format: ' },
        { type: 'text', marks: [{ type: 'code' }], text: '[[Untitled#^formula]]' },
      ],
    },
  ],
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Basic block ID at the end of a paragraph.
 * Click to copy the reference.
 */
export const Basic: Story = () => {
  const [content, setContent] = React.useState(basicBlockIdContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Add a block ID with ^id"
        enableRefs={true}
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onTagSearch={mockTagSearch}
        onTagCreate={mockTagCreate}
      />
    </div>
  );
};

/**
 * Multiple blocks with different IDs.
 * Each can be referenced independently.
 */
export const MultipleBlocks: Story = () => {
  const [content, setContent] = React.useState(multipleBlocksContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Multiple block IDs"
        enableRefs={true}
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onTagSearch={mockTagSearch}
        onTagCreate={mockTagCreate}
      />
    </div>
  );
};

/**
 * Try the input rule: type ` ^id ` to create a block ID.
 * The ID must be valid (start with letter/underscore).
 */
export const InputRule: Story = () => {
  const [content, setContent] = React.useState(tryInputRuleContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Type ^my-id to create a block ID"
        enableRefs={true}
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onTagSearch={mockTagSearch}
        onTagCreate={mockTagCreate}
      />
    </div>
  );
};

/**
 * Click to copy reference demo.
 * Shows the "copied" feedback animation.
 */
export const CopyReference: Story = () => {
  const [content, setContent] = React.useState(copyReferenceContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Click block IDs to copy"
        enableRefs={true}
        onRefSearch={mockRefSearch}
        onRefCreate={mockRefCreate}
        onTagSearch={mockTagSearch}
        onTagCreate={mockTagCreate}
      />
    </div>
  );
};

export default {
  title: 'Features/Editor/BlockId',
};
