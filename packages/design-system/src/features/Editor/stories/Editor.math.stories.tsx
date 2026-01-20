/**
 * Editor Stories - Math Support
 *
 * Demonstrates inline math ($...$) and block math ($$...$$) with KaTeX rendering.
 */

import * as React from 'react';
import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';
import { mockRefSearch, mockRefCreate, mockTagSearch, mockTagCreate } from './shared.js';

// ============================================================================
// Sample content with math
// ============================================================================

const inlineMathContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Inline Math Examples' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The quadratic formula is ' },
        {
          type: 'inlineMath',
          attrs: { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
        },
        { type: 'text', text: ' where ' },
        { type: 'inlineMath', attrs: { latex: 'a \\neq 0' } },
        { type: 'text', text: '.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: "Einstein's famous equation " },
        { type: 'inlineMath', attrs: { latex: 'E = mc^2' } },
        { type: 'text', text: ' relates energy and mass.' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'The Pythagorean theorem: ' },
        { type: 'inlineMath', attrs: { latex: 'a^2 + b^2 = c^2' } },
      ],
    },
  ],
};

const mathBlockContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Math Block Examples' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'The integral of a function:' }],
    },
    {
      type: 'mathBlock',
      attrs: { latex: '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}' },
      content: [{ type: 'text', text: '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}' }],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'A matrix equation:' }],
    },
    {
      type: 'mathBlock',
      attrs: {
        latex:
          '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}',
      },
      content: [
        {
          type: 'text',
          text: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}',
        },
      ],
    },
  ],
};

const mathErrorContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Error Handling' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Invalid LaTeX shows error: ' },
        { type: 'inlineMath', attrs: { latex: '\\frac{1}{' } },
        { type: 'text', text: ' (missing closing brace)' },
      ],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Unknown command: ' },
        { type: 'inlineMath', attrs: { latex: '\\unknowncommand' } },
      ],
    },
  ],
};

const emptyMathContent: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Try Math Input' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Type ' },
        { type: 'text', marks: [{ type: 'code' }], text: '$x^2$' },
        { type: 'text', text: ' for inline math, or use ' },
        { type: 'text', marks: [{ type: 'code' }], text: '/math' },
        { type: 'text', text: ' for a block.' },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Start typing here...' }],
    },
  ],
};

// ============================================================================
// Stories
// ============================================================================

/**
 * Inline math rendered with KaTeX.
 * Click on any formula to edit it.
 */
export const InlineMath: Story = () => {
  const [content, setContent] = React.useState(inlineMathContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Type math with $...$"
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
 * Block math for display equations.
 * Use /math slash command or $$ on a new line.
 */
export const MathBlocks: Story = () => {
  const [content, setContent] = React.useState(mathBlockContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Type $$ for math block"
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
 * Error handling for invalid LaTeX.
 * KaTeX shows helpful error messages inline.
 */
export const ErrorHandling: Story = () => {
  const [content, setContent] = React.useState(mathErrorContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Try invalid LaTeX"
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
 * Empty editor to try math input.
 * Type $formula$ for inline or /math for blocks.
 */
export const TryItOut: Story = () => {
  const [content, setContent] = React.useState(emptyMathContent);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Editor
        content={content}
        onChange={setContent}
        placeholder="Type $x^2$ for inline math..."
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
  title: 'Features/Editor/Math',
};
