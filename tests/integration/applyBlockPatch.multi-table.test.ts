/**
 * P0 Integration tests for applyBlockPatch multi-table orchestration.
 *
 * Tests atomic operations across blocks, objects, refs, idempotency, and FTS tables.
 */

import { describe, it, expect } from 'vitest';
import { eq, and, isNull } from 'drizzle-orm';
import {
  setupIntegrationContext,
  createPage,
  applyBlockPatch,
  generateId,
} from './helpers/testContext.js';
import {
  paragraph,
  paragraphWithInline,
  objectRef,
  buildDocumentTree,
  buildDeepHierarchy,
} from './helpers/fixtures.js';
import {
  assertPatchApplied,
  assertApiError,
  assertPatchSuccess,
  assertBlockExists,
  assertBlockDeleted,
  getDocVersion,
} from './helpers/assertions.js';
import { refs, blocks, idempotency } from '@typenote/storage';
import type { ParagraphContent } from '@typenote/api';

describe('applyBlockPatch multi-table orchestration', () => {
  const getCtx = setupIntegrationContext();

  describe('insert block updates all tables atomically', () => {
    it('inserts block and updates objects.docVersion', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const blockId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Hello world'),
          },
        ],
      });

      assertPatchSuccess(result, { newDocVersion: 1, insertedBlockIds: [blockId] });
      assertPatchApplied(ctx.db, objectId, { docVersion: 1, blockCount: 1 });
      assertBlockExists(ctx.db, blockId, { objectId, parentBlockId: null, blockType: 'paragraph' });
    });

    it('inserts block with reference and indexes to refs table', () => {
      const ctx = getCtx();
      const sourceObjectId = createPage(ctx.db, ctx.pageTypeId, 'Source Page');
      const targetObjectId = createPage(ctx.db, ctx.pageTypeId, 'Target Page');
      const blockId = generateId();

      const contentWithRef: ParagraphContent = {
        inline: [{ t: 'text', text: 'See also: ' }, objectRef(targetObjectId)],
      };

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: contentWithRef,
          },
        ],
      });

      assertPatchSuccess(result);
      assertPatchApplied(ctx.db, sourceObjectId, { docVersion: 1, blockCount: 1, refCount: 1 });

      // Verify refs table entry
      const refRows = ctx.db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refRows).toHaveLength(1);
      expect(refRows[0]?.sourceObjectId).toBe(sourceObjectId);
      expect(refRows[0]?.targetObjectId).toBe(targetObjectId);
    });

    it('stores idempotency result when key provided', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const blockId = generateId();
      const idempotencyKey = 'test-key-123';

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Hello'),
          },
        ],
      });

      assertPatchSuccess(result);

      // Verify idempotency table entry
      const idempotencyRows = ctx.db
        .select()
        .from(idempotency)
        .where(and(eq(idempotency.objectId, objectId), eq(idempotency.key, idempotencyKey)))
        .all();
      expect(idempotencyRows).toHaveLength(1);
      expect(idempotencyRows[0]?.resultJson).toContain(blockId);
    });
  });

  describe('update block re-indexes refs and FTS', () => {
    it('re-indexes refs when content changes from ref A to ref B', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const targetA = createPage(ctx.db, ctx.pageTypeId, 'Target A');
      const targetB = createPage(ctx.db, ctx.pageTypeId, 'Target B');
      const blockId = generateId();

      // Insert block with ref to A
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphWithInline([objectRef(targetA)]),
          },
        ],
      });

      // Verify ref to A exists
      let refRows = ctx.db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refRows).toHaveLength(1);
      expect(refRows[0]?.targetObjectId).toBe(targetA);

      // Update block to ref B
      const updateResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraphWithInline([objectRef(targetB)]),
            },
          },
        ],
      });

      assertPatchSuccess(updateResult, { newDocVersion: 2 });

      // Verify ref to A is gone, ref to B exists
      refRows = ctx.db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refRows).toHaveLength(1);
      expect(refRows[0]?.targetObjectId).toBe(targetB);
    });

    it('removes refs when content updated to have no refs', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target');
      const blockId = generateId();

      // Insert block with ref
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphWithInline([objectRef(targetId)]),
          },
        ],
      });

      // Update to plain text (no refs)
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: { content: paragraph('Just plain text') },
          },
        ],
      });

      // Verify refs are gone
      const refRows = ctx.db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refRows).toHaveLength(0);
    });
  });

  describe('delete block cascades cleanup', () => {
    it('deletes parent with subtree and cleans up all refs', () => {
      const ctx = getCtx();
      const targetObjectId = createPage(ctx.db, ctx.pageTypeId, 'Target');

      // Build: parent -> [child1, child2] each with refs
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const parentId = generateId();
      const child1Id = generateId();
      const child2Id = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphWithInline([
              { t: 'text', text: 'Parent ' },
              objectRef(targetObjectId),
            ]),
          },
          {
            op: 'block.insert',
            blockId: child1Id,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphWithInline([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: child2Id,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphWithInline([objectRef(targetObjectId)]),
          },
        ],
      });

      // Verify 3 refs exist
      let refRows = ctx.db.select().from(refs).where(eq(refs.sourceObjectId, objectId)).all();
      expect(refRows).toHaveLength(3);

      // Delete parent with subtree
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
            subtree: true,
          },
        ],
      });

      assertPatchSuccess(deleteResult);

      // Verify all 3 blocks have deletedAt set
      assertBlockDeleted(ctx.db, parentId);
      assertBlockDeleted(ctx.db, child1Id);
      assertBlockDeleted(ctx.db, child2Id);

      // Verify all refs are cleaned up
      refRows = ctx.db.select().from(refs).where(eq(refs.sourceObjectId, objectId)).all();
      expect(refRows).toHaveLength(0);
    });

    it('deletes single block without subtree', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Test', [
        {
          type: 'paragraph',
          content: 'Parent',
          children: [{ type: 'paragraph', content: 'Child' }],
        },
      ]);

      const parentId = blockIds[0];
      const childId = blockIds[1];

      if (!parentId || !childId) {
        throw new Error('Expected blockIds to have at least 2 elements');
      }

      // Delete parent without subtree
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
            // subtree not set - only delete parent
          },
        ],
      });

      assertPatchSuccess(deleteResult);
      assertBlockDeleted(ctx.db, parentId);

      // Child should NOT be deleted
      const child = ctx.db.select().from(blocks).where(eq(blocks.id, childId)).get();
      expect(child?.deletedAt).toBeNull();
    });
  });

  describe('move block validates cycle detection', () => {
    it('rejects move that would create cycle (A under C where A -> B -> C)', () => {
      const ctx = getCtx();

      // Build A -> B -> C hierarchy
      const { objectId, blockIds } = buildDeepHierarchy(ctx.db, ctx.pageTypeId, 3);
      const blockA = blockIds[0];
      const blockC = blockIds[2];

      if (!blockA || !blockC) {
        throw new Error('Expected blockIds to have at least 3 elements');
      }

      // Capture state before move attempt
      const docVersionBefore = getDocVersion(ctx.db, objectId);
      const blockABefore = ctx.db.select().from(blocks).where(eq(blocks.id, blockA)).get();

      // Attempt to move A under C (would create cycle)
      const moveResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.move',
            blockId: blockA,
            newParentBlockId: blockC,
            place: { where: 'end' },
          },
        ],
      });

      // Verify INVARIANT_CYCLE error
      assertApiError(moveResult, 'INVARIANT_CYCLE');

      // Verify no database changes occurred
      const docVersionAfter = getDocVersion(ctx.db, objectId);
      expect(docVersionAfter).toBe(docVersionBefore);

      const blockAAfter = ctx.db.select().from(blocks).where(eq(blocks.id, blockA)).get();
      expect(blockAAfter?.parentBlockId).toBe(blockABefore?.parentBlockId);
    });

    it('rejects move of block under itself', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Test', [
        { type: 'paragraph', content: 'Block' },
      ]);
      const blockId = blockIds[0];

      if (!blockId) {
        throw new Error('Expected blockIds to have at least 1 element');
      }

      const moveResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.move',
            blockId,
            newParentBlockId: blockId, // Move under itself
            place: { where: 'end' },
          },
        ],
      });

      assertApiError(moveResult, 'INVARIANT_CYCLE');
    });
  });

  describe('version conflict rejects entire patch', () => {
    it('rejects patch with wrong baseDocVersion', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');

      // First patch to increment version to 1
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('First'),
          },
        ],
      });

      // Second patch with wrong baseDocVersion (expecting 0, but it's 1)
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0, // Wrong! Should be 1
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Second'),
          },
        ],
      });

      assertApiError(result, 'CONFLICT_VERSION', { expected: 0, actual: 1 });

      // Verify version is still 1 (no change)
      expect(getDocVersion(ctx.db, objectId)).toBe(1);
    });

    it('rejects patch with future baseDocVersion', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 5, // Object is at version 0
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Hello'),
          },
        ],
      });

      assertApiError(result, 'CONFLICT_VERSION', { expected: 5, actual: 0 });
    });
  });

  describe('idempotency key returns cached result', () => {
    it('returns cached result on duplicate idempotency key', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const blockId = generateId();
      const idempotencyKey = 'unique-key-456';

      // First patch
      const firstResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('First'),
          },
        ],
      });

      assertPatchSuccess(firstResult, { newDocVersion: 1 });

      // Second patch with same key (should return cached result, not execute)
      // Note: The second call uses baseDocVersion: 1 since the object is now at version 1,
      // but idempotency lookup happens before version check, so cached result is returned.
      const secondResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1, // Current version after first patch
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(), // Different block ID - won't be used due to cache
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Would be second'),
          },
        ],
      });

      // Should return same result from cache
      assertPatchSuccess(secondResult, { newDocVersion: 1 });

      // Verify only one block exists (not two) - the cached result was returned
      const blockRows = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();
      expect(blockRows).toHaveLength(1);

      // Version should still be 1
      expect(getDocVersion(ctx.db, objectId)).toBe(1);
    });
  });

  describe('multi-op patch error handling', () => {
    it('returns error when later op fails in multi-op patch', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const validBlockId = generateId();
      const invalidBlockId = generateId();
      const nonExistentParentId = generateId(); // This parent doesn't exist

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          // First op: valid insert
          {
            op: 'block.insert',
            blockId: validBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Valid block'),
          },
          // Second op: invalid (parent doesn't exist)
          {
            op: 'block.insert',
            blockId: invalidBlockId,
            parentBlockId: nonExistentParentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Invalid block'),
          },
        ],
      });

      // Should fail with NOT_FOUND_BLOCK for parent
      assertApiError(result, 'NOT_FOUND_BLOCK');
    });

    it('returns error when update fails after insert in multi-op patch', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const newBlockId = generateId();
      const nonExistentBlockId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('New'),
          },
          {
            op: 'block.update',
            blockId: nonExistentBlockId, // This doesn't exist
            patch: { content: paragraph('Updated') },
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_BLOCK');
    });

    it('successful multi-op patch applies all operations', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const block1Id = generateId();
      const block2Id = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('First'),
          },
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Second'),
          },
        ],
      });

      assertPatchSuccess(result, { newDocVersion: 1, insertedBlockIds: [block1Id, block2Id] });

      // Verify both blocks exist
      const allBlocks = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();
      expect(allBlocks).toHaveLength(2);
    });
  });

  describe('insert at different positions', () => {
    it('inserts at start of sibling list', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const existingBlockId = generateId();
      const newBlockId = generateId();

      // Insert first block
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: existingBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Existing'),
          },
        ],
      });

      // Insert at start
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'start' },
            blockType: 'paragraph',
            content: paragraph('New at start'),
          },
        ],
      });

      // Verify order: new block should come before existing
      const newBlock = ctx.db.select().from(blocks).where(eq(blocks.id, newBlockId)).get();
      const existingBlock = ctx.db
        .select()
        .from(blocks)
        .where(eq(blocks.id, existingBlockId))
        .get();

      expect(newBlock).toBeDefined();
      expect(existingBlock).toBeDefined();
      if (newBlock && existingBlock) {
        expect(newBlock.orderKey < existingBlock.orderKey).toBe(true);
      }
    });

    it('inserts before a specific sibling', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const firstId = generateId();
      const secondId = generateId();
      const insertedId = generateId();

      // Insert two blocks
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: firstId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('First'),
          },
          {
            op: 'block.insert',
            blockId: secondId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Second'),
          },
        ],
      });

      // Insert before second
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.insert',
            blockId: insertedId,
            parentBlockId: null,
            place: { where: 'before', siblingBlockId: secondId },
            blockType: 'paragraph',
            content: paragraph('Inserted before second'),
          },
        ],
      });

      // Verify order: first < inserted < second
      const first = ctx.db.select().from(blocks).where(eq(blocks.id, firstId)).get();
      const inserted = ctx.db.select().from(blocks).where(eq(blocks.id, insertedId)).get();
      const second = ctx.db.select().from(blocks).where(eq(blocks.id, secondId)).get();

      expect(first).toBeDefined();
      expect(inserted).toBeDefined();
      expect(second).toBeDefined();
      if (first && inserted && second) {
        expect(first.orderKey < inserted.orderKey).toBe(true);
        expect(inserted.orderKey < second.orderKey).toBe(true);
      }
    });

    it('inserts after a specific sibling', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const firstId = generateId();
      const secondId = generateId();
      const insertedId = generateId();

      // Insert two blocks
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: firstId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('First'),
          },
          {
            op: 'block.insert',
            blockId: secondId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Second'),
          },
        ],
      });

      // Insert after first
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.insert',
            blockId: insertedId,
            parentBlockId: null,
            place: { where: 'after', siblingBlockId: firstId },
            blockType: 'paragraph',
            content: paragraph('Inserted after first'),
          },
        ],
      });

      // Verify order: first < inserted < second
      const first = ctx.db.select().from(blocks).where(eq(blocks.id, firstId)).get();
      const inserted = ctx.db.select().from(blocks).where(eq(blocks.id, insertedId)).get();
      const second = ctx.db.select().from(blocks).where(eq(blocks.id, secondId)).get();

      expect(first).toBeDefined();
      expect(inserted).toBeDefined();
      expect(second).toBeDefined();
      if (first && inserted && second) {
        expect(first.orderKey < inserted.orderKey).toBe(true);
        expect(inserted.orderKey < second.orderKey).toBe(true);
      }
    });
  });

  describe('cross-object parenting rejected', () => {
    it('rejects insert with parent in different object', () => {
      const ctx = getCtx();
      const objectA = createPage(ctx.db, ctx.pageTypeId, 'Object A');
      const objectB = createPage(ctx.db, ctx.pageTypeId, 'Object B');

      // Create a block in object B
      const parentInB = generateId();
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectB,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentInB,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Parent in B'),
          },
        ],
      });

      // Try to insert block in object A with parent in object B
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: parentInB, // Parent is in object B!
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Child trying to cross objects'),
          },
        ],
      });

      assertApiError(result, 'INVARIANT_CROSS_OBJECT');
    });

    it('rejects move to parent in different object', () => {
      const ctx = getCtx();
      const objectA = createPage(ctx.db, ctx.pageTypeId, 'Object A');
      const objectB = createPage(ctx.db, ctx.pageTypeId, 'Object B');

      // Create blocks in each object
      const blockInA = generateId();
      const blockInB = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockInA,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Block in A'),
          },
        ],
      });

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectB,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockInB,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Block in B'),
          },
        ],
      });

      // Try to move block in A under parent in B (within object A's patch)
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.move',
            blockId: blockInA,
            newParentBlockId: blockInB, // Parent is in object B!
            place: { where: 'end' },
          },
        ],
      });

      assertApiError(result, 'INVARIANT_CROSS_OBJECT');
    });
  });

  describe('parent deleted rejection', () => {
    it('rejects insert under deleted parent', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const parentId = generateId();

      // Create and delete a parent block
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Parent'),
          },
        ],
      });

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
          },
        ],
      });

      // Try to insert child under deleted parent
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: parentId, // Parent is deleted!
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Child'),
          },
        ],
      });

      assertApiError(result, 'INVARIANT_PARENT_DELETED');
    });

    it('rejects move to deleted parent', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const parentId = generateId();
      const childId = generateId();

      // Create parent and child blocks
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Parent'),
          },
          {
            op: 'block.insert',
            blockId: childId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Child'),
          },
        ],
      });

      // Delete parent
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
          },
        ],
      });

      // Try to move child under deleted parent
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.move',
            blockId: childId,
            newParentBlockId: parentId, // Parent is deleted!
            place: { where: 'end' },
          },
        ],
      });

      assertApiError(result, 'INVARIANT_PARENT_DELETED');
    });
  });

  describe('content validation', () => {
    it('rejects invalid paragraph content', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { notInline: 'invalid' }, // Missing 'inline' field
          },
        ],
      });

      assertApiError(result, 'VALIDATION');
    });

    it('rejects invalid heading level', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: { level: 7, inline: [{ t: 'text', text: 'Invalid' }] }, // Level 7 is invalid
          },
        ],
      });

      assertApiError(result, 'VALIDATION');
    });
  });

  describe('object not found', () => {
    it('rejects patch for non-existent object', () => {
      const ctx = getCtx();
      const nonExistentObjectId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: nonExistentObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Hello'),
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_OBJECT');
    });
  });

  describe('block not found', () => {
    it('rejects update for non-existent block', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const nonExistentBlockId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.update',
            blockId: nonExistentBlockId,
            patch: { content: paragraph('Updated') },
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_BLOCK');
    });

    it('rejects delete for non-existent block', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const nonExistentBlockId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.delete',
            blockId: nonExistentBlockId,
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_BLOCK');
    });

    it('rejects move for non-existent block', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test');
      const nonExistentBlockId = generateId();

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.move',
            blockId: nonExistentBlockId,
            newParentBlockId: null,
            place: { where: 'end' },
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_BLOCK');
    });
  });
});
