/**
 * Pinning API contract tests.
 */

import { describe, it, expect } from 'vitest';
import {
  PinnedObjectSummarySchema,
  PinObjectInputSchema,
  UnpinObjectInputSchema,
  ReorderPinnedObjectsInputSchema,
  PinObjectResultSchema,
  UnpinObjectResultSchema,
  ReorderPinnedObjectsResultSchema,
  ListPinnedObjectsResultSchema,
  PinningErrorCodeSchema,
  type PinnedObjectSummary,
  type PinObjectInput,
  type UnpinObjectInput,
  type ReorderPinnedObjectsInput,
  type PinObjectResult,
  type UnpinObjectResult,
  type ReorderPinnedObjectsResult,
  type ListPinnedObjectsResult,
} from './pinning.js';

// Valid 26-character ULID test values
const VALID_ULID_1 = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const VALID_ULID_3 = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

// ============================================================================
// PinnedObjectSummarySchema
// ============================================================================

describe('PinnedObjectSummarySchema', () => {
  it('validates a complete pinned object summary', () => {
    const summary: PinnedObjectSummary = {
      id: VALID_ULID_1,
      title: 'Important Document',
      typeId: VALID_ULID_2,
      typeKey: 'page',
      updatedAt: new Date('2026-01-14T10:00:00Z'),
      pinnedAt: new Date('2026-01-14T10:30:00Z'),
      order: 0,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(true);
  });

  it('validates summary with different order values', () => {
    const summary: PinnedObjectSummary = {
      id: VALID_ULID_1,
      title: 'Another Document',
      typeId: VALID_ULID_2,
      typeKey: 'note',
      updatedAt: new Date(),
      pinnedAt: new Date(),
      order: 42,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(true);
  });

  it('allows order to be zero', () => {
    const summary: PinnedObjectSummary = {
      id: VALID_ULID_1,
      title: 'First Item',
      typeId: VALID_ULID_2,
      typeKey: 'page',
      updatedAt: new Date(),
      pinnedAt: new Date(),
      order: 0,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(true);
  });

  it('rejects negative order', () => {
    const summary = {
      id: VALID_ULID_1,
      title: 'Document',
      typeId: VALID_ULID_2,
      typeKey: 'page',
      updatedAt: new Date(),
      pinnedAt: new Date(),
      order: -1,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(false);
  });

  it('rejects invalid object ULID', () => {
    const summary = {
      id: 'too-short',
      title: 'Document',
      typeId: VALID_ULID_2,
      typeKey: 'page',
      updatedAt: new Date(),
      pinnedAt: new Date(),
      order: 0,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(false);
  });

  it('rejects invalid type ULID', () => {
    const summary = {
      id: VALID_ULID_1,
      title: 'Document',
      typeId: 'invalid',
      typeKey: 'page',
      updatedAt: new Date(),
      pinnedAt: new Date(),
      order: 0,
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const summary = {
      id: VALID_ULID_1,
      title: 'Document',
      typeId: VALID_ULID_2,
      // missing typeKey, updatedAt, pinnedAt, order
    };
    const result = PinnedObjectSummarySchema.safeParse(summary);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PinObjectInputSchema
// ============================================================================

describe('PinObjectInputSchema', () => {
  it('validates pin input with valid object ID', () => {
    const input: PinObjectInput = {
      objectId: VALID_ULID_1,
    };
    const result = PinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects invalid object ID', () => {
    const input = {
      objectId: 'invalid',
    };
    const result = PinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing object ID', () => {
    const input = {};
    const result = PinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UnpinObjectInputSchema
// ============================================================================

describe('UnpinObjectInputSchema', () => {
  it('validates unpin input with valid object ID', () => {
    const input: UnpinObjectInput = {
      objectId: VALID_ULID_1,
    };
    const result = UnpinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects invalid object ID', () => {
    const input = {
      objectId: 'too-short',
    };
    const result = UnpinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing object ID', () => {
    const input = {};
    const result = UnpinObjectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// ReorderPinnedObjectsInputSchema
// ============================================================================

describe('ReorderPinnedObjectsInputSchema', () => {
  it('validates reorder input with single object', () => {
    const input: ReorderPinnedObjectsInput = {
      objectIds: [VALID_ULID_1],
    };
    const result = ReorderPinnedObjectsInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates reorder input with multiple objects', () => {
    const input: ReorderPinnedObjectsInput = {
      objectIds: [VALID_ULID_1, VALID_ULID_2, VALID_ULID_3],
    };
    const result = ReorderPinnedObjectsInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects empty object IDs array', () => {
    const input = {
      objectIds: [],
    };
    const result = ReorderPinnedObjectsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid object ID in array', () => {
    const input = {
      objectIds: [VALID_ULID_1, 'invalid', VALID_ULID_3],
    };
    const result = ReorderPinnedObjectsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing object IDs field', () => {
    const input = {};
    const result = ReorderPinnedObjectsInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// PinObjectResultSchema
// ============================================================================

describe('PinObjectResultSchema', () => {
  it('validates result for newly pinned object', () => {
    const result: PinObjectResult = {
      objectId: VALID_ULID_1,
      pinned: true,
      pinnedAt: new Date('2026-01-14T10:30:00Z'),
      order: 0,
    };
    const parsed = PinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates result for already pinned object', () => {
    const result: PinObjectResult = {
      objectId: VALID_ULID_1,
      pinned: false,
      pinnedAt: new Date('2026-01-14T10:00:00Z'),
      order: 5,
    };
    const parsed = PinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('rejects negative order', () => {
    const result = {
      objectId: VALID_ULID_1,
      pinned: true,
      pinnedAt: new Date(),
      order: -1,
    };
    const parsed = PinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = {
      objectId: VALID_ULID_1,
      pinned: true,
      // missing pinnedAt and order
    };
    const parsed = PinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ============================================================================
// UnpinObjectResultSchema
// ============================================================================

describe('UnpinObjectResultSchema', () => {
  it('validates result for newly unpinned object', () => {
    const result: UnpinObjectResult = {
      objectId: VALID_ULID_1,
      unpinned: true,
    };
    const parsed = UnpinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates result for already unpinned object', () => {
    const result: UnpinObjectResult = {
      objectId: VALID_ULID_1,
      unpinned: false,
    };
    const parsed = UnpinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing object ID', () => {
    const result = {
      unpinned: true,
    };
    const parsed = UnpinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });

  it('rejects missing unpinned field', () => {
    const result = {
      objectId: VALID_ULID_1,
    };
    const parsed = UnpinObjectResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ============================================================================
// ReorderPinnedObjectsResultSchema
// ============================================================================

describe('ReorderPinnedObjectsResultSchema', () => {
  it('validates result with updated objects', () => {
    const result: ReorderPinnedObjectsResult = {
      updatedObjectIds: [VALID_ULID_1, VALID_ULID_2, VALID_ULID_3],
    };
    const parsed = ReorderPinnedObjectsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validates result with empty array', () => {
    const result: ReorderPinnedObjectsResult = {
      updatedObjectIds: [],
    };
    const parsed = ReorderPinnedObjectsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing updated object IDs field', () => {
    const result = {};
    const parsed = ReorderPinnedObjectsResultSchema.safeParse(result);
    expect(parsed.success).toBe(false);
  });
});

// ============================================================================
// ListPinnedObjectsResultSchema
// ============================================================================

describe('ListPinnedObjectsResultSchema', () => {
  it('validates list result with pinned objects', () => {
    const result: ListPinnedObjectsResult = {
      pinnedObjects: [
        {
          id: VALID_ULID_1,
          title: 'Important Document',
          typeId: VALID_ULID_2,
          typeKey: 'page',
          updatedAt: new Date(),
          pinnedAt: new Date(),
          order: 0,
        },
      ],
    };
    const parsed = ListPinnedObjectsResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('rejects missing pinnedObjects field', () => {
    const parsed = ListPinnedObjectsResultSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });
});

// ============================================================================
// PinningErrorCodeSchema
// ============================================================================

describe('PinningErrorCodeSchema', () => {
  it('validates all defined error codes', () => {
    const errorCodes = ['PINNING_NOT_FOUND', 'PINNING_ALREADY_PINNED'];
    for (const code of errorCodes) {
      const result = PinningErrorCodeSchema.safeParse(code);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid error code', () => {
    const result = PinningErrorCodeSchema.safeParse('INVALID_CODE');
    expect(result.success).toBe(false);
  });
});
