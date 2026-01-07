/**
 * Tag API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  TagColorSchema,
  TagIconSchema,
  TagSchema,
  TagWithUsageSchema,
  CreateTagInputSchema,
  UpdateTagInputSchema,
  ListTagsOptionsSchema,
  AssignTagsInputSchema,
  RemoveTagsInputSchema,
  AssignTagsResultSchema,
  RemoveTagsResultSchema,
  type Tag,
  type TagWithUsage,
  type CreateTagInput,
  type UpdateTagInput,
  type ListTagsOptions,
  type AssignTagsInput,
  type RemoveTagsInput,
  type AssignTagsResult,
  type RemoveTagsResult,
} from './tag.js';

// Valid 26-character ULID test values
const VALID_ULID_1 = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const VALID_ULID_3 = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

// ============================================================================
// TagColorSchema
// ============================================================================

describe('TagColorSchema', () => {
  it('accepts valid hex color with uppercase', () => {
    const result = TagColorSchema.safeParse('#FF5733');
    expect(result.success).toBe(true);
  });

  it('accepts valid hex color with lowercase', () => {
    const result = TagColorSchema.safeParse('#ff5733');
    expect(result.success).toBe(true);
  });

  it('accepts CSS color name', () => {
    const result = TagColorSchema.safeParse('red');
    expect(result.success).toBe(true);
  });

  it('rejects short hex code', () => {
    const result = TagColorSchema.safeParse('#FFF');
    expect(result.success).toBe(false);
  });

  it('rejects hex without hash', () => {
    const result = TagColorSchema.safeParse('FF5733');
    expect(result.success).toBe(false);
  });

  it('rejects invalid characters in color name', () => {
    const result = TagColorSchema.safeParse('red-blue');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TagIconSchema
// ============================================================================

describe('TagIconSchema', () => {
  it('accepts emoji', () => {
    const result = TagIconSchema.safeParse('🏷️');
    expect(result.success).toBe(true);
  });

  it('accepts icon library reference', () => {
    const result = TagIconSchema.safeParse('lucide:tag');
    expect(result.success).toBe(true);
  });

  it('rejects icon exceeding max length', () => {
    const result = TagIconSchema.safeParse('x'.repeat(65));
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TagSchema
// ============================================================================

describe('TagSchema', () => {
  it('validates a full tag entity', () => {
    const tag: Tag = {
      id: VALID_ULID_1,
      name: 'TypeScript',
      slug: 'typescript',
      color: '#3178c6',
      icon: '🏷️',
      description: 'TypeScript related content',
      createdAt: new Date('2026-01-07T00:00:00Z'),
      updatedAt: new Date('2026-01-07T00:00:00Z'),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('validates tag with minimal fields', () => {
    const tag: Tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('rejects invalid ULID for id', () => {
    const tag = {
      id: 'too-short',
      name: 'Test',
      slug: 'test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const tag = {
      id: VALID_ULID_1,
      name: '',
      slug: 'test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects name exceeding max length', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'x'.repeat(65),
      slug: 'test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects empty slug', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: '',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects slug with uppercase', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'Test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'my tag',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('rejects slug with underscores', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'my_tag',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });

  it('accepts slug with hyphens', () => {
    const tag: Tag = {
      id: VALID_ULID_1,
      name: 'Project Alpha',
      slug: 'project-alpha',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('accepts slug with numbers', () => {
    const tag: Tag = {
      id: VALID_ULID_1,
      name: 'Version 2',
      slug: 'version-2',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('rejects description exceeding max length', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'test',
      color: null,
      icon: null,
      description: 'x'.repeat(513),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = TagSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TagWithUsageSchema
// ============================================================================

describe('TagWithUsageSchema', () => {
  it('validates tag with usage count', () => {
    const tag: TagWithUsage = {
      id: VALID_ULID_1,
      name: 'TypeScript',
      slug: 'typescript',
      color: '#3178c6',
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 42,
    };
    const result = TagWithUsageSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('allows usageCount to be zero', () => {
    const tag: TagWithUsage = {
      id: VALID_ULID_1,
      name: 'Unused',
      slug: 'unused',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
    };
    const result = TagWithUsageSchema.safeParse(tag);
    expect(result.success).toBe(true);
  });

  it('rejects negative usageCount', () => {
    const tag = {
      id: VALID_ULID_1,
      name: 'Test',
      slug: 'test',
      color: null,
      icon: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: -1,
    };
    const result = TagWithUsageSchema.safeParse(tag);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CreateTagInputSchema
// ============================================================================

describe('CreateTagInputSchema', () => {
  it('validates minimal create input', () => {
    const input: CreateTagInput = {
      name: 'TypeScript',
      slug: 'typescript',
    };
    const result = CreateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates full create input', () => {
    const input: CreateTagInput = {
      name: 'TypeScript',
      slug: 'typescript',
      color: '#3178c6',
      icon: '🏷️',
      description: 'TypeScript content',
    };
    const result = CreateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const input = {
      slug: 'typescript',
    };
    const result = CreateTagInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing slug', () => {
    const input = {
      name: 'TypeScript',
    };
    const result = CreateTagInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug format', () => {
    const input = {
      name: 'TypeScript',
      slug: 'TypeScript', // uppercase not allowed
    };
    const result = CreateTagInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UpdateTagInputSchema
// ============================================================================

describe('UpdateTagInputSchema', () => {
  it('validates update with name only', () => {
    const input: UpdateTagInput = {
      name: 'New Name',
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with slug only', () => {
    const input: UpdateTagInput = {
      slug: 'new-slug',
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with color only', () => {
    const input: UpdateTagInput = {
      color: '#FF5733',
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates update with all fields', () => {
    const input: UpdateTagInput = {
      name: 'Updated Tag',
      slug: 'updated-tag',
      color: '#FF5733',
      icon: '🔖',
      description: 'Updated description',
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates empty update (no fields)', () => {
    const input: UpdateTagInput = {};
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('allows setting color to null', () => {
    const input: UpdateTagInput = {
      color: null,
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug format', () => {
    const input = {
      slug: 'Invalid_Slug',
    };
    const result = UpdateTagInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ListTagsOptionsSchema
// ============================================================================

describe('ListTagsOptionsSchema', () => {
  it('validates empty options', () => {
    const options: ListTagsOptions = {};
    const result = ListTagsOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with objectId filter', () => {
    const options: ListTagsOptions = {
      objectId: VALID_ULID_1,
    };
    const result = ListTagsOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with includeUsageCount', () => {
    const options: ListTagsOptions = {
      includeUsageCount: true,
    };
    const result = ListTagsOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with sortBy', () => {
    const options: ListTagsOptions = {
      sortBy: 'usageCount',
      sortOrder: 'desc',
    };
    const result = ListTagsOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates all sort options', () => {
    for (const sortBy of ['name', 'createdAt', 'usageCount'] as const) {
      for (const sortOrder of ['asc', 'desc'] as const) {
        const options: ListTagsOptions = { sortBy, sortOrder };
        const result = ListTagsOptionsSchema.safeParse(options);
        expect(result.success).toBe(true);
      }
    }
  });

  it('rejects invalid sortBy value', () => {
    const options = {
      sortBy: 'invalid',
    };
    const result = ListTagsOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// AssignTagsInputSchema
// ============================================================================

describe('AssignTagsInputSchema', () => {
  it('validates assign input with one tag', () => {
    const input: AssignTagsInput = {
      objectId: VALID_ULID_1,
      tagIds: [VALID_ULID_2],
    };
    const result = AssignTagsInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates assign input with multiple tags', () => {
    const input: AssignTagsInput = {
      objectId: VALID_ULID_1,
      tagIds: [VALID_ULID_2, VALID_ULID_3],
    };
    const result = AssignTagsInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty tagIds array', () => {
    const input = {
      objectId: VALID_ULID_1,
      tagIds: [],
    };
    const result = AssignTagsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid objectId', () => {
    const input = {
      objectId: 'invalid',
      tagIds: [VALID_ULID_2],
    };
    const result = AssignTagsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid tagId in array', () => {
    const input = {
      objectId: VALID_ULID_1,
      tagIds: [VALID_ULID_2, 'invalid'],
    };
    const result = AssignTagsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// RemoveTagsInputSchema
// ============================================================================

describe('RemoveTagsInputSchema', () => {
  it('validates remove input', () => {
    const input: RemoveTagsInput = {
      objectId: VALID_ULID_1,
      tagIds: [VALID_ULID_2],
    };
    const result = RemoveTagsInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty tagIds array', () => {
    const input = {
      objectId: VALID_ULID_1,
      tagIds: [],
    };
    const result = RemoveTagsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// AssignTagsResultSchema
// ============================================================================

describe('AssignTagsResultSchema', () => {
  it('validates result with assigned and skipped tags', () => {
    const result: AssignTagsResult = {
      objectId: VALID_ULID_1,
      assignedTagIds: [VALID_ULID_2],
      skippedTagIds: [VALID_ULID_3],
    };
    const parsed = AssignTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates result with empty arrays', () => {
    const result: AssignTagsResult = {
      objectId: VALID_ULID_1,
      assignedTagIds: [],
      skippedTagIds: [],
    };
    const parsed = AssignTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});

// ============================================================================
// RemoveTagsResultSchema
// ============================================================================

describe('RemoveTagsResultSchema', () => {
  it('validates result with removed and skipped tags', () => {
    const result: RemoveTagsResult = {
      objectId: VALID_ULID_1,
      removedTagIds: [VALID_ULID_2],
      skippedTagIds: [VALID_ULID_3],
    };
    const parsed = RemoveTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates result with empty arrays', () => {
    const result: RemoveTagsResult = {
      objectId: VALID_ULID_1,
      removedTagIds: [],
      skippedTagIds: [],
    };
    const parsed = RemoveTagsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });
});
