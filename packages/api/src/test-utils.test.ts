/**
 * Tests for test-utils.ts
 *
 * These are meta-tests that verify the test helpers themselves work correctly.
 * This is important for mutation testing to ensure the helpers don't silently pass.
 */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VALID_ULID,
  VALID_ULID_2,
  VALID_ULID_3,
  expectValid,
  expectInvalid,
  parseWith,
  makeInsertOp,
  makeUpdateOp,
  makeMoveOp,
  makeDeleteOp,
  makePatchInput,
  makePatchResult,
} from './test-utils.js';

// =============================================================================
// Test Constants
// =============================================================================

describe('Test Constants', () => {
  it('VALID_ULID is a 26-character string', () => {
    expect(VALID_ULID).toHaveLength(26);
    expect(typeof VALID_ULID).toBe('string');
  });

  it('VALID_ULID_2 is a 26-character string', () => {
    expect(VALID_ULID_2).toHaveLength(26);
    expect(typeof VALID_ULID_2).toBe('string');
  });

  it('VALID_ULID_3 is a 26-character string', () => {
    expect(VALID_ULID_3).toHaveLength(26);
    expect(typeof VALID_ULID_3).toBe('string');
  });

  it('all ULIDs are unique', () => {
    const ulids = [VALID_ULID, VALID_ULID_2, VALID_ULID_3];
    const uniqueUlids = new Set(ulids);
    expect(uniqueUlids.size).toBe(3);
  });
});

// =============================================================================
// Schema Test Helpers
// =============================================================================

describe('expectValid', () => {
  const simpleSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('passes for valid data', () => {
    // Should not throw
    expectValid(simpleSchema, { name: 'Alice', age: 30 });
  });

  it('throws/fails for invalid data', () => {
    // This tests that expectValid actually fails when given invalid data
    // The mutant emptied the block statement, which would make this silently pass
    expect(() => {
      expectValid(simpleSchema, { name: 'Alice', age: 'not a number' });
    }).toThrow();
  });

  it('throws with descriptive error message for invalid data', () => {
    expect(() => {
      expectValid(simpleSchema, { name: 123, age: 'wrong' });
    }).toThrow(/Expected valid but got errors/);
  });

  it('fails when required field is missing', () => {
    expect(() => {
      expectValid(simpleSchema, { name: 'Alice' });
    }).toThrow();
  });
});

describe('expectInvalid', () => {
  const simpleSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('passes for invalid data', () => {
    // Should not throw - the data is invalid as expected
    expectInvalid(simpleSchema, { name: 'Alice', age: 'not a number' });
  });

  it('throws/fails for valid data', () => {
    // This tests that expectInvalid actually fails when given valid data
    expect(() => {
      expectInvalid(simpleSchema, { name: 'Alice', age: 30 });
    }).toThrow();
  });

  it('validates path checking correctly', () => {
    // Test that expectedPath parameter works correctly
    // The mutant at line 49 changed the conditional check
    expectInvalid(simpleSchema, { name: 'Alice', age: 'wrong' }, 'age');
  });

  it('fails when expected path is not in error', () => {
    // Error is at 'age', but we claim it should be at 'name'
    expect(() => {
      expectInvalid(simpleSchema, { name: 'Alice', age: 'wrong' }, 'name');
    }).toThrow();
  });

  it('handles nested paths correctly', () => {
    const nestedSchema = z.object({
      user: z.object({
        profile: z.object({
          email: z.string().email(),
        }),
      }),
    });

    expectInvalid(
      nestedSchema,
      { user: { profile: { email: 'not-an-email' } } },
      'user.profile.email'
    );
  });

  it('works without expectedPath parameter', () => {
    expectInvalid(simpleSchema, { name: 123 });
  });
});

describe('parseWith', () => {
  const schema = z.object({ value: z.number() });

  it('returns success result for valid data', () => {
    const result = parseWith(schema, { value: 42 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe(42);
    }
  });

  it('returns failure result for invalid data', () => {
    const result = parseWith(schema, { value: 'not a number' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThan(0);
    }
  });
});

// =============================================================================
// Test Data Builders
// =============================================================================

describe('makeInsertOp', () => {
  it('returns correct structure with defaults', () => {
    const op = makeInsertOp();

    expect(op.op).toBe('block.insert');
    expect(op.blockId).toBe(VALID_ULID);
    expect(op.parentBlockId).toBeNull();
    expect(op.blockType).toBe('paragraph');
    expect(op.content).toEqual({ inline: [] });
  });

  it('content.inline is an empty array by default', () => {
    const op = makeInsertOp();

    // This kills the ArrayDeclaration mutation that changed [] to something else
    expect(Array.isArray(op.content.inline)).toBe(true);
    expect(op.content.inline).toHaveLength(0);
  });

  it('applies overrides correctly', () => {
    const op = makeInsertOp({
      blockId: VALID_ULID_2,
      blockType: 'heading',
      content: { inline: [{ t: 'text', text: 'Hello' }] },
    });

    expect(op.blockId).toBe(VALID_ULID_2);
    expect(op.blockType).toBe('heading');
    expect(op.content).toEqual({ inline: [{ t: 'text', text: 'Hello' }] });
  });

  it('preserves required properties when overriding', () => {
    const op = makeInsertOp({ blockType: 'code_block' });

    // Non-overridden properties should remain
    expect(op.op).toBe('block.insert');
    expect(op.blockId).toBe(VALID_ULID);
  });
});

describe('makeUpdateOp', () => {
  it('returns correct structure with defaults', () => {
    const op = makeUpdateOp();

    expect(op.op).toBe('block.update');
    expect(op.blockId).toBe(VALID_ULID);
    expect(op.patch).toEqual({ content: { inline: [] } });
  });

  it('patch.content.inline is an empty array by default', () => {
    const op = makeUpdateOp();

    // This kills the ObjectLiteral mutation at line 88
    expect(op.patch).toBeDefined();
    expect(op.patch.content).toBeDefined();
    expect(Array.isArray(op.patch.content.inline)).toBe(true);
    expect(op.patch.content.inline).toHaveLength(0);
  });

  it('applies overrides correctly', () => {
    const op = makeUpdateOp({
      blockId: VALID_ULID_2,
      patch: { content: { inline: [{ t: 'text', text: 'Updated' }] } },
    });

    expect(op.blockId).toBe(VALID_ULID_2);
    expect(op.patch.content.inline).toEqual([{ t: 'text', text: 'Updated' }]);
  });
});

describe('makeMoveOp', () => {
  it('returns correct structure with defaults', () => {
    const op = makeMoveOp();

    expect(op.op).toBe('block.move');
    expect(op.blockId).toBe(VALID_ULID);
    expect(op.newParentBlockId).toBeNull();
  });

  it('applies overrides correctly', () => {
    const op = makeMoveOp({
      blockId: VALID_ULID_2,
      newParentBlockId: VALID_ULID_3,
    });

    expect(op.blockId).toBe(VALID_ULID_2);
    expect(op.newParentBlockId).toBe(VALID_ULID_3);
  });
});

describe('makeDeleteOp', () => {
  it('returns correct structure with defaults', () => {
    const op = makeDeleteOp();

    expect(op.op).toBe('block.delete');
    expect(op.blockId).toBe(VALID_ULID);
  });

  it('applies overrides correctly', () => {
    const op = makeDeleteOp({
      blockId: VALID_ULID_2,
      subtree: true,
    });

    expect(op.blockId).toBe(VALID_ULID_2);
    expect(op.subtree).toBe(true);
  });
});

describe('makePatchInput', () => {
  it('returns correct structure with defaults', () => {
    const input = makePatchInput();

    expect(input.apiVersion).toBe('v1');
    expect(input.objectId).toBe(VALID_ULID);
    expect(input.ops).toEqual([]);
  });

  it('ops is an empty array by default', () => {
    const input = makePatchInput();

    // This kills the ArrayDeclaration mutation
    expect(Array.isArray(input.ops)).toBe(true);
    expect(input.ops).toHaveLength(0);
  });

  it('applies overrides correctly', () => {
    const input = makePatchInput({
      objectId: VALID_ULID_2,
      ops: [makeInsertOp()],
    });

    expect(input.objectId).toBe(VALID_ULID_2);
    expect(input.ops).toHaveLength(1);
  });
});

describe('makePatchResult', () => {
  it('returns correct structure with defaults', () => {
    const result = makePatchResult();

    expect(result.apiVersion).toBe('v1');
    expect(result.objectId).toBe(VALID_ULID);
    expect(result.previousDocVersion).toBe(0);
    expect(result.newDocVersion).toBe(1);
    expect(result.applied).toEqual({
      insertedBlockIds: [],
      updatedBlockIds: [],
      movedBlockIds: [],
      deletedBlockIds: [],
    });
  });

  it('applied arrays are empty by default', () => {
    const result = makePatchResult();

    // This kills the ArrayDeclaration mutations at lines 138-141
    expect(Array.isArray(result.applied.insertedBlockIds)).toBe(true);
    expect(result.applied.insertedBlockIds).toHaveLength(0);

    expect(Array.isArray(result.applied.updatedBlockIds)).toBe(true);
    expect(result.applied.updatedBlockIds).toHaveLength(0);

    expect(Array.isArray(result.applied.movedBlockIds)).toBe(true);
    expect(result.applied.movedBlockIds).toHaveLength(0);

    expect(Array.isArray(result.applied.deletedBlockIds)).toBe(true);
    expect(result.applied.deletedBlockIds).toHaveLength(0);
  });

  it('applies overrides correctly', () => {
    const result = makePatchResult({
      objectId: VALID_ULID_2,
      newDocVersion: 5,
      applied: {
        insertedBlockIds: [VALID_ULID],
        updatedBlockIds: [VALID_ULID_2],
        movedBlockIds: [],
        deletedBlockIds: [],
      },
    });

    expect(result.objectId).toBe(VALID_ULID_2);
    expect(result.newDocVersion).toBe(5);
    expect(result.applied.insertedBlockIds).toEqual([VALID_ULID]);
    expect(result.applied.updatedBlockIds).toEqual([VALID_ULID_2]);
  });
});
