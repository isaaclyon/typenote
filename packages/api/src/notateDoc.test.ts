import { describe, expect, it } from 'vitest';
import {
  MarkSchema,
  InlineNodeSchema,
  BlockTypeSchema,
  ParagraphContentSchema,
  HeadingContentSchema,
  ListContentSchema,
  ListItemContentSchema,
  BlockquoteContentSchema,
  CalloutContentSchema,
  CodeBlockContentSchema,
  ThematicBreakContentSchema,
  TableContentSchema,
  TableRowSchema,
  MathBlockContentSchema,
  FootnoteDefContentSchema,
  ObjectRefTargetSchema,
  BlockRefTargetSchema,
  TextNodeSchema,
  HardBreakNodeSchema,
  RefNodeSchema,
  TagNodeSchema,
  MathInlineNodeSchema,
  FootnoteRefNodeSchema,
  LinkNodeSchema,
  getContentSchemaForBlockType,
  type BlockType,
} from './notateDoc.js';
import { expectValid, expectInvalid, VALID_ULID, VALID_ULID_2 } from './test-utils.js';

// =============================================================================
// Test Data
// =============================================================================

const VALID_MARKS = ['em', 'strong', 'code', 'strike', 'highlight'] as const;

const VALID_BLOCK_TYPES: BlockType[] = [
  'paragraph',
  'heading',
  'list',
  'list_item',
  'blockquote',
  'callout',
  'code_block',
  'thematic_break',
  'table',
  'math_block',
  'footnote_def',
];

// Inline node test data
const INLINE_NODE_TEST_CASES = {
  text: {
    valid: [
      { name: 'plain text', data: { t: 'text', text: 'Hello world' } },
      { name: 'text with marks', data: { t: 'text', text: 'Bold', marks: ['strong'] } },
      {
        name: 'text with multiple marks',
        data: { t: 'text', text: 'Bold italic', marks: ['strong', 'em'] },
      },
    ],
  },
  hard_break: {
    valid: [{ name: 'hard break', data: { t: 'hard_break' } }],
  },
  link: {
    valid: [
      {
        name: 'link with text children',
        data: {
          t: 'link',
          href: 'https://example.com',
          children: [{ t: 'text', text: 'Example' }],
        },
      },
      {
        name: 'link with marked text',
        data: {
          t: 'link',
          href: 'https://example.com',
          children: [{ t: 'text', text: 'Bold link', marks: ['strong'] }],
        },
      },
    ],
  },
  ref_object: {
    valid: [
      {
        name: 'object link ref',
        data: { t: 'ref', mode: 'link', target: { kind: 'object', objectId: VALID_ULID } },
      },
      {
        name: 'object embed ref (transclusion)',
        data: { t: 'ref', mode: 'embed', target: { kind: 'object', objectId: VALID_ULID } },
      },
      {
        name: 'ref with alias',
        data: {
          t: 'ref',
          mode: 'link',
          target: { kind: 'object', objectId: VALID_ULID },
          alias: 'My Note',
        },
      },
    ],
  },
  ref_block: {
    valid: [
      {
        name: 'block link ref',
        data: {
          t: 'ref',
          mode: 'link',
          target: { kind: 'block', objectId: VALID_ULID, blockId: VALID_ULID_2 },
        },
      },
    ],
  },
  tag: {
    valid: [{ name: 'tag', data: { t: 'tag', value: 'project-alpha' } }],
  },
  math_inline: {
    valid: [{ name: 'inline math', data: { t: 'math_inline', latex: 'E = mc^2' } }],
  },
  footnote_ref: {
    valid: [{ name: 'footnote reference', data: { t: 'footnote_ref', key: '1' } }],
  },
} as const;

// Block content schemas with test data
type TestCase = { name: string; data: unknown };
type BlockContentTestEntry = {
  blockType: string;
  schema: Parameters<typeof expectValid>[0];
  valid: TestCase[];
  invalid: TestCase[];
};

const BLOCK_CONTENT_TEST_DATA: BlockContentTestEntry[] = [
  {
    blockType: 'paragraph',
    schema: ParagraphContentSchema,
    valid: [
      {
        name: 'paragraph with inline content',
        data: { inline: [{ t: 'text', text: 'Hello world' }] },
      },
      { name: 'empty paragraph', data: { inline: [] } },
    ],
    invalid: [],
  },
  {
    blockType: 'heading',
    schema: HeadingContentSchema,
    valid: [
      {
        name: 'heading with level and inline',
        data: { level: 2, inline: [{ t: 'text', text: 'Heading' }] },
      },
      ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({
        name: `heading level ${level}`,
        data: { level, inline: [] },
      })),
    ],
    invalid: [{ name: 'invalid heading level', data: { level: 7, inline: [] } }],
  },
  {
    blockType: 'list',
    schema: ListContentSchema,
    valid: [
      { name: 'bullet list', data: { kind: 'bullet' } },
      { name: 'ordered list with start', data: { kind: 'ordered', start: 5 } },
      { name: 'task list', data: { kind: 'task', tight: true } },
    ],
    invalid: [],
  },
  {
    blockType: 'list_item',
    schema: ListItemContentSchema,
    valid: [
      { name: 'list item with inline', data: { inline: [{ t: 'text', text: 'Item' }] } },
      {
        name: 'task list item with checked',
        data: { inline: [{ t: 'text', text: 'Task' }], checked: true },
      },
    ],
    invalid: [],
  },
  {
    blockType: 'blockquote',
    schema: BlockquoteContentSchema,
    valid: [{ name: 'empty blockquote content', data: {} }],
    invalid: [],
  },
  {
    blockType: 'callout',
    schema: CalloutContentSchema,
    valid: [
      { name: 'callout with kind', data: { kind: 'NOTE' } },
      {
        name: 'callout with title and collapsed',
        data: { kind: 'WARNING', title: 'Be careful', collapsed: true },
      },
    ],
    invalid: [],
  },
  {
    blockType: 'code_block',
    schema: CodeBlockContentSchema,
    valid: [
      { name: 'code block with language', data: { language: 'typescript', code: 'const x = 1;' } },
      { name: 'code block without language', data: { code: 'plain text' } },
    ],
    invalid: [],
  },
  {
    blockType: 'thematic_break',
    schema: ThematicBreakContentSchema,
    valid: [{ name: 'empty thematic break content', data: {} }],
    invalid: [],
  },
  {
    blockType: 'table',
    schema: TableContentSchema,
    valid: [
      {
        name: 'table with rows',
        data: {
          rows: [
            { cells: [[{ t: 'text', text: 'Header' }]] },
            { cells: [[{ t: 'text', text: 'Cell' }]] },
          ],
        },
      },
      {
        name: 'table with alignment',
        data: { align: ['left', 'center', 'right', null], rows: [{ cells: [] }] },
      },
    ],
    invalid: [],
  },
  {
    blockType: 'math_block',
    schema: MathBlockContentSchema,
    valid: [{ name: 'math block with latex', data: { latex: '\\int_0^\\infty e^{-x} dx = 1' } }],
    invalid: [],
  },
  {
    blockType: 'footnote_def',
    schema: FootnoteDefContentSchema,
    valid: [
      {
        name: 'footnote with key and inline',
        data: { key: '1', inline: [{ t: 'text', text: 'Footnote text' }] },
      },
      { name: 'footnote with key only', data: { key: 'note1' } },
    ],
    invalid: [],
  },
];

// Schema mapping for getContentSchemaForBlockType tests
const SCHEMA_MAPPINGS = [
  { type: 'paragraph' as const, schema: ParagraphContentSchema },
  { type: 'heading' as const, schema: HeadingContentSchema },
  { type: 'list' as const, schema: ListContentSchema },
  { type: 'list_item' as const, schema: ListItemContentSchema },
  { type: 'blockquote' as const, schema: BlockquoteContentSchema },
  { type: 'callout' as const, schema: CalloutContentSchema },
  { type: 'code_block' as const, schema: CodeBlockContentSchema },
  { type: 'thematic_break' as const, schema: ThematicBreakContentSchema },
  { type: 'table' as const, schema: TableContentSchema },
  { type: 'math_block' as const, schema: MathBlockContentSchema },
  { type: 'footnote_def' as const, schema: FootnoteDefContentSchema },
];

// =============================================================================
// Tests
// =============================================================================

describe('MarkSchema', () => {
  it.each(VALID_MARKS)('accepts valid mark: %s', (mark) => {
    expectValid(MarkSchema, mark);
  });

  it('rejects invalid mark', () => {
    expectInvalid(MarkSchema, 'underline');
  });
});

describe('InlineNodeSchema', () => {
  // Flatten all inline node test cases into a single array for data-driven testing
  const allInlineNodeCases = Object.entries(INLINE_NODE_TEST_CASES).flatMap(
    ([nodeType, { valid }]) => valid.map((testCase) => ({ nodeType, ...testCase }))
  );

  it.each(allInlineNodeCases)('accepts $nodeType: $name', ({ data }) => {
    expectValid(InlineNodeSchema, data);
  });
});

describe('BlockTypeSchema', () => {
  it.each(VALID_BLOCK_TYPES)('accepts valid block type: %s', (type) => {
    expectValid(BlockTypeSchema, type);
  });

  it('rejects invalid block type', () => {
    expectInvalid(BlockTypeSchema, 'image');
  });
});

describe('Block content schemas', () => {
  // Generate data-driven tests for each block type
  describe.each(BLOCK_CONTENT_TEST_DATA)('$blockType', ({ schema, valid, invalid }) => {
    if (valid.length > 0) {
      it.each(valid)('accepts $name', ({ data }) => {
        expectValid(schema, data);
      });
    }

    if (invalid.length > 0) {
      it.each(invalid)('rejects $name', ({ data }) => {
        expectInvalid(schema, data);
      });
    }
  });
});

describe('getContentSchemaForBlockType', () => {
  it.each(SCHEMA_MAPPINGS)('returns correct schema for $type', ({ type, schema }) => {
    expect(getContentSchemaForBlockType(type)).toBe(schema);
  });

  it('returns undefined for unknown block type', () => {
    // @ts-expect-error - testing invalid input
    const schema = getContentSchemaForBlockType('unknown');
    expect(schema).toBeUndefined();
  });
});

// =============================================================================
// Mutation Testing: Empty Object Rejection
// These tests kill ObjectLiteral mutants by proving schemas have required fields
// =============================================================================

describe('Schema required fields (mutation testing)', () => {
  describe('Reference target schemas', () => {
    it('ObjectRefTargetSchema rejects empty object', () => {
      expectInvalid(ObjectRefTargetSchema, {});
    });

    it('BlockRefTargetSchema rejects empty object', () => {
      expectInvalid(BlockRefTargetSchema, {});
    });
  });

  describe('Inline node schemas', () => {
    it('TextNodeSchema rejects empty object', () => {
      expectInvalid(TextNodeSchema, {});
    });

    it('HardBreakNodeSchema rejects empty object', () => {
      expectInvalid(HardBreakNodeSchema, {});
    });

    it('RefNodeSchema rejects empty object', () => {
      expectInvalid(RefNodeSchema, {});
    });

    it('TagNodeSchema rejects empty object', () => {
      expectInvalid(TagNodeSchema, {});
    });

    it('MathInlineNodeSchema rejects empty object', () => {
      expectInvalid(MathInlineNodeSchema, {});
    });

    it('FootnoteRefNodeSchema rejects empty object', () => {
      expectInvalid(FootnoteRefNodeSchema, {});
    });

    it('LinkNodeSchema rejects empty object', () => {
      expectInvalid(LinkNodeSchema, {});
    });
  });

  describe('Block content schemas', () => {
    it('ListItemContentSchema rejects empty object', () => {
      expectInvalid(ListItemContentSchema, {});
    });

    it('CalloutContentSchema rejects empty object', () => {
      expectInvalid(CalloutContentSchema, {});
    });

    it('TableRowSchema rejects empty object', () => {
      expectInvalid(TableRowSchema, {});
    });

    it('TableContentSchema rejects empty object', () => {
      expectInvalid(TableContentSchema, {});
    });

    it('MathBlockContentSchema rejects empty object', () => {
      expectInvalid(MathBlockContentSchema, {});
    });

    it('FootnoteDefContentSchema rejects empty object', () => {
      expectInvalid(FootnoteDefContentSchema, {});
    });
  });

  describe('Optional field type validation', () => {
    it('TextNodeSchema rejects invalid marks type (must be array)', () => {
      expectInvalid(TextNodeSchema, { t: 'text', text: 'hello', marks: 'strong' }, 'marks');
    });

    it('TextNodeSchema rejects invalid mark in array', () => {
      expectInvalid(TextNodeSchema, { t: 'text', text: 'hello', marks: ['underline'] }, 'marks.0');
    });

    it('LinkNodeSchema rejects invalid children type (must be array)', () => {
      expectInvalid(
        LinkNodeSchema,
        { t: 'link', href: 'https://example.com', children: 'text' },
        'children'
      );
    });

    it('RefNodeSchema rejects missing mode field', () => {
      expectInvalid(
        RefNodeSchema,
        { t: 'ref', target: { kind: 'object', objectId: VALID_ULID } },
        'mode'
      );
    });

    it('RefNodeSchema rejects missing target field', () => {
      expectInvalid(RefNodeSchema, { t: 'ref', mode: 'link' }, 'target');
    });

    it('TagNodeSchema rejects missing value field', () => {
      expectInvalid(TagNodeSchema, { t: 'tag' }, 'value');
    });

    it('MathInlineNodeSchema rejects missing latex field', () => {
      expectInvalid(MathInlineNodeSchema, { t: 'math_inline' }, 'latex');
    });

    it('FootnoteRefNodeSchema rejects missing key field', () => {
      expectInvalid(FootnoteRefNodeSchema, { t: 'footnote_ref' }, 'key');
    });
  });

  describe('Reference target validation', () => {
    it('ObjectRefTargetSchema rejects missing kind field', () => {
      expectInvalid(ObjectRefTargetSchema, { objectId: VALID_ULID }, 'kind');
    });

    it('ObjectRefTargetSchema rejects missing objectId field', () => {
      expectInvalid(ObjectRefTargetSchema, { kind: 'object' }, 'objectId');
    });

    it('BlockRefTargetSchema rejects missing blockId field', () => {
      expectInvalid(BlockRefTargetSchema, { kind: 'block', objectId: VALID_ULID }, 'blockId');
    });

    it('BlockRefTargetSchema rejects missing objectId field', () => {
      expectInvalid(BlockRefTargetSchema, { kind: 'block', blockId: VALID_ULID_2 }, 'objectId');
    });
  });
});
