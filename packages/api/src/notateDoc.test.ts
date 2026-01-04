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
  MathBlockContentSchema,
  FootnoteDefContentSchema,
  getContentSchemaForBlockType,
  type InlineNode,
  type BlockType,
} from './notateDoc.js';

describe('MarkSchema', () => {
  const validMarks = ['em', 'strong', 'code', 'strike', 'highlight'];

  it.each(validMarks)('accepts valid mark: %s', (mark) => {
    const result = MarkSchema.safeParse(mark);
    expect(result.success).toBe(true);
  });

  it('rejects invalid mark', () => {
    const result = MarkSchema.safeParse('underline');
    expect(result.success).toBe(false);
  });
});

describe('InlineNodeSchema', () => {
  describe('text node', () => {
    it('accepts plain text', () => {
      const node: InlineNode = { t: 'text', text: 'Hello world' };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('accepts text with marks', () => {
      const node: InlineNode = { t: 'text', text: 'Bold', marks: ['strong'] };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('accepts text with multiple marks', () => {
      const node: InlineNode = { t: 'text', text: 'Bold italic', marks: ['strong', 'em'] };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('hard_break node', () => {
    it('accepts hard break', () => {
      const node: InlineNode = { t: 'hard_break' };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('link node', () => {
    it('accepts link with text children', () => {
      const node: InlineNode = {
        t: 'link',
        href: 'https://example.com',
        children: [{ t: 'text', text: 'Example' }],
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('accepts link with marked text', () => {
      const node: InlineNode = {
        t: 'link',
        href: 'https://example.com',
        children: [{ t: 'text', text: 'Bold link', marks: ['strong'] }],
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('ref node (object reference)', () => {
    it('accepts object link ref', () => {
      const node: InlineNode = {
        t: 'ref',
        mode: 'link',
        target: { kind: 'object', objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('accepts object embed ref (transclusion)', () => {
      const node: InlineNode = {
        t: 'ref',
        mode: 'embed',
        target: { kind: 'object', objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' },
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });

    it('accepts ref with alias', () => {
      const node: InlineNode = {
        t: 'ref',
        mode: 'link',
        target: { kind: 'object', objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' },
        alias: 'My Note',
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('ref node (block reference)', () => {
    it('accepts block link ref', () => {
      const node: InlineNode = {
        t: 'ref',
        mode: 'link',
        target: {
          kind: 'block',
          objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
          blockId: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
        },
      };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('tag node', () => {
    it('accepts tag', () => {
      const node: InlineNode = { t: 'tag', value: 'project-alpha' };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('math_inline node', () => {
    it('accepts inline math', () => {
      const node: InlineNode = { t: 'math_inline', latex: 'E = mc^2' };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });

  describe('footnote_ref node', () => {
    it('accepts footnote reference', () => {
      const node: InlineNode = { t: 'footnote_ref', key: '1' };
      const result = InlineNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    });
  });
});

describe('BlockTypeSchema', () => {
  const validTypes: BlockType[] = [
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

  it.each(validTypes)('accepts valid block type: %s', (type) => {
    const result = BlockTypeSchema.safeParse(type);
    expect(result.success).toBe(true);
  });

  it('rejects invalid block type', () => {
    const result = BlockTypeSchema.safeParse('image');
    expect(result.success).toBe(false);
  });
});

describe('Block content schemas', () => {
  describe('ParagraphContentSchema', () => {
    it('accepts paragraph with inline content', () => {
      const content = {
        inline: [{ t: 'text', text: 'Hello world' }],
      };
      const result = ParagraphContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts empty paragraph', () => {
      const content = { inline: [] };
      const result = ParagraphContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('HeadingContentSchema', () => {
    it('accepts heading with level and inline', () => {
      const content = {
        level: 2,
        inline: [{ t: 'text', text: 'Heading' }],
      };
      const result = HeadingContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts all valid heading levels', () => {
      for (let level = 1; level <= 6; level++) {
        const content = { level, inline: [] };
        const result = HeadingContentSchema.safeParse(content);
        expect(result.success).toBe(true);
      }
    });

    it('rejects invalid heading level', () => {
      const content = { level: 7, inline: [] };
      const result = HeadingContentSchema.safeParse(content);
      expect(result.success).toBe(false);
    });
  });

  describe('ListContentSchema', () => {
    it('accepts bullet list', () => {
      const content = { kind: 'bullet' };
      const result = ListContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts ordered list with start', () => {
      const content = { kind: 'ordered', start: 5 };
      const result = ListContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts task list', () => {
      const content = { kind: 'task', tight: true };
      const result = ListContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('ListItemContentSchema', () => {
    it('accepts list item with inline', () => {
      const content = {
        inline: [{ t: 'text', text: 'Item' }],
      };
      const result = ListItemContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts task list item with checked', () => {
      const content = {
        inline: [{ t: 'text', text: 'Task' }],
        checked: true,
      };
      const result = ListItemContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('BlockquoteContentSchema', () => {
    it('accepts empty blockquote content', () => {
      const content = {};
      const result = BlockquoteContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('CalloutContentSchema', () => {
    it('accepts callout with kind', () => {
      const content = { kind: 'NOTE' };
      const result = CalloutContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts callout with title and collapsed', () => {
      const content = { kind: 'WARNING', title: 'Be careful', collapsed: true };
      const result = CalloutContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('CodeBlockContentSchema', () => {
    it('accepts code block with language', () => {
      const content = { language: 'typescript', code: 'const x = 1;' };
      const result = CodeBlockContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts code block without language', () => {
      const content = { code: 'plain text' };
      const result = CodeBlockContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('ThematicBreakContentSchema', () => {
    it('accepts empty thematic break content', () => {
      const content = {};
      const result = ThematicBreakContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('TableContentSchema', () => {
    it('accepts table with rows', () => {
      const content = {
        rows: [
          { cells: [[{ t: 'text', text: 'Header' }]] },
          { cells: [[{ t: 'text', text: 'Cell' }]] },
        ],
      };
      const result = TableContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts table with alignment', () => {
      const content = {
        align: ['left', 'center', 'right', null],
        rows: [{ cells: [] }],
      };
      const result = TableContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('MathBlockContentSchema', () => {
    it('accepts math block with latex', () => {
      const content = { latex: '\\int_0^\\infty e^{-x} dx = 1' };
      const result = MathBlockContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });

  describe('FootnoteDefContentSchema', () => {
    it('accepts footnote with key and inline', () => {
      const content = {
        key: '1',
        inline: [{ t: 'text', text: 'Footnote text' }],
      };
      const result = FootnoteDefContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });

    it('accepts footnote with key only', () => {
      const content = { key: 'note1' };
      const result = FootnoteDefContentSchema.safeParse(content);
      expect(result.success).toBe(true);
    });
  });
});

describe('getContentSchemaForBlockType', () => {
  it('returns ParagraphContentSchema for paragraph', () => {
    const schema = getContentSchemaForBlockType('paragraph');
    expect(schema).toBe(ParagraphContentSchema);
  });

  it('returns HeadingContentSchema for heading', () => {
    const schema = getContentSchemaForBlockType('heading');
    expect(schema).toBe(HeadingContentSchema);
  });

  it('returns undefined for unknown block type', () => {
    // @ts-expect-error - testing invalid input
    const schema = getContentSchemaForBlockType('unknown');
    expect(schema).toBeUndefined();
  });
});
