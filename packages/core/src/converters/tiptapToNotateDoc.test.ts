/**
 * Unit tests for TipTap to NotateDoc converter
 */

import { describe, it, expect } from 'vitest';
import {
  convertTiptapBlock,
  convertTiptapToNotateDoc,
  type JSONContent,
} from './tiptapToNotateDoc.js';

describe('tiptapToNotateDoc', () => {
  describe('Basic Blocks', () => {
    it('should convert a paragraph', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Hello world' }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'paragraph',
        content: {
          inline: [{ t: 'text', text: 'Hello world' }],
        },
      });
    });

    it('should convert headings (h1-h6)', () => {
      for (let level = 1; level <= 6; level++) {
        const tiptap: JSONContent = {
          type: 'heading',
          attrs: { level },
          content: [{ type: 'text', text: `Heading ${level}` }],
        };

        const result = convertTiptapBlock(tiptap);

        expect(result).toEqual({
          blockType: 'heading',
          content: {
            level,
            inline: [{ t: 'text', text: `Heading ${level}` }],
          },
        });
      }
    });

    it('should convert thematic break', () => {
      const tiptap: JSONContent = {
        type: 'horizontalRule',
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'thematic_break',
        content: {},
      });
    });
  });

  describe('Inline Marks', () => {
    it('should convert bold text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'bold', marks: ['strong'] }],
      });
    });

    it('should convert italic text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'italic', marks: [{ type: 'italic' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'italic', marks: ['em'] }],
      });
    });

    it('should convert code text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'code', marks: [{ type: 'code' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'code', marks: ['code'] }],
      });
    });

    it('should convert strikethrough text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'strike', marks: [{ type: 'strike' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'strike', marks: ['strike'] }],
      });
    });

    it('should convert highlight mark', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: 'highlighted', marks: [{ type: 'highlight' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'highlighted', marks: ['highlight'] }],
      });
    });

    it('should convert multiple marks', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'bold italic', marks: [{ type: 'bold' }, { type: 'italic' }] },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'bold italic', marks: ['strong', 'em'] }],
      });
    });
  });

  describe('Links', () => {
    it('should convert link with plain text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'link',
            attrs: { href: 'https://example.com' },
            content: [{ type: 'text', text: 'Example' }],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Example' }],
          },
        ],
      });
    });

    it('should convert link with formatted text', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'link',
            attrs: { href: 'https://example.com' },
            content: [{ type: 'text', text: 'Bold Link', marks: [{ type: 'bold' }] }],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Bold Link', marks: ['strong'] }],
          },
        ],
      });
    });

    it('should convert hard break', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Line 1' },
          { type: 'hardBreak' },
          { type: 'text', text: 'Line 2' },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'Line 1' }, { t: 'hard_break' }, { t: 'text', text: 'Line 2' }],
      });
    });
  });

  describe('Lists', () => {
    it('should convert bullet list', () => {
      const tiptap: JSONContent = {
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
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'list',
        content: { kind: 'bullet' },
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
      });
    });

    it('should convert ordered list with start attribute', () => {
      const tiptap: JSONContent = {
        type: 'orderedList',
        attrs: { start: 5 },
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 5' }] }],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        kind: 'ordered',
        start: 5,
      });
    });

    it('should convert task list', () => {
      const tiptap: JSONContent = {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Unchecked' }] }],
          },
          {
            type: 'taskItem',
            attrs: { checked: true },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Checked' }] }],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'list',
        content: { kind: 'task' },
        children: [
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Unchecked' }], checked: false },
          },
          {
            blockType: 'list_item',
            content: { inline: [{ t: 'text', text: 'Checked' }], checked: true },
          },
        ],
      });
    });

    it('should convert nested lists', () => {
      const tiptap: JSONContent = {
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

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
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

  describe('Code Blocks', () => {
    it('should convert code block without language', () => {
      const tiptap: JSONContent = {
        type: 'codeBlock',
        textContent: 'const x = 1;',
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'code_block',
        content: { code: 'const x = 1;' },
      });
    });

    it('should convert code block with language', () => {
      const tiptap: JSONContent = {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        textContent: 'const x: number = 1;',
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'code_block',
        content: {
          language: 'typescript',
          code: 'const x: number = 1;',
        },
      });
    });
  });

  describe('Blockquote and Callout', () => {
    it('should convert blockquote with nested content', () => {
      const tiptap: JSONContent = {
        type: 'blockquote',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Quoted text' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph' }] },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'blockquote',
        content: {},
        children: [
          { blockType: 'paragraph', content: { inline: [{ t: 'text', text: 'Quoted text' }] } },
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Second paragraph' }] },
          },
        ],
      });
    });

    it('should convert callout with type and title', () => {
      const tiptap: JSONContent = {
        type: 'callout',
        attrs: { kind: 'WARNING', title: 'Important' },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Be careful!' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'callout',
        content: { kind: 'WARNING', title: 'Important' },
        children: [
          { blockType: 'paragraph', content: { inline: [{ t: 'text', text: 'Be careful!' }] } },
        ],
      });
    });

    it('should convert callout with collapsed state', () => {
      const tiptap: JSONContent = {
        type: 'callout',
        attrs: { kind: 'NOTE', collapsed: true },
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hidden content' }] }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toMatchObject({
        kind: 'NOTE',
        collapsed: true,
      });
    });
  });

  describe('Tables', () => {
    it('should convert simple table', () => {
      const tiptap: JSONContent = {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Header' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Cell' }] }],
              },
            ],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'table',
        content: {
          rows: [
            { cells: [[{ t: 'text', text: 'Header' }]] },
            { cells: [[{ t: 'text', text: 'Cell' }]] },
          ],
        },
      });
    });

    it('should convert table with alignment', () => {
      const tiptap: JSONContent = {
        type: 'table',
        attrs: { align: ['left', 'center', 'right'] },
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'B' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'C' }] }],
              },
            ],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toMatchObject({
        align: ['left', 'center', 'right'],
      });
    });
  });

  describe('References (RefNode)', () => {
    it('should convert object reference', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              targetKind: 'object',
              objectId: '01JXYZ123',
            },
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01JXYZ123' },
          },
        ],
      });
    });

    it('should convert reference with alias', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              targetKind: 'object',
              objectId: '01JXYZ123',
              alias: 'My Note',
            },
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01JXYZ123' },
            alias: 'My Note',
          },
        ],
      });
    });

    it('should convert block reference', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'refNode',
            attrs: {
              mode: 'link',
              targetKind: 'block',
              objectId: '01JXYZ123',
              blockId: '01JBLOCK456',
            },
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'block', objectId: '01JXYZ123', blockId: '01JBLOCK456' },
          },
        ],
      });
    });
  });

  describe('Tags (TagNode)', () => {
    it('should convert tag node', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'tagNode', attrs: { value: 'important' } }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'tag', value: 'important' }],
      });
    });
  });

  describe('Embeds (EmbedNode)', () => {
    it('should convert embed node to paragraph with embed ref', () => {
      const tiptap: JSONContent = {
        type: 'embedNode',
        attrs: {
          objectId: '01JEMBED789',
        },
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'paragraph',
        content: {
          inline: [
            {
              t: 'ref',
              mode: 'embed',
              target: { kind: 'object', objectId: '01JEMBED789' },
            },
          ],
        },
      });
    });

    it('should convert embed with alias', () => {
      const tiptap: JSONContent = {
        type: 'embedNode',
        attrs: {
          objectId: '01JEMBED789',
          alias: 'Embedded Doc',
        },
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'ref',
            mode: 'embed',
            target: { kind: 'object', objectId: '01JEMBED789' },
            alias: 'Embedded Doc',
          },
        ],
      });
    });
  });

  describe('Math', () => {
    it('should convert inline math', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'inlineMath', attrs: { latex: 'E = mc^2' } }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'math_inline', latex: 'E = mc^2' }],
      });
    });

    it('should convert math block', () => {
      const tiptap: JSONContent = {
        type: 'mathBlock',
        attrs: { latex: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}' },
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'math_block',
        content: { latex: '\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}' },
      });
    });
  });

  describe('Footnotes', () => {
    it('should convert footnote reference', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Text with footnote' },
          { type: 'footnoteRef', attrs: { key: 'fn1' } },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          { t: 'text', text: 'Text with footnote' },
          { t: 'footnote_ref', key: 'fn1' },
        ],
      });
    });

    it('should convert footnote definition', () => {
      const tiptap: JSONContent = {
        type: 'footnoteDef',
        attrs: { key: 'fn1' },
        content: [{ type: 'text', text: 'Footnote content' }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'footnote_def',
        content: {
          key: 'fn1',
          inline: [{ t: 'text', text: 'Footnote content' }],
        },
      });
    });

    it('should convert footnote definition without content', () => {
      const tiptap: JSONContent = {
        type: 'footnoteDef',
        attrs: { key: 'fn2' },
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'footnote_def',
        content: { key: 'fn2' },
      });
    });
  });

  describe('Document Conversion', () => {
    it('should convert full document', () => {
      const tiptapDoc: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Document Title' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is ' },
              { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' text.' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'List item' }] }],
              },
            ],
          },
        ],
      };

      const result = convertTiptapToNotateDoc(tiptapDoc);

      expect(result).toHaveLength(3);
      expect(result[0]?.blockType).toBe('heading');
      expect(result[1]?.blockType).toBe('paragraph');
      expect(result[2]?.blockType).toBe('list');
    });

    it('should handle empty document', () => {
      const tiptapDoc: JSONContent = {
        type: 'doc',
      };

      const result = convertTiptapToNotateDoc(tiptapDoc);

      expect(result).toEqual([]);
    });

    it('should skip unsupported nodes', () => {
      const tiptapDoc: JSONContent = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'Valid' }] },
          { type: 'resizableImage' }, // Unsupported - should be skipped
          { type: 'blockIdNode' }, // Meta node - should be skipped
          { type: 'paragraph', content: [{ type: 'text', text: 'Also valid' }] },
        ],
      };

      const result = convertTiptapToNotateDoc(tiptapDoc);

      expect(result).toHaveLength(2);
      expect(result[0]?.content).toEqual({ inline: [{ t: 'text', text: 'Valid' }] });
      expect(result[1]?.content).toEqual({ inline: [{ t: 'text', text: 'Also valid' }] });
    });
  });

  describe('Edge Cases', () => {
    it('should handle paragraph with no content', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
      };

      const result = convertTiptapBlock(tiptap);

      expect(result).toEqual({
        blockType: 'paragraph',
        content: { inline: [] },
      });
    });

    it('should handle empty text node', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: '' }],
      });
    });

    it('should handle list item with no inline content paragraph', () => {
      const tiptap: JSONContent = {
        type: 'listItem',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested' }] }],
              },
            ],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({ inline: [] });
      expect(result?.children).toBeDefined();
      expect(result?.children?.length).toBe(1);
    });

    it('should filter out unknown marks', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'text',
            marks: [{ type: 'bold' }, { type: 'unknownMark' }, { type: 'italic' }],
          },
        ],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [{ t: 'text', text: 'text', marks: ['strong', 'em'] }],
      });
    });

    it('should handle node with null attrs', () => {
      const tiptap: JSONContent = {
        type: 'paragraph',
        content: [{ type: 'refNode' }],
      };

      const result = convertTiptapBlock(tiptap);

      expect(result?.content).toEqual({
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '' },
          },
        ],
      });
    });
  });
});
