/**
 * block.move operation tests for applyBlockPatch.
 * Tests moving blocks between parents, cycle detection, and subtree behavior.
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

describe('applyBlockPatch - block.move', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('basic moves', () => {
    it('moves block to a new parent', () => {
      const parent1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const parent2 = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, parent1, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: child,
            newParentBlockId: parent2,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(ctx.db, child);
      expect(movedBlock?.parentBlockId).toBe(parent2);
    });

    it('moves block to root (null parent)', () => {
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
            op: 'block.move',
            blockId: child,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(ctx.db, child);
      expect(movedBlock?.parentBlockId).toBeNull();
    });

    it('updates orderKey on move', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling = createTestBlock(ctx.db, ctx.objectId, parent, 'a1', 'paragraph', {
        inline: [],
      });
      const toMove = createTestBlock(ctx.db, ctx.objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: toMove,
            newParentBlockId: parent,
            place: { where: 'before', siblingBlockId: sibling },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(ctx.db, toMove);
      const siblingBlock = getBlockById(ctx.db, sibling);
      // Moved block should be before sibling (lexicographic comparison)
      const movedKey = movedBlock?.orderKey ?? '';
      const siblingKey = siblingBlock?.orderKey ?? '';
      expect(movedKey < siblingKey).toBe(true);
    });

    it('uses explicit orderKey when provided', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const toMove = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: toMove,
            newParentBlockId: parent,
            orderKey: 'explicit-key',
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(ctx.db, toMove);
      expect(movedBlock?.orderKey).toBe('explicit-key');
    });
  });

  describe('block existence', () => {
    it('returns NOT_FOUND_BLOCK for non-existent block', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns NOT_FOUND_BLOCK for deleted block', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      ctx.db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
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
            op: 'block.move',
            blockId: otherBlockId,
            newParentBlockId: null,
            place: { where: 'end' },
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

  describe('parent validation', () => {
    it('returns NOT_FOUND_BLOCK for non-existent new parent', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_PARENT_DELETED for deleted new parent', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      ctx.db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), parent]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: parent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_PARENT_DELETED');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for new parent in different object', () => {
      const otherObjectId = createTestObject(ctx.db, ctx.typeId, 'Other Page');
      const otherParent = createTestBlock(ctx.db, otherObjectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: otherParent,
            place: { where: 'end' },
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

  describe('cycle detection', () => {
    it('returns INVARIANT_CYCLE when moving block under itself', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: blockId,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CYCLE');
      }
    });

    it('returns INVARIANT_CYCLE when moving block under its descendant', () => {
      const grandparent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const parent = createTestBlock(ctx.db, ctx.objectId, grandparent, 'a0', 'paragraph', {
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
            op: 'block.move',
            blockId: grandparent,
            newParentBlockId: child,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_CYCLE');
      }
    });

    it('allows moving to sibling (no cycle)', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling1 = createTestBlock(ctx.db, ctx.objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const sibling2 = createTestBlock(ctx.db, ctx.objectId, parent, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: sibling1,
            newParentBlockId: sibling2,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const movedBlock = getBlockById(ctx.db, sibling1);
      expect(movedBlock?.parentBlockId).toBe(sibling2);
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.movedBlockIds', () => {
      const blockId = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const newParent = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(blockId);
      }
    });

    it('tracks multiple moves', () => {
      const newParent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block1 = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(ctx.db, ctx.objectId, null, 'a2', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: block1,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
          {
            op: 'block.move',
            blockId: block2,
            newParentBlockId: newParent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(block1);
        expect(result.result.applied.movedBlockIds).toContain(block2);
      }
    });
  });

  describe('subtree behavior', () => {
    it('children remain attached to moved parent', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, parent, 'a0', 'paragraph', {
        inline: [],
      });
      const newGrandparent = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: parent,
            newParentBlockId: newGrandparent,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      // Parent moved under newGrandparent
      const movedParent = getBlockById(ctx.db, parent);
      expect(movedParent?.parentBlockId).toBe(newGrandparent);
      // Child still attached to parent
      const childBlock = getBlockById(ctx.db, child);
      expect(childBlock?.parentBlockId).toBe(parent);
    });
  });
});
