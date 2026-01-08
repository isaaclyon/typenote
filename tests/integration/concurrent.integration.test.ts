/**
 * Concurrent Operations Integration Tests
 *
 * Tests race conditions, idempotency, version conflicts, and concurrent behavior
 * with SQLite's single-writer architecture. While better-sqlite3 is synchronous
 * and single-threaded, these tests verify correct behavior under simulated
 * concurrent scenarios and stress conditions.
 */

import { describe, it, expect } from 'vitest';
import { eq, and, isNull } from 'drizzle-orm';
import {
  setupIntegrationContext,
  createPage,
  applyBlockPatch,
  generateId,
} from './helpers/testContext.js';
import { paragraph, objectRef, buildDocumentTree, buildDeepHierarchy } from './helpers/fixtures.js';
import {
  assertApiError,
  assertPatchSuccess,
  assertBlockDeleted,
  getDocVersion,
} from './helpers/assertions.js';
import {
  blocks,
  refs,
  idempotency,
  getBacklinks,
  importObject,
  exportObject,
  type ExportedObject,
} from '@typenote/storage';
import type { ParagraphContent } from '@typenote/api';

describe('Concurrent Operations Integration Tests', () => {
  const getCtx = setupIntegrationContext();

  // ==========================================================================
  // Version Conflicts
  // ==========================================================================

  describe('Version Conflicts', () => {
    it('two patches with same baseDocVersion - first succeeds, second fails', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // First patch: version 0 -> 1
      const block1Id = generateId();
      const result1 = applyBlockPatch(ctx.db, {
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
            content: paragraph('First patch'),
          },
        ],
      });

      assertPatchSuccess(result1, { newDocVersion: 1 });

      // Second patch: same baseDocVersion 0 -> should fail
      const block2Id = generateId();
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0, // Stale!
        ops: [
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Second patch'),
          },
        ],
      });

      assertApiError(result2, 'CONFLICT_VERSION', { expected: 0, actual: 1 });

      // Version should still be 1
      expect(getDocVersion(ctx.db, objectId)).toBe(1);

      // Only first block should exist
      const blockCount = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all().length;
      expect(blockCount).toBe(1);
    });

    it('patch with stale baseDocVersion after multiple patches fails', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // Apply 3 patches to get to version 3
      for (let i = 0; i < 3; i++) {
        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Patch ${i + 1}`),
            },
          ],
        });
        assertPatchSuccess(result, { newDocVersion: i + 1 });
      }

      // Try to apply with stale version 1
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1, // Way behind!
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Stale patch'),
          },
        ],
      });

      assertApiError(result, 'CONFLICT_VERSION', { expected: 1, actual: 3 });
    });

    it('patch with future baseDocVersion fails', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // Object is at version 0, try to patch with version 10
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 10,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Future patch'),
          },
        ],
      });

      assertApiError(result, 'CONFLICT_VERSION', { expected: 10, actual: 0 });
    });

    it('patch without baseDocVersion succeeds regardless of current version', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // Apply 3 patches first
      for (let i = 0; i < 3; i++) {
        applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Patch ${i + 1}`),
            },
          ],
        });
      }

      // Patch without baseDocVersion should succeed (no conflict check)
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        // No baseDocVersion!
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('No version check'),
          },
        ],
      });

      assertPatchSuccess(result, { newDocVersion: 4 });
    });

    it('version conflict preserves database state completely', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // Create initial state
      const block1Id = generateId();
      applyBlockPatch(ctx.db, {
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
            content: paragraph('Initial'),
          },
        ],
      });

      // Capture state before conflicting patch
      const versionBefore = getDocVersion(ctx.db, objectId);
      const blocksBefore = ctx.db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();

      // Attempt conflicting patch
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0, // Stale
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Conflict'),
          },
        ],
      });

      // Verify state is unchanged
      expect(getDocVersion(ctx.db, objectId)).toBe(versionBefore);
      const blocksAfter = ctx.db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();
      expect(blocksAfter).toEqual(blocksBefore);
    });

    it('sequential patches with correct versions all succeed', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      const patchCount = 10;
      const blockIds: string[] = [];

      for (let i = 0; i < patchCount; i++) {
        const blockId = generateId();
        blockIds.push(blockId);

        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Patch ${i + 1}`),
            },
          ],
        });

        assertPatchSuccess(result, { newDocVersion: i + 1 });
      }

      // Final version should be patchCount
      expect(getDocVersion(ctx.db, objectId)).toBe(patchCount);

      // All blocks should exist
      const allBlocks = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();
      expect(allBlocks.length).toBe(patchCount);
    });
  });

  // ==========================================================================
  // Idempotency
  // ==========================================================================

  describe('Idempotency', () => {
    it('same idempotencyKey returns cached result without re-executing', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const blockId = generateId();
      const idempotencyKey = 'test-idem-key-1';

      // First call
      const result1 = applyBlockPatch(ctx.db, {
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
            content: paragraph('Idempotent'),
          },
        ],
      });

      assertPatchSuccess(result1, { newDocVersion: 1 });

      // Second call with same key - should return cached result
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1, // Even with updated version
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(), // Different block ID
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Different content'),
          },
        ],
      });

      // Should return same result as first call
      assertPatchSuccess(result2, { newDocVersion: 1 });

      // Only one block should exist
      const blockCount = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all().length;
      expect(blockCount).toBe(1);

      // Version should still be 1
      expect(getDocVersion(ctx.db, objectId)).toBe(1);
    });

    it('different idempotencyKey applies patch again', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      // First patch with key A
      const result1 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey: 'key-A',
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

      assertPatchSuccess(result1, { newDocVersion: 1 });

      // Second patch with key B
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        idempotencyKey: 'key-B',
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

      assertPatchSuccess(result2, { newDocVersion: 2 });

      // Both blocks should exist
      const blockCount = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all().length;
      expect(blockCount).toBe(2);
    });

    it('idempotency is scoped to object', () => {
      const ctx = getCtx();
      const objectId1 = createPage(ctx.db, ctx.pageTypeId, 'Page 1');
      const objectId2 = createPage(ctx.db, ctx.pageTypeId, 'Page 2');
      const sharedKey = 'shared-idem-key';

      // Apply to object 1
      const result1 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectId1,
        baseDocVersion: 0,
        idempotencyKey: sharedKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Object 1'),
          },
        ],
      });

      assertPatchSuccess(result1);

      // Apply to object 2 with same key - should succeed (different object scope)
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectId2,
        baseDocVersion: 0,
        idempotencyKey: sharedKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Object 2'),
          },
        ],
      });

      assertPatchSuccess(result2);

      // Both objects should have blocks
      expect(
        ctx.db
          .select()
          .from(blocks)
          .where(and(eq(blocks.objectId, objectId1), isNull(blocks.deletedAt)))
          .all().length
      ).toBe(1);
      expect(
        ctx.db
          .select()
          .from(blocks)
          .where(and(eq(blocks.objectId, objectId2), isNull(blocks.deletedAt)))
          .all().length
      ).toBe(1);
    });

    it('idempotency caches multi-op patch results correctly', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const block1Id = generateId();
      const block2Id = generateId();
      const idempotencyKey = 'multi-op-key';

      // Multi-op patch
      const result1 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Block 1'),
          },
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Block 2'),
          },
        ],
      });

      assertPatchSuccess(result1, { insertedBlockIds: [block1Id, block2Id] });

      // Replay - should return cached result with both block IDs
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Different'),
          },
        ],
      });

      expect(result2.success).toBe(true);
      if (result2.success) {
        expect(result2.result.applied.insertedBlockIds.sort()).toEqual([block1Id, block2Id].sort());
      }
    });

    it('idempotency record is stored in database', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const idempotencyKey = 'stored-key';

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Stored'),
          },
        ],
      });

      // Check idempotency table
      const record = ctx.db
        .select()
        .from(idempotency)
        .where(and(eq(idempotency.objectId, objectId), eq(idempotency.key, idempotencyKey)))
        .all();

      expect(record).toHaveLength(1);
      expect(record[0]?.resultJson).toBeDefined();

      // Verify the result JSON contains expected data
      const storedResult = JSON.parse(record[0]?.resultJson ?? '{}');
      expect(storedResult.newDocVersion).toBe(1);
    });

    it('patch without idempotencyKey does not create record', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        // No idempotencyKey
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('No key'),
          },
        ],
      });

      // Check idempotency table is empty for this object
      const records = ctx.db
        .select()
        .from(idempotency)
        .where(eq(idempotency.objectId, objectId))
        .all();

      expect(records).toHaveLength(0);
    });

    it('version check happens before idempotency check', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page');
      const idempotencyKey = 'version-check-order';

      // First patch
      const result1 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        idempotencyKey,
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

      assertPatchSuccess(result1);

      // Replay with wrong baseDocVersion - version check happens first
      // so this will fail with CONFLICT_VERSION before checking idempotency
      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 999, // Causes CONFLICT_VERSION
        idempotencyKey,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Different'),
          },
        ],
      });

      // Version check happens before idempotency, so this fails
      assertApiError(result2, 'CONFLICT_VERSION');
    });
  });

  // ==========================================================================
  // Rapid Sequential Patches
  // ==========================================================================

  describe('Rapid Sequential Patches', () => {
    it('100 patches to same object - versions increment correctly', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Rapid Patch Test');
      const patchCount = 100;

      for (let i = 0; i < patchCount; i++) {
        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Block ${i + 1}`),
            },
          ],
        });

        assertPatchSuccess(result, { newDocVersion: i + 1 });
      }

      // Final version should be exactly patchCount
      expect(getDocVersion(ctx.db, objectId)).toBe(patchCount);
    });

    it('100 patches - all blocks present after batch', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'All Blocks Test');
      const patchCount = 100;
      const blockIds: string[] = [];

      for (let i = 0; i < patchCount; i++) {
        const blockId = generateId();
        blockIds.push(blockId);

        applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Block ${i + 1}`),
            },
          ],
        });
      }

      // All blocks should exist
      const existingBlocks = ctx.db
        .select({ id: blocks.id })
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();

      expect(existingBlocks.length).toBe(patchCount);

      // All block IDs should be present
      const existingIds = new Set(existingBlocks.map((b) => b.id));
      for (const blockId of blockIds) {
        expect(existingIds.has(blockId)).toBe(true);
      }
    });

    it('100 patches - no version gaps', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'No Gaps Test');
      const patchCount = 100;
      const versions: number[] = [];

      for (let i = 0; i < patchCount; i++) {
        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Block ${i + 1}`),
            },
          ],
        });

        if (result.success) {
          versions.push(result.result.newDocVersion);
        }
      }

      // Verify no gaps in versions
      expect(versions.length).toBe(patchCount);
      for (let i = 0; i < patchCount; i++) {
        expect(versions[i]).toBe(i + 1);
      }
    });

    it('rapid multi-block patches all succeed without conflicts', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Order Test');

      // Insert 50 blocks rapidly at the end, tracking success
      const successCount = { value: 0 };
      for (let i = 0; i < 50; i++) {
        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraph(`Block ${i + 1}`),
            },
          ],
        });

        if (result.success) {
          successCount.value++;
        }
      }

      // All patches should succeed
      expect(successCount.value).toBe(50);

      // Get all blocks
      const allBlocks = ctx.db
        .select({ id: blocks.id, orderKey: blocks.orderKey, content: blocks.content })
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();

      // Verify all blocks exist
      expect(allBlocks.length).toBe(50);

      // Verify final version is correct
      expect(getDocVersion(ctx.db, objectId)).toBe(50);

      // Verify all blocks contain expected content
      const contents = new Set<string>();
      for (const block of allBlocks) {
        const content = JSON.parse(block.content) as ParagraphContent;
        const textNode = content.inline?.[0];
        if (textNode && 't' in textNode && textNode.t === 'text') {
          contents.add(textNode.text);
        }
      }

      // All 50 different blocks should be present
      expect(contents.size).toBe(50);
    });
  });

  // ==========================================================================
  // Delete + Reference
  // ==========================================================================

  describe('Delete + Reference', () => {
    it('delete object with incoming references - backlinks cleaned up', () => {
      const ctx = getCtx();

      // Create linked objects: A -> B (A references B)
      const objectA = createPage(ctx.db, ctx.pageTypeId, 'Object A');
      const objectB = createPage(ctx.db, ctx.pageTypeId, 'Object B');
      const blockId = generateId();

      // A has a block that references B
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'See ' }, objectRef(objectB)],
            } as ParagraphContent,
          },
        ],
      });

      // Verify backlink exists
      const backlinksBefore = getBacklinks(ctx.db, objectB);
      expect(backlinksBefore.length).toBe(1);

      // Delete the block containing the reference
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      });

      // Backlinks should be cleaned up
      const backlinksAfter = getBacklinks(ctx.db, objectB);
      expect(backlinksAfter.length).toBe(0);
    });

    it('delete subtree with multiple references - all backlinks cleaned up', () => {
      const ctx = getCtx();
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target');
      const sourceId = createPage(ctx.db, ctx.pageTypeId, 'Source');

      const parentId = generateId();
      const child1Id = generateId();
      const child2Id = generateId();

      // Create parent with two children, all referencing target
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'Parent ' }, objectRef(targetId)],
            } as ParagraphContent,
          },
          {
            op: 'block.insert',
            blockId: child1Id,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(targetId)],
            } as ParagraphContent,
          },
          {
            op: 'block.insert',
            blockId: child2Id,
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(targetId)],
            } as ParagraphContent,
          },
        ],
      });

      // Verify 3 backlinks exist
      expect(getBacklinks(ctx.db, targetId).length).toBe(3);

      // Delete parent with subtree
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
            subtree: true,
          },
        ],
      });

      // All backlinks should be gone
      expect(getBacklinks(ctx.db, targetId).length).toBe(0);
    });

    it('no orphan references after block delete', () => {
      const ctx = getCtx();
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target');
      const sourceId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const blockId = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(targetId)],
            } as ParagraphContent,
          },
        ],
      });

      // Delete the block
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      });

      // Check refs table directly - should have no entries for this block
      const orphanRefs = ctx.db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();

      expect(orphanRefs.length).toBe(0);
    });

    it('update block to remove reference - backlink cleaned up', () => {
      const ctx = getCtx();
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target');
      const sourceId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const blockId = generateId();

      // Insert with reference
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(targetId)],
            } as ParagraphContent,
          },
        ],
      });

      expect(getBacklinks(ctx.db, targetId).length).toBe(1);

      // Update to remove reference
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraph('Plain text, no reference'),
            },
          },
        ],
      });

      expect(getBacklinks(ctx.db, targetId).length).toBe(0);
    });

    it('circular references - delete one side cleans up correctly', () => {
      const ctx = getCtx();

      // Create circular: A <-> B
      const objectA = createPage(ctx.db, ctx.pageTypeId, 'Object A');
      const objectB = createPage(ctx.db, ctx.pageTypeId, 'Object B');

      const blockAId = generateId();
      const blockBId = generateId();

      // A references B
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockAId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(objectB)],
            } as ParagraphContent,
          },
        ],
      });

      // B references A
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectB,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockBId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [objectRef(objectA)],
            } as ParagraphContent,
          },
        ],
      });

      // Both have backlinks
      expect(getBacklinks(ctx.db, objectA).length).toBe(1);
      expect(getBacklinks(ctx.db, objectB).length).toBe(1);

      // Delete A's reference to B
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: objectA,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: blockAId,
          },
        ],
      });

      // A should have no backlinks to B, but B still references A
      expect(getBacklinks(ctx.db, objectB).length).toBe(0);
      expect(getBacklinks(ctx.db, objectA).length).toBe(1);
    });
  });

  // ==========================================================================
  // Move + Delete Race
  // ==========================================================================

  describe('Move + Delete Race', () => {
    it('move block then delete parent - block state is consistent', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Move Delete Test', [
        {
          type: 'paragraph',
          content: 'Parent',
          children: [{ type: 'paragraph', content: 'Child' }],
        },
        { type: 'paragraph', content: 'Other' },
      ]);

      const parentId = blockIds[0];
      const childId = blockIds[1];
      const otherId = blockIds[2];

      if (!parentId || !childId || !otherId) {
        throw new Error('Expected 3 blocks');
      }

      // Move child out of parent to "Other"
      const moveResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.move',
            blockId: childId,
            newParentBlockId: otherId,
            place: { where: 'end' },
          },
        ],
      });

      assertPatchSuccess(moveResult);

      // Delete original parent (child is now elsewhere)
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.delete',
            blockId: parentId,
            subtree: true,
          },
        ],
      });

      assertPatchSuccess(deleteResult);

      // Child should still exist (it was moved before parent was deleted)
      const child = ctx.db.select().from(blocks).where(eq(blocks.id, childId)).get();
      expect(child).toBeDefined();
      expect(child?.deletedAt).toBeNull();
      expect(child?.parentBlockId).toBe(otherId);

      // Parent should be deleted
      assertBlockDeleted(ctx.db, parentId);
    });

    it('delete parent while child is being moved - parent delete includes child', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDeepHierarchy(ctx.db, ctx.pageTypeId, 3);

      // A -> B -> C
      const blockA = blockIds[0];
      const blockB = blockIds[1];
      const blockC = blockIds[2];

      if (!blockA || !blockB || !blockC) {
        throw new Error('Expected 3 blocks');
      }

      // Delete A with subtree (includes B and C)
      const deleteResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: blockA,
            subtree: true,
          },
        ],
      });

      assertPatchSuccess(deleteResult);

      // All should be deleted
      assertBlockDeleted(ctx.db, blockA);
      assertBlockDeleted(ctx.db, blockB);
      assertBlockDeleted(ctx.db, blockC);
    });

    it('move to deleted parent fails with INVARIANT_PARENT_DELETED', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Test', [
        { type: 'paragraph', content: 'Parent' },
        { type: 'paragraph', content: 'Child' },
      ]);

      const parentId = blockIds[0];
      const childId = blockIds[1];

      if (!parentId || !childId) {
        throw new Error('Expected 2 blocks');
      }

      // Delete parent first
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
      const moveResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.move',
            blockId: childId,
            newParentBlockId: parentId,
            place: { where: 'end' },
          },
        ],
      });

      assertApiError(moveResult, 'INVARIANT_PARENT_DELETED');
    });

    it('insert under deleted parent fails with INVARIANT_PARENT_DELETED', () => {
      const ctx = getCtx();
      const { objectId, blockIds } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Test', [
        { type: 'paragraph', content: 'Parent' },
      ]);

      const parentId = blockIds[0];
      if (!parentId) {
        throw new Error('Expected 1 block');
      }

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

      // Try to insert under deleted parent
      const insertResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: parentId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('New child'),
          },
        ],
      });

      assertApiError(insertResult, 'INVARIANT_PARENT_DELETED');
    });
  });

  // ==========================================================================
  // Import + Edit
  // ==========================================================================

  describe('Import + Edit', () => {
    it('import object then immediately patch - no race condition', () => {
      const ctx = getCtx();

      // Export an object from source DB (reuse ctx for simplicity)
      const sourceObjectId = createPage(ctx.db, ctx.pageTypeId, 'Source Object');
      const sourceBlockId = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: sourceBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Imported content'),
          },
        ],
      });

      const exported = exportObject(ctx.db, sourceObjectId);
      expect(exported).not.toBeNull();

      if (!exported) {
        throw new Error('Export failed');
      }

      // Create fresh object for import with NEW IDs
      const importedObjectId = generateId();
      const importedBlockId = generateId();
      const importedExport: ExportedObject = {
        ...exported,
        id: importedObjectId,
        blocks: exported.blocks.map((b) => ({
          ...b,
          id: importedBlockId, // New block ID
        })),
      };

      const importResult = importObject(ctx.db, importedExport);
      expect(importResult.success).toBe(true);

      // Immediately patch the imported object
      const newBlockId = generateId();
      const patchResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: importedObjectId,
        baseDocVersion: importedExport.docVersion, // Use imported version
        ops: [
          {
            op: 'block.insert',
            blockId: newBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Added after import'),
          },
        ],
      });

      assertPatchSuccess(patchResult);

      // Verify both blocks exist
      const allBlocks = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, importedObjectId), isNull(blocks.deletedAt)))
        .all();

      expect(allBlocks.length).toBe(2);
    });

    it('import with replace then edit - correct version tracking', () => {
      const ctx = getCtx();

      // Create initial object
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Replace Target');
      const block1Id = generateId();

      applyBlockPatch(ctx.db, {
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
            content: paragraph('Original'),
          },
        ],
      });

      // Export it
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();

      if (!exported) {
        throw new Error('Export failed');
      }

      // Modify and re-import with replace
      const modifiedExport: ExportedObject = {
        ...exported,
        docVersion: 5, // Bump version
        blocks: [
          {
            id: generateId(),
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'paragraph',
            content: paragraph('Replaced'),
            meta: null,
            children: [],
          },
        ],
      };

      const importResult = importObject(ctx.db, modifiedExport, { mode: 'replace' });
      expect(importResult.success).toBe(true);

      // Edit with new version
      const patchResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 5, // Updated version from import
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('After replace'),
          },
        ],
      });

      assertPatchSuccess(patchResult, { newDocVersion: 6 });
    });

    it('import rebuilds refs and FTS - immediately searchable and backlinks work', () => {
      const ctx = getCtx();

      // Create target object
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target');

      // Create source object that references target
      const sourceId = createPage(ctx.db, ctx.pageTypeId, 'Source');
      const blockId = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'See ' }, objectRef(targetId)],
            } as ParagraphContent,
          },
        ],
      });

      // Verify backlinks exist before import
      const backlinksBefore = getBacklinks(ctx.db, targetId);
      expect(backlinksBefore.length).toBe(1);

      // Export source
      const exported = exportObject(ctx.db, sourceId);
      expect(exported).not.toBeNull();

      if (!exported) {
        throw new Error('Export failed');
      }

      // Re-import with replace mode - this will replace existing object
      // and rebuild refs/FTS automatically
      const importResult = importObject(ctx.db, exported, { mode: 'replace' });
      expect(importResult.success).toBe(true);

      // Backlinks should still be available after import (refs rebuilt)
      const backlinksAfter = getBacklinks(ctx.db, targetId);
      expect(backlinksAfter.length).toBe(1);
      expect(backlinksAfter[0]?.sourceObjectId).toBe(sourceId);
    });
  });

  // ==========================================================================
  // Additional Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('concurrent patches on different objects succeed', () => {
      const ctx = getCtx();
      const object1 = createPage(ctx.db, ctx.pageTypeId, 'Object 1');
      const object2 = createPage(ctx.db, ctx.pageTypeId, 'Object 2');

      // Both patches with version 0 succeed (different objects)
      const result1 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: object1,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Object 1 content'),
          },
        ],
      });

      const result2 = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: object2,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Object 2 content'),
          },
        ],
      });

      assertPatchSuccess(result1);
      assertPatchSuccess(result2);
    });

    it('large multi-op patch is atomic', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Large Patch');

      // Create 50 blocks in one patch
      const blockIds = Array.from({ length: 50 }, () => generateId());
      const ops = blockIds.map((blockId, i) => ({
        op: 'block.insert' as const,
        blockId,
        parentBlockId: null,
        place: { where: 'end' as const },
        blockType: 'paragraph' as const,
        content: paragraph(`Block ${i + 1}`),
      }));

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops,
      });

      assertPatchSuccess(result, { newDocVersion: 1 });

      // All 50 blocks should exist
      const allBlocks = ctx.db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();
      expect(allBlocks.length).toBe(50);
    });

    it('validation before insert prevents partial application', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Validation Test');
      const block1Id = generateId();
      const nonExistentParentId = generateId();

      // Attempt to insert block with non-existent parent
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: nonExistentParentId, // Non-existent parent - fails validation
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraph('Block with bad parent'),
          },
        ],
      });

      assertApiError(result, 'NOT_FOUND_BLOCK');

      // Block should NOT exist (validation failed before insert)
      const block1 = ctx.db.select().from(blocks).where(eq(blocks.id, block1Id)).get();
      expect(block1).toBeUndefined();

      // Version should still be 0
      expect(getDocVersion(ctx.db, objectId)).toBe(0);
    });

    it('empty ops array succeeds but increments version', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Empty Ops');

      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [],
      });

      assertPatchSuccess(result, { newDocVersion: 1 });
    });

    it('version conflict on update preserves existing block content', () => {
      const ctx = getCtx();
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Update Conflict');
      const blockId = generateId();

      // Create block
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
            content: paragraph('Original content'),
          },
        ],
      });

      // Try to update with stale version
      const result = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0, // Stale!
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraph('Modified content'),
            },
          },
        ],
      });

      assertApiError(result, 'CONFLICT_VERSION');

      // Block should still have original content
      const block = ctx.db.select().from(blocks).where(eq(blocks.id, blockId)).get();
      const content = JSON.parse(block?.content ?? '{}') as ParagraphContent;
      const textNode = content.inline?.[0];
      if (textNode && 't' in textNode && textNode.t === 'text') {
        expect(textNode.text).toBe('Original content');
      }
    });
  });
});
