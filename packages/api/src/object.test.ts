/**
 * Object API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  DuplicateObjectRequestSchema,
  DuplicateObjectResponseSchema,
  type DuplicateObjectRequest,
  type DuplicateObjectResponse,
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
