/**
 * block.delete operation tests for applyBlockPatch.
 * Tests soft deletion, subtree deletion, and idempotent deletion.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  type TestContext,
  createTestContext,
  cleanupTestContext,
  createTestBlock,
  createTestObject,
  getBlockById,
  applyBlockPatch,
  type ApplyBlockPatchInput,
} from './applyBlockPatch.test-helpers.js';

describe('applyBlockPatch - block.delete', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('basic deletes', () => {
    it('soft-deletes a block (sets deletedAt)', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      expect(block?.deletedAt).not.toBeNull();
    });

    it('deletes block without affecting siblings', () => {
      const sibling1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const toDelete = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const sibling2 = createTestBlock(ctx.db, ctx.objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: toDelete,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      // Deleted block has deletedAt set
      const deletedBlock = getBlockById(ctx.db, toDelete);
      expect(deletedBlock?.deletedAt).not.toBeNull();
      // Siblings unchanged
      const sib1 = getBlockById(ctx.db, sibling1);
      const sib2 = getBlockById(ctx.db, sibling2);
      expect(sib1?.deletedAt).toBeNull();
      expect(sib2?.deletedAt).toBeNull();
    });
  });

  describe('subtree deletion', () => {
    it('with subtree: true, deletes all descendants', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const grandchild = createTestBlock(ctx.db, ctx.objectId, child, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      // All blocks should be deleted
      expect(getBlockById(ctx.db, parent)?.deletedAt).not.toBeNull();
      expect(getBlockById(ctx.db, child)?.deletedAt).not.toBeNull();
      expect(getBlockById(ctx.db, grandchild)?.deletedAt).not.toBeNull();
    });

    it('without subtree, only deletes the block itself', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      // Parent deleted
      expect(getBlockById(ctx.db, parent)?.deletedAt).not.toBeNull();
      // Child NOT deleted (orphaned)
      expect(getBlockById(ctx.db, child)?.deletedAt).toBeNull();
    });

    it('subtree deletion includes multiple levels', () => {
      const root = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const level1a = createTestBlock(ctx.db, ctx.objectId, root, 'a0', 'paragraph', {
        inline: [],
      });
      const level1b = createTestBlock(ctx.db, ctx.objectId, root, 'a1', 'paragraph', {
        inline: [],
      });
      const level2 = createTestBlock(ctx.db, ctx.objectId, level1a, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: root,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      expect(getBlockById(ctx.db, root)?.deletedAt).not.toBeNull();
      expect(getBlockById(ctx.db, level1a)?.deletedAt).not.toBeNull();
      expect(getBlockById(ctx.db, level1b)?.deletedAt).not.toBeNull();
      expect(getBlockById(ctx.db, level2)?.deletedAt).not.toBeNull();
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('is idempotent for already deleted block', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      // Pre-delete the block
      ctx.db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      // Should succeed (idempotent)
      expect(result.success).toBe(true);
      if (result.success) {
        // Block should still be tracked as deleted
        expect(result.result.applied.deletedBlockIds).toContain(blockId);
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for block in different object', () => {
      const otherObjectId = createTestObject(ctx.db, ctx.typeId, 'Other Page');
      const otherBlockId = createTestBlock(ctx.db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: otherBlockId,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CROSS_OBJECT');
      }
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.deletedBlockIds', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(blockId);
      }
    });

    it('tracks all deleted blocks in subtree deletion', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: parent,
            subtree: true,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(parent);
        expect(result.result.applied.deletedBlockIds).toContain(child);
      }
    });

    it('tracks multiple deletes', () => {
      const block1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: block1,
          },
          {
            op: 'block.delete',
            blockId: block2,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.deletedBlockIds).toContain(block1);
        expect(result.result.applied.deletedBlockIds).toContain(block2);
      }
    });
  });
});
