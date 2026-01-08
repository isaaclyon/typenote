/**
 * Template API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  TemplateBlockSchema,
  TemplateContentSchema,
  TemplateSchema,
  CreateTemplateInputSchema,
  UpdateTemplateInputSchema,
  type TemplateBlock,
  type TemplateContent,
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput,
} from './template.js';

// Valid 26-character ULID test values
const VALID_ULID_1 = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

describe('TemplateBlockSchema', () => {
  it('validates a paragraph block with text placeholder', () => {
    const block: TemplateBlock = {
      blockType: 'paragraph',
      content: { inline: [{ t: 'text', text: '{{title}}' }] },
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(true);
  });

  it('validates a heading block', () => {
    const block: TemplateBlock = {
      blockType: 'heading',
      content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(true);
  });

  it('validates a block with children', () => {
    const block: TemplateBlock = {
      blockType: 'list',
      content: { kind: 'bullet' },
      children: [
        {
          blockType: 'list_item',
          content: { inline: [{ t: 'text', text: 'Item 1' }] },
        },
      ],
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(true);
  });

  it('parses children field correctly and includes it in output', () => {
    const block = {
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
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.children).toBeDefined();
      expect(result.data.children).toHaveLength(2);
      expect(result.data.children?.[0]?.blockType).toBe('list_item');
      expect(result.data.children?.[1]?.blockType).toBe('list_item');
    }
  });

  it('rejects invalid block type', () => {
    const block = {
      blockType: 'invalid_type',
      content: {},
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(false);
  });

  it('rejects missing blockType', () => {
    const block = {
      content: { inline: [] },
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(false);
  });

  it('rejects missing content', () => {
    const block = {
      blockType: 'paragraph',
    };
    const result = TemplateBlockSchema.safeParse(block);
    expect(result.success).toBe(false);
  });
});

describe('TemplateContentSchema', () => {
  it('validates template content with blocks array', () => {
    const content: TemplateContent = {
      blocks: [
        {
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
        },
        {
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Date: {{date_key}}' }] },
        },
      ],
    };
    const result = TemplateContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('validates empty blocks array', () => {
    const content: TemplateContent = { blocks: [] };
    const result = TemplateContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it('rejects missing blocks property', () => {
    const content = {};
    const result = TemplateContentSchema.safeParse(content);
    expect(result.success).toBe(false);
  });
});

describe('TemplateSchema', () => {
  it('validates a full template entity', () => {
    const template: Template = {
      id: VALID_ULID_1,
      objectTypeId: VALID_ULID_2,
      name: 'Daily Note Default',
      content: {
        blocks: [
          {
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
          },
        ],
      },
      isDefault: true,
      createdAt: new Date('2026-01-06T00:00:00Z'),
      updatedAt: new Date('2026-01-06T00:00:00Z'),
    };
    const result = TemplateSchema.safeParse(template);
    expect(result.success).toBe(true);
  });

  it('rejects invalid ULID for id', () => {
    const template = {
      id: 'too-short',
      objectTypeId: VALID_ULID_2,
      name: 'Test',
      content: { blocks: [] },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TemplateSchema.safeParse(template);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const template = {
      id: VALID_ULID_1,
      objectTypeId: VALID_ULID_2,
      name: '',
      content: { blocks: [] },
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TemplateSchema.safeParse(template);
    expect(result.success).toBe(false);
  });
});

describe('CreateTemplateInputSchema', () => {
  it('validates a create input with all required fields', () => {
    const input: CreateTemplateInput = {
      objectTypeId: VALID_ULID_2,
      name: 'My Template',
      content: {
        blocks: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello {{title}}' }] },
          },
        ],
      },
      isDefault: true,
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates a create input with isDefault false', () => {
    const input: CreateTemplateInput = {
      objectTypeId: VALID_ULID_2,
      name: 'My Template',
      content: { blocks: [] },
      isDefault: false,
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('defaults isDefault to true when not provided', () => {
    const input = {
      objectTypeId: VALID_ULID_2,
      name: 'My Template',
      content: { blocks: [] },
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isDefault).toBe(true);
    }
  });

  it('rejects missing objectTypeId', () => {
    const input = {
      name: 'My Template',
      content: { blocks: [] },
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const input = {
      objectTypeId: VALID_ULID_2,
      content: { blocks: [] },
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing content', () => {
    const input = {
      objectTypeId: VALID_ULID_2,
      name: 'My Template',
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length', () => {
    const input = {
      objectTypeId: VALID_ULID_2,
      name: 'x'.repeat(129), // Max is 128
      content: { blocks: [] },
    };
    const result = CreateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('UpdateTemplateInputSchema', () => {
  it('validates update with name only', () => {
    const input: UpdateTemplateInput = {
      name: 'New Name',
    };
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with content only', () => {
    const input: UpdateTemplateInput = {
      content: { blocks: [] },
    };
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with isDefault only', () => {
    const input: UpdateTemplateInput = {
      isDefault: false,
    };
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with all fields', () => {
    const input: UpdateTemplateInput = {
      name: 'Updated Template',
      content: {
        blocks: [
          {
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Updated content' }] },
          },
        ],
      },
      isDefault: true,
    };
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates empty update (no fields)', () => {
    const input: UpdateTemplateInput = {};
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects name exceeding max length', () => {
    const input = {
      name: 'x'.repeat(129),
    };
    const result = UpdateTemplateInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
