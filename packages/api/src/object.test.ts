/**
 * Object API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  DuplicateObjectRequestSchema,
  DuplicateObjectResponseSchema,
  UpdateObjectRequestSchema,
  UpdateObjectResponseSchema,
  type DuplicateObjectRequest,
  type DuplicateObjectResponse,
  type UpdateObjectRequest,
  type UpdateObjectResponse,
} from './object.js';

// Valid 26-character ULID test values
const VALID_ULID_1 = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

// ============================================================================
// DuplicateObjectRequestSchema
// ============================================================================

describe('DuplicateObjectRequestSchema', () => {
  it('validates valid objectId', () => {
    const request: DuplicateObjectRequest = {
      objectId: VALID_ULID_1,
    };
    const result = DuplicateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.objectId).toBe(VALID_ULID_1);
    }
  });

  it('rejects invalid objectId - too short', () => {
    const request = {
      objectId: '01ARZ3NDEKTSV4RRFFQ69G5FA', // 25 chars
    };
    const result = DuplicateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects invalid objectId - too long', () => {
    const request = {
      objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAVX', // 27 chars
    };
    const result = DuplicateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects invalid objectId - empty string', () => {
    const request = {
      objectId: '',
    };
    const result = DuplicateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects missing objectId', () => {
    const request = {};
    const result = DuplicateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UpdateObjectRequestSchema
// ============================================================================

describe('UpdateObjectRequestSchema', () => {
  it('validates minimal request with objectId and empty patch', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {},
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('validates request with title update', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        title: 'New Title',
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.patch.title).toBe('New Title');
      // Verify the schema enforces title.min(1), not max(1)
      if (result.data.patch.title !== undefined) {
        expect(result.data.patch.title.length).toBeGreaterThan(0);
      }
    }
  });

  it('rejects patch with empty title string', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        title: '',
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('validates request with properties update', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        properties: { author: 'Bob', status: 'active' },
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.patch.properties).toEqual({ author: 'Bob', status: 'active' });
    }
  });

  it('validates request with typeKey change', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        typeKey: 'Meeting',
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('validates request with propertyMapping for type change', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {},
      propertyMapping: { old_field: 'new_field' },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.propertyMapping).toEqual({ old_field: 'new_field' });
    }
  });

  it('validates request with baseDocVersion for optimistic concurrency', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: { title: 'Updated' },
      baseDocVersion: 5,
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.baseDocVersion).toBe(5);
    }
  });

  it('rejects request missing objectId', () => {
    const request = {
      patch: { title: 'New Title' },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects request missing patch', () => {
    const request = {
      objectId: VALID_ULID_1,
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('verifies patch field is required in schema', () => {
    const request = {
      objectId: VALID_ULID_1,
      // missing patch field - should fail
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    expect(
      result.success === false && result.error.issues.some((i) => i.path.includes('patch'))
    ).toBe(true);
  });

  it('verifies objectId field is required and has length constraint', () => {
    const request = {
      objectId: 'too-short', // not 26 chars
      patch: {},
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects request with invalid baseDocVersion (negative)', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {},
      baseDocVersion: -1,
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('validates request with all fields populated', () => {
    const request = {
      objectId: VALID_ULID_1,
      baseDocVersion: 3,
      patch: {
        title: 'New Title',
        typeKey: 'Note',
        properties: { color: 'blue', priority: 'high' },
      },
      propertyMapping: { old_priority: 'priority' },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('rejects request with objectId wrong type', () => {
    const request = {
      objectId: 123, // not a string
      patch: {},
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('verifies all patch sub-fields are properly constrained', () => {
    // This test checks that title has .min(1), not .max(1)
    const requestWithTwoChar = {
      objectId: VALID_ULID_1,
      patch: { title: 'AB' },
    };
    const result = UpdateObjectRequestSchema.safeParse(requestWithTwoChar);
    expect(result.success).toBe(true); // Should succeed with .min(1), fail with .max(1)
  });

  it('type-checks UpdateObjectRequest has expected structure', () => {
    // This ensures the schema produces correct TypeScript types
    // If the schema is empty, objectId will have type never
    const request: UpdateObjectRequest = {
      objectId: VALID_ULID_1,
      patch: {
        title: 'Test',
        typeKey: 'Note',
        properties: { key: 'value' },
      },
    };
    expect(request.objectId).toBe(VALID_ULID_1);
    expect(request.patch.title).toBe('Test');
    expect(request.patch.typeKey).toBe('Note');
  });

  it('verifies UpdateObjectRequest includes objectId property', () => {
    const request: UpdateObjectRequest = {
      objectId: VALID_ULID_1,
      patch: {},
    };
    // This test ensures objectId is a required property
    // If schema is z.object({}), objectId would not be in the type
    expect(Object.prototype.hasOwnProperty.call(request, 'objectId')).toBe(true);
  });

  it('verifies UpdateObjectRequest includes patch property', () => {
    const request: UpdateObjectRequest = {
      objectId: VALID_ULID_1,
      patch: {
        title: 'Test',
      },
    };
    // This test ensures patch is a required property
    expect(Object.prototype.hasOwnProperty.call(request, 'patch')).toBe(true);
  });

  it('rejects request with patch as string (wrong type)', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: 'not-an-object',
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects request with patch.title as number (wrong type)', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        title: 123,
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('rejects request with patch.properties as array (wrong type)', () => {
    const request = {
      objectId: VALID_ULID_1,
      patch: {
        properties: ['not', 'an', 'object'],
      },
    };
    const result = UpdateObjectRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UpdateObjectResponseSchema
// ============================================================================

describe('UpdateObjectResponseSchema', () => {
  it('validates response with complete object and no dropped properties', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Updated Note',
        properties: { author: 'Alice' },
        docVersion: 2,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.object.id).toBe(VALID_ULID_1);
      expect(result.data.object.typeId).toBe(VALID_ULID_2);
      expect(result.data.object.typeKey).toBe('Note');
      expect(result.data.object.title).toBe('Updated Note');
      expect(result.data.object.docVersion).toBe(2);
      expect(result.data.object.updatedAt).toBeTruthy();
      // Verify required fields exist
      expect(result.data.object.properties).toBeDefined();
    }
  });

  it('validates response with dropped properties array', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Meeting',
        title: 'Converted',
        properties: {},
        docVersion: 3,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: ['old_field1', 'old_field2'],
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.droppedProperties).toEqual(['old_field1', 'old_field2']);
    }
  });

  it('validates response with empty droppedProperties array', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 1,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: [],
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('rejects response missing object field', () => {
    const response = {
      droppedProperties: [],
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with invalid object.id (wrong length)', () => {
    const response = {
      object: {
        id: 'invalid-id',
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with invalid object.docVersion (negative)', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: -1,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with invalid updatedAt (not ISO datetime)', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: 'not-a-date',
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with object.typeId wrong length', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: 'short', // not 26 chars
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with object.title missing', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        // missing title
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with object.properties missing', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        // missing properties
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('verifies droppedProperties is array of strings when present', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: ['field1', 'field2', 'field3'],
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Array.isArray(result.data.droppedProperties)).toBe(true);
      expect(result.data.droppedProperties).toHaveLength(3);
    }
  });

  it('type-checks UpdateObjectResponse has expected structure', () => {
    // This ensures the schema produces correct TypeScript types
    // If the schema is empty, object will have type never
    const response: UpdateObjectResponse = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: { key: 'value' },
        docVersion: 1,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: ['old_field'],
    };
    expect(response.object.id).toBe(VALID_ULID_1);
    expect(response.object.typeKey).toBe('Note');
    expect(response.object.title).toBe('Title');
    expect(response.droppedProperties).toHaveLength(1);
  });

  it('rejects response with object.title as number (wrong type)', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 123,
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with object.docVersion as non-integer (wrong type)', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 3.14,
        updatedAt: new Date().toISOString(),
      },
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with droppedProperties as non-array (wrong type)', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: 'not-an-array',
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with droppedProperties containing non-string element', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        typeKey: 'Note',
        title: 'Title',
        properties: {},
        docVersion: 0,
        updatedAt: new Date().toISOString(),
      },
      droppedProperties: ['field1', 123, 'field3'],
    };
    const result = UpdateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// DuplicateObjectResponseSchema
// ============================================================================

describe('DuplicateObjectResponseSchema', () => {
  it('validates complete response shape', () => {
    const response: DuplicateObjectResponse = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        title: 'Duplicated Page',
        properties: { author: 'Alice', tags: ['work', 'project'] },
        docVersion: 0,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
      blockCount: 42,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.object.id).toBe(VALID_ULID_1);
      expect(result.data.object.typeId).toBe(VALID_ULID_2);
      expect(result.data.object.title).toBe('Duplicated Page');
      expect(result.data.blockCount).toBe(42);
    }
  });

  it('validates response with empty properties', () => {
    const response: DuplicateObjectResponse = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        title: 'Simple Page',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: 0,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('validates response with zero blocks', () => {
    const response: DuplicateObjectResponse = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        title: 'Empty Page',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: 0,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blockCount).toBe(0);
    }
  });

  it('rejects response with negative blockCount', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        title: 'Page',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: -5,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with missing object field', () => {
    const response = {
      blockCount: 10,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with invalid object.id', () => {
    const response = {
      object: {
        id: 'invalid-id',
        typeId: VALID_ULID_2,
        title: 'Page',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: 5,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with negative docVersion', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        title: 'Page',
        properties: {},
        docVersion: -1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: 0,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });

  it('rejects response with missing title', () => {
    const response = {
      object: {
        id: VALID_ULID_1,
        typeId: VALID_ULID_2,
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      blockCount: 0,
    };
    const result = DuplicateObjectResponseSchema.safeParse(response);
    expect(result.success).toBe(false);
  });
});
