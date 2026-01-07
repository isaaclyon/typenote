/**
 * Template placeholder substitution tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect } from 'vitest';
import type { TemplateBlock } from '@typenote/api';
import { substitutePlaceholders, type PlaceholderContext } from './templatePlaceholders.js';

describe('substitutePlaceholders', () => {
  const baseContext: PlaceholderContext = {
    title: 'Test Title',
    created_date: '2026-01-06',
  };

  describe('text node substitution', () => {
    it('replaces {{title}} placeholder in text', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{title}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Test Title' }],
      });
    });

    it('replaces {{created_date}} placeholder', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Created: {{created_date}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Created: 2026-01-06' }],
      });
    });

    it('replaces {{date_key}} placeholder when provided', () => {
      const contextWithDateKey: PlaceholderContext = {
        ...baseContext,
        date_key: '2026-01-06',
      };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Date: {{date_key}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, contextWithDateKey);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Date: 2026-01-06' }],
      });
    });

    it('replaces multiple placeholders in single text', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: '{{title}} - {{created_date}}' }],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Test Title - 2026-01-06' }],
      });
    });

    it('leaves unknown placeholders unchanged', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{unknown}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: '{{unknown}}' }],
      });
    });

    it('handles text without placeholders', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'No placeholders here' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'No placeholders here' }],
      });
    });
  });

  describe('multiple inline nodes', () => {
    it('replaces placeholders across multiple text nodes', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 'Title: ' },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [
          { t: 'text', text: 'Title: ' },
          { t: 'text', text: 'Test Title' },
        ],
      });
    });

    it('preserves non-text inline nodes unchanged', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: '{{title}}' },
              { t: 'hard_break' },
              { t: 'tag', value: 'my-tag' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [
          { t: 'text', text: 'Test Title' },
          { t: 'hard_break' },
          { t: 'tag', value: 'my-tag' },
        ],
      });
    });

    it('preserves text marks during substitution', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: '{{title}}', marks: ['strong'] }],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Test Title', marks: ['strong'] }],
      });
    });
  });

  describe('heading blocks', () => {
    it('replaces placeholders in heading content', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        level: 1,
        inline: [{ t: 'text', text: 'Test Title' }],
      });
    });
  });

  describe('nested children', () => {
    it('recursively processes child blocks', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'list',
          content: { kind: 'bullet' },
          children: [
            {
              blockType: 'list_item',
              content: { inline: [{ t: 'text', text: '{{title}}' }] },
            },
          ],
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.children?.[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Test Title' }],
      });
    });

    it('recursively processes deeply nested blocks', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'blockquote',
          content: {},
          children: [
            {
              blockType: 'list',
              content: { kind: 'ordered' },
              children: [
                {
                  blockType: 'list_item',
                  content: { inline: [{ t: 'text', text: 'Item: {{title}}' }] },
                },
              ],
            },
          ],
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.children?.[0]?.children?.[0]?.content).toEqual({
        inline: [{ t: 'text', text: 'Item: Test Title' }],
      });
    });
  });

  describe('multiple blocks', () => {
    it('processes all blocks in array', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
        },
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Date: {{created_date}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({
        level: 1,
        inline: [{ t: 'text', text: 'Test Title' }],
      });
      expect(result[1]?.content).toEqual({
        inline: [{ t: 'text', text: 'Date: 2026-01-06' }],
      });
    });
  });

  describe('immutability', () => {
    it('does not mutate original blocks', () => {
      const original: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{title}}' }] },
        },
      ];

      const originalJson = JSON.stringify(original);
      substitutePlaceholders(original, baseContext);

      expect(JSON.stringify(original)).toBe(originalJson);
    });
  });

  describe('edge cases', () => {
    it('handles empty blocks array', () => {
      const blocks: TemplateBlock[] = [];
      const result = substitutePlaceholders(blocks, baseContext);
      expect(result).toEqual([]);
    });

    it('handles empty inline array', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({ inline: [] });
    });

    it('handles blocks without inline content', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'thematic_break',
          content: {},
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      expect(result[0]?.content).toEqual({});
    });

    it('handles code_block without substituting placeholders', () => {
      // Code blocks store content in `code` property, not `inline`
      const blocks: TemplateBlock[] = [
        {
          blockType: 'code_block',
          content: { language: 'js', code: 'const title = "{{title}}"' },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Code block content should remain unchanged (no placeholder substitution in code)
      expect(result[0]?.content).toEqual({
        language: 'js',
        code: 'const title = "{{title}}"',
      });
    });
  });
});
