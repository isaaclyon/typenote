import { describe, it, expect } from 'vitest';
import { tiptapToNotateDoc } from './tiptapToNotateDoc.js';
import type { TiptapDoc } from './types.js';

describe('tiptapToNotateDoc', () => {
  describe('paragraphs', () => {
    it('converts empty paragraph', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [{ type: 'paragraph' }],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([{ type: 'paragraph', content: { inline: [] } }]);
    });

    it('converts paragraph with text', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello world' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([
        {
          type: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Hello world' }],
          },
        },
      ]);
    });

    it('converts paragraph with formatted text', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'bold',
                marks: [{ type: 'bold' }],
              },
              { type: 'text', text: ' and ' },
              {
                type: 'text',
                text: 'italic',
                marks: [{ type: 'italic' }],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([
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
      ]);
    });

    it('converts paragraph with all mark types', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'styled',
                marks: [
                  { type: 'bold' },
                  { type: 'italic' },
                  { type: 'code' },
                  { type: 'strike' },
                  { type: 'highlight' },
                ],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'text',
        text: 'styled',
        marks: ['strong', 'em', 'code', 'strike', 'highlight'],
      });
    });
  });

  describe('headings', () => {
    it('converts heading with level', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Title' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([
        {
          type: 'heading',
          content: {
            level: 2,
            inline: [{ t: 'text', text: 'Title' }],
          },
        },
      ]);
    });

    it('defaults to level 1 when not specified', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            content: [{ type: 'text', text: 'Title' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect((result[0]?.content as { level: number }).level).toBe(1);
    });
  });

  describe('lists', () => {
    it('converts bullet list', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
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
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([
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
      ]);
    });

    it('converts ordered list with start number', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            attrs: { start: 5 },
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Item' }],
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect((result[0]?.content as { start: number }).start).toBe(5);
    });

    it('converts task list with checked items', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { checked: true },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Done' }],
                  },
                ],
              },
              {
                type: 'taskItem',
                attrs: { checked: false },
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Todo' }],
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toMatchObject({
        type: 'list',
        content: { kind: 'task' },
        children: [
          { type: 'list_item', content: { checked: true } },
          { type: 'list_item', content: { checked: false } },
        ],
      });
    });
  });

  describe('references', () => {
    it('converts refNode to link ref', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'refNode',
                attrs: {
                  objectId: 'abc123',
                  displayTitle: 'My Page',
                  objectType: 'Page',
                },
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'ref',
        mode: 'link',
        target: { kind: 'object', objectId: 'abc123' },
      });
    });

    it('converts refNode with alias', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'refNode',
                attrs: {
                  objectId: 'abc123',
                  alias: 'custom name',
                },
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toMatchObject({
        t: 'ref',
        alias: 'custom name',
      });
    });

    it('converts refNode with blockId to block ref', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'refNode',
                attrs: {
                  objectId: 'abc123',
                  blockId: 'block456',
                },
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'ref',
        mode: 'link',
        target: { kind: 'block', objectId: 'abc123', blockId: 'block456' },
      });
    });

    it('converts embedNode to embed ref', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'embedNode',
                attrs: { objectId: 'abc123' },
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'ref',
        mode: 'embed',
        target: { kind: 'object', objectId: 'abc123' },
      });
    });
  });

  describe('inline nodes', () => {
    it('converts tagNode', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'tagNode', attrs: { value: 'important' } }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'tag', value: 'important' });
    });

    it('converts inlineMath', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'inlineMath', attrs: { latex: 'x^2' } }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'math_inline', latex: 'x^2' });
    });

    it('converts footnoteRef', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'footnoteRef', attrs: { key: '1' } }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'footnote_ref', key: '1' });
    });

    it('converts hardBreak', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'line 1' },
              { type: 'hardBreak' },
              { type: 'text', text: 'line 2' },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline).toEqual([
        { t: 'text', text: 'line 1' },
        { t: 'hard_break' },
        { t: 'text', text: 'line 2' },
      ]);
    });
  });

  describe('links', () => {
    it('converts text with link mark', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'click here',
                marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'link',
        href: 'https://example.com',
        children: [{ t: 'text', text: 'click here' }],
      });
    });

    it('preserves other marks on linked text', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'bold link',
                marks: [{ type: 'bold' }, { type: 'link', attrs: { href: 'https://example.com' } }],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({
        t: 'link',
        href: 'https://example.com',
        children: [{ t: 'text', text: 'bold link', marks: ['strong'] }],
      });
    });
  });

  describe('block nodes', () => {
    it('converts blockquote', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Quote text' }],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toMatchObject({
        type: 'blockquote',
        content: {},
        children: [{ type: 'paragraph' }],
      });
    });

    it('converts callout', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'callout',
            attrs: { kind: 'warning', title: 'Caution', collapsed: true },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Warning text' }],
              },
            ],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toMatchObject({
        type: 'callout',
        content: { kind: 'warning', title: 'Caution', collapsed: true },
      });
    });

    it('converts codeBlock', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: 'typescript' },
            content: [{ type: 'text', text: 'const x = 1;' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toEqual({
        type: 'code_block',
        content: { language: 'typescript', code: 'const x = 1;' },
      });
    });

    it('converts horizontalRule', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [{ type: 'horizontalRule' }],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toEqual({
        type: 'thematic_break',
        content: {},
      });
    });

    it('converts mathBlock', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'mathBlock',
            attrs: { latex: '\\sum_{i=1}^n x_i' },
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toEqual({
        type: 'math_block',
        content: { latex: '\\sum_{i=1}^n x_i' },
      });
    });

    it('converts footnoteDef', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'footnoteDef',
            attrs: { key: '1' },
            content: [{ type: 'text', text: 'Footnote content' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toEqual({
        type: 'footnote_def',
        content: {
          key: '1',
          inline: [{ t: 'text', text: 'Footnote content' }],
        },
      });
    });
  });

  describe('tables', () => {
    it('converts table with cells', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
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
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result[0]).toMatchObject({
        type: 'table',
        content: {
          rows: [
            { cells: [[{ t: 'text', text: 'Header' }]] },
            { cells: [[{ t: 'text', text: 'Cell' }]] },
          ],
        },
      });
    });
  });

  describe('skipped nodes', () => {
    it('skips blockIdNode', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          { type: 'blockIdNode', attrs: { id: 'abc' } },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toHaveLength(1);
      expect(result[0]?.type).toBe('paragraph');
    });

    it('skips footnoteSeparator', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          { type: 'footnoteSeparator' },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toHaveLength(1);
    });

    it('skips unknown node types', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          { type: 'unknownType' },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      expect(result).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('handles empty document', () => {
      const doc: TiptapDoc = { type: 'doc' };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([]);
    });

    it('handles document with empty content array', () => {
      const doc: TiptapDoc = { type: 'doc', content: [] };
      const result = tiptapToNotateDoc(doc);
      expect(result).toEqual([]);
    });

    it('skips text nodes without text', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text' }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline).toEqual([]);
    });

    it('skips refNode without objectId', () => {
      const doc: TiptapDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'refNode', attrs: { displayTitle: 'Title' } }],
          },
        ],
      };
      const result = tiptapToNotateDoc(doc);
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline).toEqual([]);
    });
  });
});
