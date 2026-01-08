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

  describe('referential equality optimization', () => {
    // These tests verify that the code returns the SAME object references
    // when nothing changes, avoiding unnecessary object allocations.
    // This is important for React rendering optimization and memory efficiency.

    it('returns same block reference when no placeholders present', () => {
      const originalBlock: TemplateBlock = {
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'No placeholders here' }] },
      };
      const blocks: TemplateBlock[] = [originalBlock];

      const result = substitutePlaceholders(blocks, baseContext);

      // Should return the exact same block object, not a copy
      expect(result[0]).toBe(originalBlock);
    });

    it('returns same content reference when text has no placeholders', () => {
      const originalContent = { inline: [{ t: 'text', text: 'Static text' }] };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: originalContent,
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Content object should be the same reference
      expect(result[0]?.content).toBe(originalContent);
    });

    it('returns same children reference when children have no placeholders', () => {
      const originalChild: TemplateBlock = {
        blockType: 'list_item',
        content: { inline: [{ t: 'text', text: 'Static item' }] },
      };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'list',
          content: { kind: 'bullet' },
          children: [originalChild],
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Children array and child block should be same references
      expect(result[0]?.children?.[0]).toBe(originalChild);
    });

    it('returns same inline node reference when text unchanged', () => {
      const originalTextNode = { t: 'text' as const, text: 'No change' };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [originalTextNode] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // The text node itself should be the same reference
      const resultInline = result[0]?.content as { inline: unknown[] };
      expect(resultInline.inline[0]).toBe(originalTextNode);
    });

    it('creates new block when content changes but children unchanged', () => {
      const originalChild: TemplateBlock = {
        blockType: 'paragraph',
        content: { inline: [{ t: 'text', text: 'Static child' }] },
      };
      const originalBlock: TemplateBlock = {
        blockType: 'blockquote',
        content: {},
        children: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: '{{title}}' }] },
          },
          originalChild,
        ],
      };
      const blocks: TemplateBlock[] = [originalBlock];

      const result = substitutePlaceholders(blocks, baseContext);

      // Block should be new (children changed)
      expect(result[0]).not.toBe(originalBlock);
      // But the unchanged child should be same reference
      expect(result[0]?.children?.[1]).toBe(originalChild);
    });

    it('creates new block when children change but content unchanged', () => {
      const originalContent = { kind: 'bullet' as const };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'list',
          content: originalContent,
          children: [
            {
              blockType: 'list_item',
              content: { inline: [{ t: 'text', text: '{{title}}' }] },
            },
          ],
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Content should still be same reference (no inline array)
      expect(result[0]?.content).toBe(originalContent);
      // But block should be new since children changed
      expect(result[0]).not.toBe(blocks[0]);
    });

    it('does not add children property when original has no children', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{title}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Result should not have children property
      expect(result[0]).not.toHaveProperty('children');
    });

    it('preserves children property when original has children', () => {
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

      // Result should have children property
      expect(result[0]).toHaveProperty('children');
      expect(result[0]?.children).toHaveLength(1);
    });
  });

  describe('type guard edge cases', () => {
    // These tests verify the isTextNode type guard correctly filters non-text nodes
    // Critical: These tests kill mutation testing survivors by verifying behavior
    // differs when type guards are bypassed

    it('does not substitute placeholders in non-text nodes with text property', () => {
      // This test kills the mutation: `['t'] === 'text'` → `true`
      // A link node has a `text` property but t !== 'text'
      // If the type guard is bypassed, substitution would incorrectly occur
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              // Simulating a malformed node that has t !== 'text' but has a text property
              { t: 'other', text: '{{title}}' } as unknown as { t: 'text'; text: string },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // The node should be passed through UNCHANGED - no substitution
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'other', text: '{{title}}' });
    });

    it('handles undefined nodes without crashing', () => {
      // This test kills the mutation: `typeof node === 'object'` → `true`
      // If bypassed, accessing properties on undefined would throw
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              undefined as unknown as { t: 'text'; text: string },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // undefined should be passed through, text should be substituted
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toBeUndefined();
      expect(inline[1]).toEqual({ t: 'text', text: 'Test Title' });
    });

    it('handles null nodes in inline array gracefully', () => {
      // Cast to bypass TypeScript - simulating malformed data
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              null as unknown as { t: 'text'; text: string },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Should process without error, null passed through, text substituted
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toBeNull();
      expect(inline[1]).toEqual({ t: 'text', text: 'Test Title' });
    });

    it('handles primitive nodes in inline array gracefully', () => {
      // Cast to bypass TypeScript - simulating malformed data
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              'string' as unknown as { t: 'text'; text: string },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // String passed through unchanged, text substituted
      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toBe('string');
      expect(inline[1]).toEqual({ t: 'text', text: 'Test Title' });
    });

    it('handles objects without t property gracefully', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              { notT: 'something' } as unknown as { t: 'text'; text: string },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ notT: 'something' });
      expect(inline[1]).toEqual({ t: 'text', text: 'Test Title' });
    });

    it('handles objects with non-string text property gracefully', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [
              { t: 'text', text: 123 } as unknown as { t: 'text'; text: string },
              { t: 'text', text: '{{title}}' },
            ],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'text', text: 123 }); // Passed through
      expect(inline[1]).toEqual({ t: 'text', text: 'Test Title' });
    });
  });

  describe('placeholder validation edge cases', () => {
    it('leaves {{date_key}} unchanged when not provided in context', () => {
      // date_key is optional - when undefined, placeholder should remain
      const contextWithoutDateKey: PlaceholderContext = {
        title: 'Test Title',
        created_date: '2026-01-06',
        // date_key intentionally omitted
      };
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{date_key}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, contextWithoutDateKey);

      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: '{{date_key}}' }],
      });
    });

    it('does not substitute Object prototype properties as placeholders', () => {
      // {{toString}}, {{constructor}} etc. should NOT be substituted
      // even though they exist on all objects
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{toString}} {{constructor}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      // Should remain unchanged - these are not valid placeholder keys
      expect(result[0]?.content).toEqual({
        inline: [{ t: 'text', text: '{{toString}} {{constructor}}' }],
      });
    });
  });

  describe('marks handling', () => {
    it('does not add marks property when text node has no marks', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: '{{title}}' }] },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      const textNode = inline[0] as Record<string, unknown>;

      // Should NOT have marks property at all (not even undefined)
      expect(textNode).not.toHaveProperty('marks');
      expect(textNode).toEqual({ t: 'text', text: 'Test Title' });
    });

    it('preserves marks property when text node has marks', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: '{{title}}', marks: ['strong', 'em'] }],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      expect(inline[0]).toEqual({ t: 'text', text: 'Test Title', marks: ['strong', 'em'] });
    });

    it('preserves empty marks array when present', () => {
      const blocks: TemplateBlock[] = [
        {
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: '{{title}}', marks: [] }],
          },
        },
      ];

      const result = substitutePlaceholders(blocks, baseContext);

      const inline = (result[0]?.content as { inline: unknown[] }).inline;
      // Empty array should be preserved since marks property exists
      expect(inline[0]).toEqual({ t: 'text', text: 'Test Title', marks: [] });
    });
  });
});
