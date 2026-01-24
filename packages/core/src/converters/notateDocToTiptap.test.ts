/**
 * Unit tests for NotateDoc to TipTap converter
 */

import { describe, it, expect } from 'vitest';
import {
  convertNotateDocBlock,
  convertNotateDocToTiptap,
  type NotateDocBlock,
} from './notateDocToTiptap.js';

describe('notateDocToTiptap', () => {
  describe('Basic Blocks', () => {
    it('should convert a paragraph', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'Hello world' }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello world' }],
      });
    });

    it('should convert headings (h1-h6)', () => {
      for (let level = 1; level <= 6; level++) {
        const notateDoc: NotateDocBlock = {
          blockType: 'heading',
          content: {
            level: level as 1 | 2 | 3 | 4 | 5 | 6,
            inline: [{ t: 'text', text: `Heading ${level}` }],
          },
        };

        const result = convertNotateDocBlock(notateDoc);

        expect(result).toEqual({
          type: 'heading',
          attrs: { level },
          content: [{ type: 'text', text: `Heading ${level}` }],
        });
      }
    });

    it('should convert thematic break', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'thematic_break',
        content: {},
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'horizontalRule',
      });
    });
  });

  describe('Inline Marks', () => {
    it('should convert strong (bold) text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'bold', marks: ['strong'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] }],
      });
    });

    it('should convert em (italic) text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'italic', marks: ['em'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] }],
      });
    });

    it('should convert code text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'code', marks: ['code'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'code', marks: [{ type: 'code' }] }],
      });
    });

    it('should convert strike (strikethrough) text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'strikethrough', marks: ['strike'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'strikethrough', marks: [{ type: 'strike' }] }],
      });
    });

    it('should convert highlight text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'highlighted', marks: ['highlight'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'highlighted', marks: [{ type: 'highlight' }] }],
      });
    });

    it('should convert multiple marks on same text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'multi', marks: ['strong', 'em', 'highlight'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'multi',
            marks: [{ type: 'bold' }, { type: 'italic' }, { type: 'highlight' }],
          },
        ],
      });
    });

    it('should handle text without marks', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'plain text' }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'plain text' }],
      });
    });
  });

  describe('Inline Nodes', () => {
    it('should convert hard break', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            { t: 'text', text: 'Line 1' },
            { t: 'hard_break' },
            { t: 'text', text: 'Line 2' },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Line 1' },
          { type: 'hardBreak' },
          { type: 'text', text: 'Line 2' },
        ],
      });
    });

    it('should convert link nodes', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'link',
              href: 'https://example.com',
              children: [{ t: 'text', text: 'Click here' }],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'link',
            attrs: { href: 'https://example.com' },
            content: [{ type: 'text', text: 'Click here' }],
          },
        ],
      });
    });

    it('should convert links with formatted text children', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'link',
              href: 'https://example.com',
              children: [{ t: 'text', text: 'Bold link', marks: ['strong'] }],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'link',
            attrs: { href: 'https://example.com' },
            content: [{ type: 'text', text: 'Bold link', marks: [{ type: 'bold' }] }],
          },
        ],
      });
    });

    it('should convert tag nodes', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            { t: 'text', text: 'Tagged ' },
            { t: 'tag', value: 'important' },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Tagged ' },
          { type: 'tagNode', attrs: { value: 'important' } },
        ],
      });
    });

    it('should convert inline math nodes', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            { t: 'text', text: 'Equation: ' },
            { t: 'math_inline', latex: 'E = mc^2' },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Equation: ' },
          { type: 'inlineMath', attrs: { latex: 'E = mc^2' } },
        ],
      });
    });

    it('should convert footnote reference nodes', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            { t: 'text', text: 'See footnote' },
            { t: 'footnote_ref', key: '1' },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'See footnote' },
          { type: 'footnoteRef', attrs: { key: '1' } },
        ],
      });
    });

    it('should convert object ref nodes (link mode)', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'link',
              target: { kind: 'object', objectId: 'obj123' },
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              objectId: 'obj123',
              targetKind: 'object',
            },
          },
        ],
      });
    });

    it('should convert object ref nodes (embed mode)', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'embed',
              target: { kind: 'object', objectId: 'obj456' },
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'embed',
              objectId: 'obj456',
              targetKind: 'object',
            },
          },
        ],
      });
    });

    it('should convert block ref nodes', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'link',
              target: { kind: 'block', objectId: 'obj789', blockId: 'blk123' },
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              objectId: 'obj789',
              targetKind: 'block',
              blockId: 'blk123',
            },
          },
        ],
      });
    });

    it('should convert ref nodes with alias', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'link',
              target: { kind: 'object', objectId: 'obj123' },
              alias: 'Custom Title',
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              objectId: 'obj123',
              targetKind: 'object',
              alias: 'Custom Title',
            },
          },
        ],
      });
    });
  });

  describe('Lists', () => {
    it('should convert bullet lists', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'bullet' as const },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Item 1' }] },
          },
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Item 2' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
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
      });
    });

    it('should convert ordered lists', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'ordered' as const, start: 1 },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'First' }] },
          },
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Second' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'orderedList',
        attrs: { start: 1 },
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }],
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }],
          },
        ],
      });
    });

    it('should convert task lists', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'task' as const },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Done task' }], checked: true },
          },
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Todo task' }], checked: false },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Done task' }] }],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Todo task' }] }],
          },
        ],
      });
    });

    it('should convert nested lists', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'bullet' as const },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Parent' }] },
            children: [
              {
                blockType: 'list',
                content: { kind: 'bullet' as const },
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
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
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
      });
    });

    it('should convert lists with tight spacing', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'bullet' as const, tight: true },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Tight 1' }] },
          },
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Tight 2' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'bulletList',
        attrs: { tight: true },
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tight 1' }] }],
          },
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Tight 2' }] }],
          },
        ],
      });
    });
  });

  describe('Blockquote', () => {
    it('should convert blockquote with paragraph', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'blockquote',
        content: {},
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Quoted text' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Quoted text' }],
          },
        ],
      });
    });

    it('should convert blockquote with multiple paragraphs', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'blockquote',
        content: {},
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 1' }] },
          },
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 2' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'blockquote',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Para 1' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Para 2' }] },
        ],
      });
    });
  });

  describe('Callout', () => {
    it('should convert callout (default: NOTE)', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'callout',
        content: { kind: 'NOTE' },
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Note content' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'callout',
        attrs: { kind: 'NOTE' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Note content' }],
          },
        ],
      });
    });

    it('should convert callout with title', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'callout',
        content: { kind: 'WARNING', title: 'Important' },
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Warning text' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'callout',
        attrs: { kind: 'WARNING', title: 'Important' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Warning text' }],
          },
        ],
      });
    });

    it('should convert collapsed callout', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'callout',
        content: { kind: 'INFO', collapsed: true },
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Collapsed content' }] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'callout',
        attrs: { kind: 'INFO', collapsed: true },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Collapsed content' }],
          },
        ],
      });
    });
  });

  describe('Code Block', () => {
    it('should convert code block without language', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'code_block',
        content: { code: 'const x = 42;' },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'codeBlock',
        content: [{ type: 'text', text: 'const x = 42;' }],
      });
    });

    it('should convert code block with language', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'code_block',
        content: { language: 'typescript', code: 'const x: number = 42;' },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [{ type: 'text', text: 'const x: number = 42;' }],
      });
    });

    it('should convert multiline code block', () => {
      const code = `function hello() {
  console.log("world");
}`;
      const notateDoc: NotateDocBlock = {
        blockType: 'code_block',
        content: { language: 'javascript', code },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'codeBlock',
        attrs: { language: 'javascript' },
        content: [{ type: 'text', text: code }],
      });
    });
  });

  describe('Table', () => {
    it('should convert simple table', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'table',
        content: {
          rows: [
            {
              cells: [[{ t: 'text', text: 'A1' }], [{ t: 'text', text: 'B1' }]],
            },
            {
              cells: [[{ t: 'text', text: 'A2' }], [{ t: 'text', text: 'B2' }]],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A1' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B1' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A2' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B2' }] }],
              },
            ],
          },
        ],
      });
    });

    it('should convert table with alignment', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'table',
        content: {
          align: ['left', 'center', 'right'],
          rows: [
            {
              cells: [
                [{ t: 'text', text: 'Left' }],
                [{ t: 'text', text: 'Center' }],
                [{ t: 'text', text: 'Right' }],
              ],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'table',
        attrs: { align: ['left', 'center', 'right'] },
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Left' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Center' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Right' }] }],
              },
            ],
          },
        ],
      });
    });

    it('should convert table cells with formatted text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'table',
        content: {
          rows: [
            {
              cells: [
                [{ t: 'text', text: 'Bold', marks: ['strong'] }],
                [{ t: 'text', text: 'Italic', marks: ['em'] }],
              ],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Bold', marks: [{ type: 'bold' }] }],
                  },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Italic', marks: [{ type: 'italic' }] }],
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('should handle empty table cells', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'table',
        content: {
          rows: [
            {
              cells: [[], [{ t: 'text', text: 'Content' }]],
            },
          ],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Content' }] }],
              },
            ],
          },
        ],
      });
    });
  });

  describe('Math Block', () => {
    it('should convert math block', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'math_block',
        content: { latex: '\\int_0^\\infty e^{-x} dx = 1' },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'mathBlock',
        attrs: { latex: '\\int_0^\\infty e^{-x} dx = 1' },
      });
    });
  });

  describe('Footnote Definition', () => {
    it('should convert footnote definition with inline content', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'footnote_def',
        content: {
          key: '1',
          inline: [{ t: 'text', text: 'Footnote text' }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'footnoteDef',
        attrs: { key: '1' },
        content: [{ type: 'text', text: 'Footnote text' }],
      });
    });

    it('should convert footnote definition without inline content', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'footnote_def',
        content: {
          key: '2',
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'footnoteDef',
        attrs: { key: '2' },
        content: [],
      });
    });
  });

  describe('Attachment (Image)', () => {
    it('should convert attachment with alt text', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'attachment',
        content: {
          attachmentId: 'att123',
          alt: 'Beautiful sunset',
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'resizableImage',
        attrs: {
          src: '/attachments/att123',
          alt: 'Beautiful sunset',
        },
      });
    });

    it('should convert attachment with caption', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'attachment',
        content: {
          attachmentId: 'att456',
          alt: 'Diagram',
          caption: 'Figure 1: System architecture',
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'resizableImage',
        attrs: {
          src: '/attachments/att456',
          alt: 'Diagram',
          caption: 'Figure 1: System architecture',
        },
      });
    });

    it('should convert attachment without alt/caption', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'attachment',
        content: {
          attachmentId: 'att789',
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'resizableImage',
        attrs: {
          src: '/attachments/att789',
        },
      });
    });
  });

  describe('Document Conversion', () => {
    it('should convert empty document', () => {
      const blocks: NotateDocBlock[] = [];

      const result = convertNotateDocToTiptap(blocks);

      expect(result).toEqual({
        type: 'doc',
        content: [],
      });
    });

    it('should convert document with multiple blocks', () => {
      const blocks: NotateDocBlock[] = [
        {
          blockType: 'heading',
          content: {
            level: 1,
            inline: [{ t: 'text', text: 'Title' }],
          },
        },
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'First paragraph' }],
          },
        },
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Second paragraph' }],
          },
        },
      ];

      const result = convertNotateDocToTiptap(blocks);

      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'First paragraph' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Second paragraph' }],
          },
        ],
      });
    });

    it('should skip unknown block types', () => {
      const blocks: NotateDocBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'Valid' }],
          },
        },
        {
          blockType: 'unknown_type',
          content: {},
        },
        {
          blockType: 'heading',
          content: {
            level: 2,
            inline: [{ t: 'text', text: 'Also valid' }],
          },
        },
      ];

      const result = convertNotateDocToTiptap(blocks);

      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Valid' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Also valid' }],
          },
        ],
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty paragraph', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [],
      });
    });

    it('should handle paragraph with only marks', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: '', marks: ['strong'] }],
        },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: '', marks: [{ type: 'bold' }] }],
      });
    });

    it('should handle empty list', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'bullet' as const },
        children: [],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'bulletList',
        content: [],
      });
    });

    it('should handle list item with empty inline', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'list',
        content: { kind: 'bullet' as const },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [] },
          },
        ],
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [] }],
          },
        ],
      });
    });

    it('should handle code block with empty code', () => {
      const notateDoc: NotateDocBlock = {
        blockType: 'code_block',
        content: { code: '' },
      };

      const result = convertNotateDocBlock(notateDoc);

      expect(result).toEqual({
        type: 'codeBlock',
        content: [{ type: 'text', text: '' }],
      });
    });
  });
});
