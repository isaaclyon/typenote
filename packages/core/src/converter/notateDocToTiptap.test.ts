import { describe, it, expect, vi } from 'vitest';
import { notateDocToTiptap, defaultRefResolver, type RefResolver } from './notateDocToTiptap.js';
import type { ConvertedBlock } from './tiptapToNotateDoc.js';

describe('notateDocToTiptap', () => {
  describe('paragraphs', () => {
    it('converts empty paragraph', () => {
      const blocks: ConvertedBlock[] = [{ type: 'paragraph', content: { inline: [] } }];
      const result = notateDocToTiptap(blocks);
      expect(result).toEqual({
        type: 'doc',
        content: [{ type: 'paragraph' }],
      });
    });

    it('converts paragraph with text', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Hello world' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      });
    });

    it('converts paragraph with formatted text', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'bold', marks: ['strong'] },
              { t: 'text', text: ' and ' },
              { t: 'text', text: 'italic', marks: ['em'] },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
        ],
      });
    });
  });

  describe('headings', () => {
    it('converts heading with level', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'heading',
          content: {
            level: 2,
            inline: [{ t: 'text', text: 'Title' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Title' }],
      });
    });
  });

  describe('lists', () => {
    it('converts bullet list', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'list',
          content: { kind: 'bullet' },
          children: [
            {
              type: 'list_item',
              content: { inline: [{ t: 'text', text: 'Item 1' }] },
            },
          ],
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Item 1' }],
              },
            ],
          },
        ],
      });
    });

    it('converts ordered list with start', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'list',
          content: { kind: 'ordered', start: 5 },
          children: [
            {
              type: 'list_item',
              content: { inline: [{ t: 'text', text: 'Item' }] },
            },
          ],
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'orderedList',
        attrs: { start: 5 },
      });
    });

    it('converts task list with checked items', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'list',
          content: { kind: 'task' },
          children: [
            {
              type: 'list_item',
              content: { inline: [{ t: 'text', text: 'Done' }], checked: true },
            },
            {
              type: 'list_item',
              content: { inline: [{ t: 'text', text: 'Todo' }], checked: false },
            },
          ],
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'taskList',
        content: [
          { type: 'taskItem', attrs: { checked: true } },
          { type: 'taskItem', attrs: { checked: false } },
        ],
      });
    });
  });

  describe('references', () => {
    it('converts link ref to refNode', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: 'abc123' },
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toMatchObject({
        type: 'refNode',
        attrs: {
          objectId: 'abc123',
          displayTitle: 'abc123', // default resolver
          objectType: 'unknown',
        },
      });
    });

    it('converts embed ref to embedNode', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'embed',
                target: { kind: 'object', objectId: 'abc123' },
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toMatchObject({
        type: 'embedNode',
        attrs: { objectId: 'abc123' },
      });
    });

    it('uses custom resolver for ref metadata', () => {
      const resolver: RefResolver = {
        resolveObject: vi.fn().mockReturnValue({
          displayTitle: 'My Page',
          objectType: 'Page',
          color: 'blue',
        }),
      };
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: 'abc123' },
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks, resolver);
      expect(resolver.resolveObject).toHaveBeenCalledWith('abc123');
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toMatchObject({
        type: 'refNode',
        attrs: {
          objectId: 'abc123',
          displayTitle: 'My Page',
          objectType: 'Page',
          color: 'blue',
        },
      });
    });

    it('converts ref with alias', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: 'abc123' },
                alias: 'custom name',
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]?.attrs).toMatchObject({ alias: 'custom name' });
    });

    it('converts block ref with blockId', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'block', objectId: 'abc123', blockId: 'block456' },
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]?.attrs).toMatchObject({
        objectId: 'abc123',
        blockId: 'block456',
      });
    });
  });

  describe('inline nodes', () => {
    it('converts tag', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [{ t: 'tag', value: 'important' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toEqual({
        type: 'tagNode',
        attrs: { value: 'important' },
      });
    });

    it('converts math_inline', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [{ t: 'math_inline', latex: 'x^2' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toEqual({
        type: 'inlineMath',
        attrs: { latex: 'x^2' },
      });
    });

    it('converts footnote_ref', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [{ t: 'footnote_ref', key: '1' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toEqual({
        type: 'footnoteRef',
        attrs: { key: '1' },
      });
    });

    it('converts hard_break', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'line 1' },
              { t: 'hard_break' },
              { t: 'text', text: 'line 2' },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content).toEqual([
        { type: 'text', text: 'line 1' },
        { type: 'hardBreak' },
        { type: 'text', text: 'line 2' },
      ]);
    });
  });

  describe('links', () => {
    it('converts link node to text with link mark', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'link',
                href: 'https://example.com',
                children: [{ t: 'text', text: 'click here' }],
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]).toMatchObject({
        type: 'text',
        text: 'click here',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
      });
    });

    it('preserves other marks on linked text', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'link',
                href: 'https://example.com',
                children: [{ t: 'text', text: 'bold link', marks: ['strong'] }],
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      const content = result.content?.[0]?.content;
      expect(content?.[0]?.marks).toContainEqual({ type: 'bold' });
      expect(content?.[0]?.marks).toContainEqual({
        type: 'link',
        attrs: { href: 'https://example.com' },
      });
    });
  });

  describe('block nodes', () => {
    it('converts blockquote', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'blockquote',
          content: {},
          children: [
            {
              type: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Quote' }] },
            },
          ],
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'blockquote',
        content: [{ type: 'paragraph' }],
      });
    });

    it('converts callout', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'callout',
          content: { kind: 'warning', title: 'Caution', collapsed: true },
          children: [
            {
              type: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Warning' }] },
            },
          ],
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'callout',
        attrs: { kind: 'warning', title: 'Caution', collapsed: true },
      });
    });

    it('converts code_block', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'code_block',
          content: { language: 'typescript', code: 'const x = 1;' },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [{ type: 'text', text: 'const x = 1;' }],
      });
    });

    it('converts thematic_break', () => {
      const blocks: ConvertedBlock[] = [{ type: 'thematic_break', content: {} }];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toEqual({ type: 'horizontalRule' });
    });

    it('converts math_block', () => {
      const blocks: ConvertedBlock[] = [
        { type: 'math_block', content: { latex: '\\sum_{i=1}^n x_i' } },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toEqual({
        type: 'mathBlock',
        attrs: { latex: '\\sum_{i=1}^n x_i' },
      });
    });

    it('converts footnote_def', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'footnote_def',
          content: {
            key: '1',
            inline: [{ t: 'text', text: 'Footnote content' }],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'footnoteDef',
        attrs: { key: '1' },
        content: [{ type: 'text', text: 'Footnote content' }],
      });
    });
  });

  describe('tables', () => {
    it('converts table', () => {
      const blocks: ConvertedBlock[] = [
        {
          type: 'table',
          content: {
            rows: [
              { cells: [[{ t: 'text', text: 'Header' }]] },
              { cells: [[{ t: 'text', text: 'Cell' }]] },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content?.[0]).toMatchObject({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Header' }],
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
                    content: [{ type: 'text', text: 'Cell' }],
                  },
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('edge cases', () => {
    it('handles empty blocks array', () => {
      const result = notateDocToTiptap([]);
      expect(result).toEqual({ type: 'doc' });
    });

    it('skips attachment blocks', () => {
      const blocks: ConvertedBlock[] = [
        { type: 'attachment', content: {} },
        { type: 'paragraph', content: { inline: [] } },
      ];
      const result = notateDocToTiptap(blocks);
      expect(result.content).toHaveLength(1);
      expect(result.content?.[0]?.type).toBe('paragraph');
    });

    it('handles resolver returning null', () => {
      const resolver: RefResolver = {
        resolveObject: () => null,
      };
      const blocks: ConvertedBlock[] = [
        {
          type: 'paragraph',
          content: {
            inline: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: 'abc123' },
              },
            ],
          },
        },
      ];
      const result = notateDocToTiptap(blocks, resolver);
      const content = result.content?.[0]?.content;
      // Should fall back to objectId as displayTitle
      expect(content?.[0]?.attrs).toMatchObject({
        displayTitle: 'abc123',
        objectType: 'unknown',
      });
    });
  });

  describe('defaultRefResolver', () => {
    it('returns objectId as displayTitle', () => {
      const result = defaultRefResolver.resolveObject('test123');
      expect(result).toEqual({
        displayTitle: 'test123',
        objectType: 'unknown',
      });
    });
  });
});
