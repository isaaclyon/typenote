/**
 * Integration tests for applyBlockPatch.
 * Tests multi-op patches, version handling, and full document workflows.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  type TestContext,
  createTestContext,
  cleanupTestContext,
  createTestBlock,
  getBlockById,
  generateId,
  applyBlockPatch,
  type ApplyBlockPatchInput,
} from './applyBlockPatch.test-helpers.js';

describe('applyBlockPatch - integration tests', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  describe('multi-op patches', () => {
    it('insert, update, move in single patch', () => {
      const existingBlock = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [{ t: 'text', text: 'Existing' }],
      });

      const newBlockId = generateId();
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          // Insert new block
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'New block' }] },
          },
          // Update existing block
          {
            op: 'block.update',
            blockId: existingBlock,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
          // Move new block under existing
          {
            op: 'block.move',
            blockId: newBlockId,
            newParentBlockId: existingBlock,
            place: { where: 'end' },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(newBlockId);
        expect(result.result.applied.updatedBlockIds).toContain(existingBlock);
        expect(result.result.applied.movedBlockIds).toContain(newBlockId);
      }

      // Verify state
      const movedBlock = getBlockById(ctx.db, newBlockId);
      expect(movedBlock?.parentBlockId).toBe(existingBlock);

      const updatedBlock = getBlockById(ctx.db, existingBlock);
      const content = JSON.parse(updatedBlock?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });

    it('insert and delete in same patch', () => {
      const toDelete = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
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
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'New' }] },
          },
          {
            op: 'block.delete',
            blockId: toDelete,
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.insertedBlockIds).toContain(newBlockId);
        expect(result.result.applied.deletedBlockIds).toContain(toDelete);
      }

      // Verify new block exists
      expect(getBlockById(ctx.db, newBlockId)).not.toBeNull();
      // Verify old block is deleted
      expect(getBlockById(ctx.db, toDelete)?.deletedAt).not.toBeNull();
    });

    it('move and update in same patch', () => {
      const parent = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });
      const child = createTestBlock(ctx.db, ctx.objectId, null, 'a1', 'paragraph', {
        inline: [{ t: 'text', text: 'Original' }],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: child,
            newParentBlockId: parent,
            place: { where: 'end' },
          },
          {
            op: 'block.update',
            blockId: child,
            patch: {
              content: { inline: [{ t: 'text', text: 'Updated' }] },
            },
          },
        ],
      };

      const result = applyBlockPatch(ctx.db, input);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.applied.movedBlockIds).toContain(child);
        expect(result.result.applied.updatedBlockIds).toContain(child);
      }

      const block = getBlockById(ctx.db, child);
      expect(block?.parentBlockId).toBe(parent);
      const content = JSON.parse(block?.content ?? '{}');
      expect(content.inline[0].text).toBe('Updated');
    });
  });

  describe('version handling', () => {
    it('increments version once per patch, not per op', () => {
      const block1 = createTestBlock(ctx.db, ctx.objectId, null, 'a0', 'paragraph', {
        inline: [],
      });

      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.update',
            blockId: block1,
            patch: { content: { inline: [{ t: 'text', text: 'One' }] } },
          },
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [] },
          },
          {
            op: 'block.insert',
            blockId: generateId(),
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
        // Version should only increment by 1, not by 3
        expect(result.result.previousDocVersion).toBe(0);
        expect(result.result.newDocVersion).toBe(1);
      }
    });

    it('consecutive patches increment version sequentially', () => {
      const input1: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };
      const input2: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };
      const input3: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [],
      };

      const result1 = applyBlockPatch(ctx.db, input1);
      const result2 = applyBlockPatch(ctx.db, input2);
      const result3 = applyBlockPatch(ctx.db, input3);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);

      if (result1.success && result2.success && result3.success) {
        expect(result1.result.newDocVersion).toBe(1);
        expect(result2.result.newDocVersion).toBe(2);
        expect(result3.result.newDocVersion).toBe(3);
      }
    });
  });

  describe('full workflow', () => {
    it('create tree, edit, rearrange, delete', () => {
      // Step 1: Create initial tree structure
      const rootId = generateId();
      const child1Id = generateId();
      const child2Id = generateId();

      const createResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: rootId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Title' }] },
          },
          {
            op: 'block.insert',
            blockId: child1Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'First paragraph' }] },
          },
          {
            op: 'block.insert',
            blockId: child2Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Second paragraph' }] },
          },
        ],
      });

      expect(createResult.success).toBe(true);
      if (createResult.success) {
        expect(createResult.result.applied.insertedBlockIds).toHaveLength(3);
        expect(createResult.result.newDocVersion).toBe(1);
      }

      // Step 2: Edit the title
      const editResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId: rootId,
            patch: {
              content: { level: 1, inline: [{ t: 'text', text: 'Updated Title' }] },
            },
          },
        ],
      });

      expect(editResult.success).toBe(true);
      if (editResult.success) {
        expect(editResult.result.newDocVersion).toBe(2);
      }

      // Step 3: Rearrange - move child2 before child1
      const rearrangeResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.move',
            blockId: child2Id,
            newParentBlockId: rootId,
            place: { where: 'before', siblingBlockId: child1Id },
          },
        ],
      });

      expect(rearrangeResult.success).toBe(true);
      if (rearrangeResult.success) {
        expect(rearrangeResult.result.newDocVersion).toBe(3);
      }

      // Verify order: child2 should now come before child1
      const c1 = getBlockById(ctx.db, child1Id);
      const c2 = getBlockById(ctx.db, child2Id);
      expect((c2?.orderKey ?? '') < (c1?.orderKey ?? '')).toBe(true);

      // Step 4: Delete child1
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        baseDocVersion: 3,
        ops: [
          {
            op: 'block.delete',
            blockId: child1Id,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);
      if (deleteResult.success) {
        expect(deleteResult.result.newDocVersion).toBe(4);
      }

      // Verify final state
      expect(getBlockById(ctx.db, rootId)?.deletedAt).toBeNull();
      expect(getBlockById(ctx.db, child2Id)?.deletedAt).toBeNull();
      expect(getBlockById(ctx.db, child1Id)?.deletedAt).not.toBeNull();
    });

    it('handles complex nested operations', () => {
      // Create: root -> [section1 -> [para1, para2], section2 -> [para3]]
      const rootId = generateId();
      const section1Id = generateId();
      const section2Id = generateId();
      const para1Id = generateId();
      const para2Id = generateId();
      const para3Id = generateId();

      const createResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.insert',
            blockId: rootId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Document' }] },
          },
          {
            op: 'block.insert',
            blockId: section1Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Section 1' }] },
          },
          {
            op: 'block.insert',
            blockId: para1Id,
            parentBlockId: section1Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 1' }] },
          },
          {
            op: 'block.insert',
            blockId: para2Id,
            parentBlockId: section1Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 2' }] },
          },
          {
            op: 'block.insert',
            blockId: section2Id,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 2, inline: [{ t: 'text', text: 'Section 2' }] },
          },
          {
            op: 'block.insert',
            blockId: para3Id,
            parentBlockId: section2Id,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Para 3' }] },
          },
        ],
      });

      expect(createResult.success).toBe(true);

      // Move para2 from section1 to section2
      const moveResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.move',
            blockId: para2Id,
            newParentBlockId: section2Id,
            place: { where: 'end' },
          },
        ],
      });

      expect(moveResult.success).toBe(true);
      expect(getBlockById(ctx.db, para2Id)?.parentBlockId).toBe(section2Id);

      // Delete section1 with subtree
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: ctx.objectId,
        ops: [
          {
            op: 'block.delete',
            blockId: section1Id,
            subtree: true,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);
      if (deleteResult.success) {
        // section1 and para1 should be deleted
        expect(deleteResult.result.applied.deletedBlockIds).toContain(section1Id);
        expect(deleteResult.result.applied.deletedBlockIds).toContain(para1Id);
        // para2 was moved out, should NOT be in deleted list
        expect(deleteResult.result.applied.deletedBlockIds).not.toContain(para2Id);
      }

      // Verify para2 is still alive (it was moved before delete)
      expect(getBlockById(ctx.db, para2Id)?.deletedAt).toBeNull();
    });
  });
});
