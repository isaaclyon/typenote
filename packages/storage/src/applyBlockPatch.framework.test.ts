/**
 * Framework tests for applyBlockPatch.
 * Tests input validation, object existence, version handling, idempotency, and result structure.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  type TestContext,
  createTestContext,
  cleanupTestContext,
  applyBlockPatch,
  type ApplyBlockPatchInput,
} from './applyBlockPatch.test-helpers.js';

describe('applyBlockPatch - framework', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('input validation', () => {
    it('returns validation error for invalid apiVersion', () => {
      const input = {
        apiVersion: 'v2' as 'v1', // wrong version
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });

    it('returns validation error for invalid objectId format', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: 'not-a-ulid',
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });
  });

  describe('object existence', () => {
    it('returns NOT_FOUND_OBJECT for non-existent object', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: '01HGW2N7XYZABCDEFGHJKMNPQR', // Valid ULID format, doesn't exist
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });

    it('returns NOT_FOUND_OBJECT for deleted object', () => {
      ctx.db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [Date.now(), ctx.objectId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_OBJECT');
      }
    });
  });

  describe('version conflict', () => {
    it('succeeds when baseDocVersion matches current', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        baseDocVersion: 0,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
    });

    it('returns CONFLICT_VERSION when baseDocVersion does not match', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        baseDocVersion: 5, // Object has version 0
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CONFLICT_VERSION');
        expect(result.error.details).toEqual({ expected: 5, actual: 0 });
      }
    });

    it('succeeds without baseDocVersion (last-writer-wins)', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('idempotency', () => {
    it('returns cached result for same idempotencyKey', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        idempotencyKey: 'test-key-1',
        ops: [],
      };

      // First call
      const result1 = applyBlockPatch(ctx.db, input);
      expect(result1.success).toBe(true);

      // Second call with same key
      const result2 = applyBlockPatch(ctx.db, input);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        // Should return same result
        expect(result2.result.previousDocVersion).toBe(result1.result.previousDocVersion);
        expect(result2.result.newDocVersion).toBe(result1.result.newDocVersion);
      }
    });

    it('applies patch when idempotencyKey is new', () => {
      const input1: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        idempotencyKey: 'key-1',
        ops: [],
      };

      const input2: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        idempotencyKey: 'key-2',
        ops: [],
      };

      const result1 = applyBlockPatch(ctx.db, input1);
      const result2 = applyBlockPatch(ctx.db, input2);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      if (result1.success && result2.success) {
        // Each should increment version
        expect(result1.result.newDocVersion).toBe(1);
        expect(result2.result.newDocVersion).toBe(2);
      }
    });

    it('works without idempotencyKey', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
    });
  });

  describe('version increment', () => {
    it('increments docVersion by 1 on success', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.previousDocVersion).toBe(0);
        expect(result.result.newDocVersion).toBe(1);
      }

      // Verify in database
      const obj = ctx.db.all<{ doc_version: number }>(
        'SELECT doc_version FROM objects WHERE id = ?',
        [ctx.objectId]
      );
      expect(obj[0]?.doc_version).toBe(1);
    });

    it('returns previous and new version in result', () => {
      // Set initial version to 5
      ctx.db.run('UPDATE objects SET doc_version = 5 WHERE id = ?', [ctx.objectId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.previousDocVersion).toBe(5);
        expect(result.result.newDocVersion).toBe(6);
      }
    });
  });

  describe('empty ops', () => {
    it('succeeds with empty ops array (increments version)', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toEqual([]);
        expect(result.result.applied.updatedBlockIds).toEqual([]);
        expect(result.result.applied.movedBlockIds).toEqual([]);
        expect(result.result.applied.deletedBlockIds).toEqual([]);
      }
    });
  });

  describe('result structure', () => {
    it('returns correct result structure', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.apiVersion).toBe('v1');
        expect(result.result.objectId).toBe(ctx.objectId);
        expect(typeof result.result.previousDocVersion).toBe('number');
        expect(typeof result.result.newDocVersion).toBe('number');
        expect(result.result.applied).toBeDefined();
      }
    });
  });
});
