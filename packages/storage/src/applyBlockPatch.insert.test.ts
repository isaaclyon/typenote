/**
 * block.insert operation tests for applyBlockPatch.
 * Tests insertion of blocks at various positions with content and meta validation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  type TestContext,
  createTestContext,
  cleanupTestContext,
  createTestBlock,
  createTestObject,
  getBlockById,
  generateId,
  applyBlockPatch,
  type ApplyBlockPatchInput,
} from './applyBlockPatch.test-helpers.js';

describe('applyBlockPatch - block.insert', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('basic insertion', () => {
    it('inserts root block with place: end', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello' }] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(blockId);
      }

      // Verify block exists in database
      const block = getBlockById(ctx.db, blockId);
      expect(block).not.toBeNull();
      expect(block?.blockType).toBe('paragraph');
      expect(block?.parentBlockId).toBeNull();
    });

    it('inserts child block under parent', () => {
      const parentId = createTestBlock(ctx.db, ctx.objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      const childId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: childId,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, childId);
      expect(block?.parentBlockId).toBe(parentId);
    });

    it('uses explicit orderKey when provided', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            orderKey: 'custom-order-key',
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      expect(block?.orderKey).toBe('custom-order-key');
    });

    it('stores content as JSON', () => {
      const blockId = generateId();
      const content = { inline: [{ t: 'text', text: 'Test content' }] };
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      expect(JSON.parse(block?.content ?? '{}')).toEqual(content);
    });

    it('stores meta as JSON', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
            meta: { collapsed: true },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const block = getBlockById(ctx.db, blockId);
      expect(JSON.parse(block?.meta ?? '{}')).toEqual({ collapsed: true });
    });
  });

  describe('placement hints', () => {
    it('inserts at start before existing siblings', () => {
      const existing = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(ctx.db, newBlockId);
      const existingBlock = getBlockById(ctx.db, existing);
      expect(newBlock).not.toBeNull();
      expect(existingBlock).not.toBeNull();
      // New block should come before existing
      const newKey = newBlock?.orderKey ?? '';
      const existingKey = existingBlock?.orderKey ?? '';
      expect(newKey < existingKey).toBe(true);
    });

    it('inserts before specified sibling', () => {
      const block1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(ctx.db, ctx.objectId, null, 'a2', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'before', siblingBlockId: block2 },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(ctx.db, newBlockId);
      const b1 = getBlockById(ctx.db, block1);
      const b2 = getBlockById(ctx.db, block2);
      expect(newBlock).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      // New block should be between block1 and block2
      const newKey = newBlock?.orderKey ?? '';
      const key1 = b1?.orderKey ?? '';
      const key2 = b2?.orderKey ?? '';
      expect(newKey > key1).toBe(true);
      expect(newKey < key2).toBe(true);
    });

    it('inserts after specified sibling', () => {
      const block1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const block2 = createTestBlock(ctx.db, ctx.objectId, null, 'a2', 'paragraph', {
        inline: [],
      });
      const newBlockId = generateId();

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'after', siblingBlockId: block1 },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      const newBlock = getBlockById(ctx.db, newBlockId);
      const b1 = getBlockById(ctx.db, block1);
      const b2 = getBlockById(ctx.db, block2);
      expect(newBlock).not.toBeNull();
      expect(b1).not.toBeNull();
      expect(b2).not.toBeNull();
      // New block should be between block1 and block2
      const newKey = newBlock?.orderKey ?? '';
      const key1 = b1?.orderKey ?? '';
      const key2 = b2?.orderKey ?? '';
      expect(newKey > key1).toBe(true);
      expect(newKey < key2).toBe(true);
    });

    it('returns NOT_FOUND_BLOCK for non-existent sibling in before', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'before', siblingBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });
  });

  describe('tree invariants', () => {
    it('returns NOT_FOUND_BLOCK for non-existent parent', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: '01HGW2N7XYZABCDEFGHJKMNPQR',
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND_BLOCK');
      }
    });

    it('returns INVARIANT_PARENT_DELETED for deleted parent', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a', 'paragraph', {
        inline: [],
      });
      // Soft-delete the parent
      ctx.db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), parent]);

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: parent,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVARIANT_PARENT_DELETED');
      }
    });

    it('returns INVARIANT_CROSS_OBJECT for parent in different object', () => {
      const otherObjectId = createTestObject(ctx.db, ctx.typeId, 'Other Page');
      const otherParent = createTestBlock(ctx.db, otherObjectId, null, 'a', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: otherParent,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
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

  describe('content validation', () => {
    it('validates paragraph content schema', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Valid' }] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
    });

    it('returns VALIDATION error for invalid content', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { inline: [] }, // Missing required 'level' field
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('VALIDATION');
      }
    });
  });

  describe('result tracking', () => {
    it('includes blockId in applied.insertedBlockIds', () => {
      const blockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toEqual([blockId]);
      }
    });

    it('tracks multiple inserts', () => {
      const blockId1 = generateId();
      const blockId2 = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(blockId1);
        expect(result.result.applied.insertedBlockIds).toContain(blockId2);
      }
    });
  });
});
