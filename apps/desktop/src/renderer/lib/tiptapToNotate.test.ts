/**
 * TipTap to NotateDoc Converter Tests
 *
 * TDD tests for converting TipTap's ProseMirror JSON back to NotateDoc format.
 */

import { describe, expect, test } from 'vitest';
import type { DocumentBlock } from '@typenote/api';
import { convertBlockToNotate, convertInlineToNotate, generateBlockOps } from './tiptapToNotate.js';

describe('convertInlineToNotate', () => {
  // Cycle 1: Basic text
  test('converts plain text node', () => {
    const tiptap = [{ type: 'text', text: 'hello' }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'text', text: 'hello' }]);
  });

  // Cycle 2: Text with marks
  test('converts text with bold mark to strong', () => {
    const tiptap = [{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'text', text: 'bold', marks: ['strong'] }]);
  });

  test('converts text with italic mark to em', () => {
    const tiptap = [{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'text', text: 'italic', marks: ['em'] }]);
  });

  test('converts text with multiple marks', () => {
    const tiptap = [
      { type: 'text', text: 'styled', marks: [{ type: 'bold' }, { type: 'italic' }] },
    ];
    expect(convertInlineToNotate(tiptap)).toEqual([
      { t: 'text', text: 'styled', marks: ['strong', 'em'] },
    ]);
  });

  // Cycle 3: Hard break
  test('converts hardBreak to hard_break', () => {
    const tiptap = [{ type: 'hardBreak' }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'hard_break' }]);
  });

  // Cycle 4: Ref nodes
  test('preserves ref node attributes', () => {
    const target = { kind: 'object' as const, objectId: '01ABC' };
    const tiptap = [{ type: 'ref', attrs: { mode: 'link', target, alias: 'My Doc' } }];
    expect(convertInlineToNotate(tiptap)).toEqual([
      { t: 'ref', mode: 'link', target, alias: 'My Doc' },
    ]);
  });

  test('preserves ref node without alias', () => {
    const target = { kind: 'block' as const, objectId: '01ABC', blockId: '01DEF' };
    const tiptap = [{ type: 'ref', attrs: { mode: 'embed', target } }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'ref', mode: 'embed', target }]);
  });

  // Cycle 5: Tag nodes
  test('preserves tag node value', () => {
    const tiptap = [{ type: 'tag', attrs: { value: 'project' } }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'tag', value: 'project' }]);
  });

  // Cycle 6: Math inline nodes
  test('preserves math_inline node', () => {
    const tiptap = [{ type: 'mathInline', attrs: { latex: 'E=mc^2' } }];
    expect(convertInlineToNotate(tiptap)).toEqual([{ t: 'math_inline', latex: 'E=mc^2' }]);
  });

  // Cycle 7: Link mark conversion
  test('converts link mark to link node wrapping children', () => {
    const tiptap = [
      {
        type: 'text',
        text: 'click here',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
      },
    ];
    expect(convertInlineToNotate(tiptap)).toEqual([
      { t: 'link', href: 'https://example.com', children: [{ t: 'text', text: 'click here' }] },
    ]);
  });

  test('converts link with styled text preserves inner marks', () => {
    const tiptap = [
      {
        type: 'text',
        text: 'bold link',
        marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://example.com' } }],
      },
    ];
    expect(convertInlineToNotate(tiptap)).toEqual([
      {
        t: 'link',
        href: 'https://example.com',
        children: [{ t: 'text', text: 'bold link', marks: ['strong'] }],
      },
    ]);
  });

  test('groups consecutive text nodes with same link into one link node', () => {
    const tiptap = [
      {
        type: 'text',
        text: 'click ',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
      },
      {
        type: 'text',
        text: 'here',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
      },
    ];
    expect(convertInlineToNotate(tiptap)).toEqual([
      {
        t: 'link',
        href: 'https://example.com',
        children: [
          { t: 'text', text: 'click ' },
          { t: 'text', text: 'here' },
        ],
      },
    ]);
  });
});

describe('convertBlockToNotate', () => {
  // Cycle 1: Empty paragraph
  test('converts empty paragraph', () => {
    const tiptap = { type: 'paragraph' };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'paragraph',
      content: { inline: [] },
    });
  });

  // Cycle 2: Paragraph with text
  test('converts paragraph with text', () => {
    const tiptap = { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'paragraph',
      content: { inline: [{ t: 'text', text: 'Hello' }] },
    });
  });

  // Cycle 3: Heading with level
  test('converts heading with level', () => {
    const tiptap = {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Title' }],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'heading',
      content: { level: 2, inline: [{ t: 'text', text: 'Title' }] },
    });
  });

  // Cycle 4: Code block
  test('converts codeBlock with language', () => {
    const tiptap = {
      type: 'codeBlock',
      attrs: { language: 'typescript' },
      content: [{ type: 'text', text: 'const x = 1;' }],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'code_block',
      content: { language: 'typescript', code: 'const x = 1;' },
    });
  });

  test('converts codeBlock with null language to undefined', () => {
    const tiptap = {
      type: 'codeBlock',
      attrs: { language: null },
      content: [{ type: 'text', text: 'plain code' }],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'code_block',
      content: { code: 'plain code' },
    });
  });

  // Cycle 5: Bullet list
  test('converts bulletList with items', () => {
    const tiptap = {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
        },
      ],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'list',
      content: { kind: 'bullet' },
      children: [
        {
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Item 1' }] },
        },
      ],
    });
  });

  // Cycle 6: Ordered list with start
  test('converts orderedList with start attribute', () => {
    const tiptap = {
      type: 'orderedList',
      attrs: { start: 5 },
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 5' }] }],
        },
      ],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'list',
      content: { kind: 'ordered', start: 5 },
      children: [
        {
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Item 5' }] },
        },
      ],
    });
  });

  // Cycle 7: Task list with checked state
  test('converts taskList with checked state', () => {
    const tiptap = {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Done task' }] }],
        },
      ],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'list',
      content: { kind: 'task' },
      children: [
        {
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Done task' }], checked: true },
        },
      ],
    });
  });

  // Cycle 8: Blockquote container
  test('converts blockquote with nested paragraphs', () => {
    const tiptap = {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Quote line 1' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Quote line 2' }] },
      ],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'blockquote',
      content: {},
      children: [
        { blockType: 'paragraph', content: { inline: [{ t: 'text', text: 'Quote line 1' }] } },
        { blockType: 'paragraph', content: { inline: [{ t: 'text', text: 'Quote line 2' }] } },
      ],
    });
  });

  // Cycle 9: Horizontal rule
  test('converts horizontalRule to thematic_break', () => {
    const tiptap = { type: 'horizontalRule' };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'thematic_break',
      content: {},
    });
  });

  // Cycle 10: Nested list in list item
  test('converts nested list inside list item', () => {
    const tiptap = {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Parent' }] },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Child' }] }],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(convertBlockToNotate(tiptap)).toEqual({
      blockType: 'list',
      content: { kind: 'bullet' },
      children: [
        {
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Parent' }] },
          children: [
            {
              blockType: 'list',
              content: { kind: 'bullet' },
              children: [
                {
                  blockType: 'list_item',
                  content: { inline: [{ t: 'text', text: 'Child' }] },
                },
              ],
            },
          ],
        },
      ],
    });
  });
});

describe('generateBlockOps', () => {
  // Cycle 1: No changes returns empty ops
  test('returns empty ops when content unchanged', () => {
    const oldBlocks: DocumentBlock[] = [
      {
        id: 'blk1',
        parentBlockId: null,
        orderKey: 'a',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Hello' }] },
        meta: null,
        children: [],
      },
    ];
    const newTiptap = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    };
    expect(generateBlockOps(oldBlocks, newTiptap, 'obj1')).toEqual([]);
  });

  // Cycle 2: Update when text changes
  test('generates update op when paragraph text changes', () => {
    const oldBlocks: DocumentBlock[] = [
      {
        id: 'blk1',
        parentBlockId: null,
        orderKey: 'a',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'old' }] },
        meta: null,
        children: [],
      },
    ];
    const newTiptap = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'new' }] }],
    };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      op: 'block.update',
      blockId: 'blk1',
      patch: { content: { inline: [{ t: 'text', text: 'new' }] } },
    });
  });

  // Cycle 3: Insert when block added at end
  test('generates insert op for new paragraph at end', () => {
    const oldBlocks: DocumentBlock[] = [
      {
        id: 'blk1',
        parentBlockId: null,
        orderKey: 'a',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'First' }] },
        meta: null,
        children: [],
      },
    ];
    const newTiptap = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
      ],
    };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      op: 'block.insert',
      parentBlockId: null,
      blockType: 'paragraph',
      content: { inline: [{ t: 'text', text: 'Second' }] },
      place: { where: 'end' },
    });
    // Verify valid ULID (26 characters)
    expect((ops[0] as { blockId: string }).blockId).toHaveLength(26);
  });

  // Cycle 4: Delete when block removed
  test('generates delete op when paragraph removed', () => {
    const oldBlocks: DocumentBlock[] = [
      {
        id: 'blk1',
        parentBlockId: null,
        orderKey: 'a',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Keep' }] },
        meta: null,
        children: [],
      },
      {
        id: 'blk2',
        parentBlockId: null,
        orderKey: 'b',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Remove' }] },
        meta: null,
        children: [],
      },
    ];
    const newTiptap = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Keep' }] }],
    };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      op: 'block.delete',
      blockId: 'blk2',
    });
  });

  // Cycle 5: Multiple ops in one diff
  test('generates multiple ops for complex changes', () => {
    // Old: [para1, para2]
    // New: [para1-modified, para3-new]
    // Expected: update para1, delete para2, insert para3
    const oldBlocks: DocumentBlock[] = [
      {
        id: 'blk1',
        parentBlockId: null,
        orderKey: 'a',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Original' }] },
        meta: null,
        children: [],
      },
      {
        id: 'blk2',
        parentBlockId: null,
        orderKey: 'b',
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'To be deleted' }] },
        meta: null,
        children: [],
      },
    ];
    const newTiptap = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Modified' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'New paragraph' }] },
      ],
    };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    expect(ops).toHaveLength(2);
    // First op: update blk1
    expect(ops[0]).toMatchObject({
      op: 'block.update',
      blockId: 'blk1',
      patch: { content: { inline: [{ t: 'text', text: 'Modified' }] } },
    });
    // Second op: update blk2 (position-based - content at position 1 changed)
    expect(ops[1]).toMatchObject({
      op: 'block.update',
      blockId: 'blk2',
      patch: { content: { inline: [{ t: 'text', text: 'New paragraph' }] } },
    });
  });

  // Cycle 6: Handle empty document
  test('handles empty document with single empty paragraph', () => {
    const oldBlocks: DocumentBlock[] = [];
    const newTiptap = { type: 'doc', content: [{ type: 'paragraph' }] };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      op: 'block.insert',
      blockType: 'paragraph',
      content: { inline: [] },
    });
  });

  // Cycle 7: Handle list block with children
  test('handles list block with children - insert new list generates multiple ops', () => {
    // Old: empty
    // New: bulletList with 2 items
    // Expected: insert list, insert item1 (as child of list), insert item2
    const oldBlocks: DocumentBlock[] = [];
    const newTiptap = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] }],
            },
          ],
        },
      ],
    };
    const ops = generateBlockOps(oldBlocks, newTiptap, 'obj1');
    // Should generate 3 ops: list + 2 list items
    expect(ops).toHaveLength(3);

    // First op: insert the list container
    expect(ops[0]).toMatchObject({
      op: 'block.insert',
      blockType: 'list',
      content: { kind: 'bullet' },
      parentBlockId: null,
    });
    const listBlockId = (ops[0] as { blockId: string }).blockId;
    expect(listBlockId).toHaveLength(26);

    // Second op: insert first list item as child of list
    expect(ops[1]).toMatchObject({
      op: 'block.insert',
      blockType: 'list_item',
      content: { inline: [{ t: 'text', text: 'Item 1' }] },
      parentBlockId: listBlockId,
    });

    // Third op: insert second list item as child of list
    expect(ops[2]).toMatchObject({
      op: 'block.insert',
      blockType: 'list_item',
      content: { inline: [{ t: 'text', text: 'Item 2' }] },
      parentBlockId: listBlockId,
    });
  });
});
