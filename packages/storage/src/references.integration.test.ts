/**
 * Integration tests for references (refs table and backlinks).
 *
 * These tests verify the full lifecycle of references:
 * - Creation through block patches
 * - Updates when references change
 * - Cleanup when blocks are deleted
 * - Edge cases like circular refs, self-refs, orphan refs
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateId } from '@typenote/core';
import { eq } from 'drizzle-orm';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { getBacklinks } from './backlinks.js';
import { searchBlocks } from './search.js';
import { refs, blocks } from './schema.js';
import { createTestObjectType, createTestObject, createTestBlock } from './testFixtures.js';
import { exportObject, importObject, type ExportedObject } from './exportService.js';
import { updateRefsForBlock } from './indexing.js';
import {
  text,
  objectRef,
  blockRef,
  paragraphContent,
  headingContent,
  tableContent,
  tableRow,
} from './testBuilders.js';

describe('references integration', () => {
  let db: TypenoteDb;
  let typeId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // 1. Reference Creation Flow
  // ============================================================================

  describe('reference creation flow', () => {
    it('creates reference via block.insert and verifies refs table', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Link to '), objectRef(targetObjectId)]),
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify refs table entry
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.sourceBlockId).toBe(blockId);
      expect(refsResult[0]?.sourceObjectId).toBe(sourceObjectId);
      expect(refsResult[0]?.targetObjectId).toBe(targetObjectId);
      expect(refsResult[0]?.targetBlockId).toBeNull();
    });

    it('verifies getBacklinks returns source object for target', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(blockId);
      expect(backlinks[0]?.sourceObjectId).toBe(sourceObjectId);
    });

    it('creates block-level reference with targetBlockId', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      // Create a block in target object to reference
      const targetBlockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: targetObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: targetBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Target block content')]),
          },
        ],
      });

      // Create reference to specific block
      const sourceBlockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: sourceBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([blockRef(targetObjectId, targetBlockId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.targetBlockId).toBe(targetBlockId);
    });

    it('creates reference with embed mode', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId, { mode: 'embed' })]),
          },
        ],
      });

      // Embed mode refs are still indexed
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
    });

    it('creates reference with alias text', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId, { alias: 'Custom Alias' })]),
          },
        ],
      });

      // Alias doesn't affect ref indexing
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.targetObjectId).toBe(targetObjectId);
    });
  });

  // ============================================================================
  // 2. Reference Updates
  // ============================================================================

  describe('reference updates', () => {
    it('updates refs when block reference changes from A to B', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetA = createTestObject(db, typeId, 'Target A');
      const targetB = createTestObject(db, typeId, 'Target B');
      const blockId = generateId();

      // Create block with ref to A
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetA)]),
          },
        ],
      });

      expect(getBacklinks(db, targetA)).toHaveLength(1);
      expect(getBacklinks(db, targetB)).toHaveLength(0);

      // Update to ref B instead
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraphContent([objectRef(targetB)]),
            },
          },
        ],
      });

      // A should have no backlinks now
      expect(getBacklinks(db, targetA)).toHaveLength(0);
      // B should have the backlink
      expect(getBacklinks(db, targetB)).toHaveLength(1);
    });

    it('preserves refs when content updated without changing refs', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('See '), objectRef(targetObjectId)]),
          },
        ],
      });

      // Update text but keep same ref
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraphContent([text('Check out '), objectRef(targetObjectId)]),
            },
          },
        ],
      });

      // Ref should still exist (refs are re-indexed, so count remains same)
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
    });

    it('removes ref when block content cleared of refs', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Update to remove the ref
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraphContent([text('No more refs here')]),
            },
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('adds additional ref when block updated to have multiple refs', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetA = createTestObject(db, typeId, 'Target A');
      const targetB = createTestObject(db, typeId, 'Target B');
      const blockId = generateId();

      // Start with one ref
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetA)]),
          },
        ],
      });

      // Add second ref
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraphContent([objectRef(targetA), text(' and '), objectRef(targetB)]),
            },
          },
        ],
      });

      expect(getBacklinks(db, targetA)).toHaveLength(1);
      expect(getBacklinks(db, targetB)).toHaveLength(1);

      // Total refs from this block
      const allRefs = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(allRefs).toHaveLength(2);
    });

    it('meta-only update does not lose existing refs', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const refsBefore = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();

      // Update only meta, not content
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              meta: { collapsed: true },
            },
          },
        ],
      });

      const refsAfter = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsAfter).toHaveLength(refsBefore.length);
    });
  });

  // ============================================================================
  // 3. Reference Deletion
  // ============================================================================

  describe('reference deletion', () => {
    it('cleans up refs when block is soft-deleted', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      });

      // Refs should be cleaned up
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(0);

      // Backlinks should be empty
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('cleans up refs for subtree when parent deleted', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const parentBlockId = generateId();
      const childBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: childBlockId,
            parentBlockId: parentBlockId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(2);

      // Delete parent with subtree
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentBlockId,
            subtree: true,
          },
        ],
      });

      // All refs should be cleaned up
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('backlinks excludes refs from soft-deleted blocks', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      // Create block using raw insert (bypassing patch)
      const blockId = createTestBlock(
        db,
        sourceObjectId,
        null,
        'a0',
        'paragraph',
        paragraphContent([objectRef(targetObjectId)])
      );

      // Manually insert ref
      updateRefsForBlock(
        db,
        blockId,
        sourceObjectId,
        'paragraph',
        paragraphContent([objectRef(targetObjectId)])
      );

      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Soft-delete the block directly
      db.run('UPDATE blocks SET deleted_at = ? WHERE id = ?', [Date.now(), blockId]);

      // Backlinks should exclude deleted block
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);

      // But refs table still has the entry (not cleaned up by direct soft-delete)
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(1);
    });

    it('does not affect other blocks refs when one block deleted', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const block1Id = generateId();
      const block2Id = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(2);

      // Delete only block1
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: block1Id,
          },
        ],
      });

      // block2's ref should still exist
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(block2Id);
    });
  });

  // ============================================================================
  // 4. Multiple References
  // ============================================================================

  describe('multiple references', () => {
    it('handles multiple refs from same object to same target in different blocks', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const block1Id = generateId();
      const block2Id = generateId();
      const block3Id = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: block3Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(3);

      const blockIds = backlinks.map((b) => b.sourceBlockId).sort();
      expect(blockIds).toEqual([block1Id, block2Id, block3Id].sort());
    });

    it('handles refs from one object to multiple different targets', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const target1 = createTestObject(db, typeId, 'Target 1');
      const target2 = createTestObject(db, typeId, 'Target 2');
      const target3 = createTestObject(db, typeId, 'Target 3');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([
              objectRef(target1),
              text(' '),
              objectRef(target2),
              text(' '),
              objectRef(target3),
            ]),
          },
        ],
      });

      expect(getBacklinks(db, target1)).toHaveLength(1);
      expect(getBacklinks(db, target2)).toHaveLength(1);
      expect(getBacklinks(db, target3)).toHaveLength(1);

      // All from same block
      const allRefs = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(allRefs).toHaveLength(3);
    });

    it('handles self-reference (object referencing itself)', () => {
      const objectId = createTestObject(db, typeId, 'Self Ref Page');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('See also: '), objectRef(objectId)]),
          },
        ],
      });

      // Self-reference should be indexed
      const backlinks = getBacklinks(db, objectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceObjectId).toBe(objectId);
      expect(backlinks[0]?.sourceBlockId).toBe(blockId);
    });

    it('handles circular references (A refs B, B refs A)', () => {
      const objectA = createTestObject(db, typeId, 'Object A');
      const objectB = createTestObject(db, typeId, 'Object B');
      const blockA = generateId();
      const blockB = generateId();

      // A references B
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: objectA,
        ops: [
          {
            op: 'block.insert',
            blockId: blockA,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(objectB)]),
          },
        ],
      });

      // B references A
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: objectB,
        ops: [
          {
            op: 'block.insert',
            blockId: blockB,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(objectA)]),
          },
        ],
      });

      // Both should have backlinks
      const backlinksA = getBacklinks(db, objectA);
      expect(backlinksA).toHaveLength(1);
      expect(backlinksA[0]?.sourceObjectId).toBe(objectB);

      const backlinksB = getBacklinks(db, objectB);
      expect(backlinksB).toHaveLength(1);
      expect(backlinksB[0]?.sourceObjectId).toBe(objectA);
    });

    it('handles duplicate refs in same block (same target twice)', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([
              objectRef(targetObjectId),
              text(' mentioned again: '),
              objectRef(targetObjectId),
            ]),
          },
        ],
      });

      // Both references are indexed (even if duplicate)
      const allRefs = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(allRefs).toHaveLength(2);

      // Backlinks may return both
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(2);
    });

    it('handles refs from multiple source objects to same target', () => {
      const source1 = createTestObject(db, typeId, 'Source 1');
      const source2 = createTestObject(db, typeId, 'Source 2');
      const source3 = createTestObject(db, typeId, 'Source 3');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      const block1 = generateId();
      const block2 = generateId();
      const block3 = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source1,
        ops: [
          {
            op: 'block.insert',
            blockId: block1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source2,
        ops: [
          {
            op: 'block.insert',
            blockId: block2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: source3,
        ops: [
          {
            op: 'block.insert',
            blockId: block3,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(3);

      const sourceObjectIds = backlinks.map((b) => b.sourceObjectId).sort();
      expect(sourceObjectIds).toEqual([source1, source2, source3].sort());
    });
  });

  // ============================================================================
  // 5. Cross-Service Integration
  // ============================================================================

  describe('cross-service integration', () => {
    it('full flow: create object, add blocks with refs, verify backlinks', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      // Initial state
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);

      // Add first block with ref
      const block1 = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: block1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: headingContent(1, [text('About '), objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Add second block
      const block2 = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.insert',
            blockId: block2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('More info: '), objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(2);

      // Delete first block
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 2,
        ops: [
          {
            op: 'block.delete',
            blockId: block1,
          },
        ],
      });

      const finalBacklinks = getBacklinks(db, targetObjectId);
      expect(finalBacklinks).toHaveLength(1);
      expect(finalBacklinks[0]?.sourceBlockId).toBe(block2);
    });

    it('search finds object that is referenced', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Check the target page'), objectRef(targetObjectId)]),
          },
        ],
      });

      // Search for text in the source block
      const searchResults = searchBlocks(db, 'target');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0]?.objectId).toBe(sourceObjectId);
    });

    it('export includes refs, import restores them', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      // Export the source object
      const exported = exportObject(db, sourceObjectId);
      expect(exported).not.toBeNull();

      // Delete refs and verify they're gone
      db.delete(refs).where(eq(refs.sourceObjectId, sourceObjectId)).run();
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);

      // Delete source object and its blocks
      db.delete(blocks).where(eq(blocks.objectId, sourceObjectId)).run();
      db.run('DELETE FROM objects WHERE id = ?', [sourceObjectId]);

      // Re-import
      const importResult = importObject(db, exported as ExportedObject);
      expect(importResult.success).toBe(true);

      // Refs should be restored
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
    });
  });

  // ============================================================================
  // 6. Edge Cases
  // ============================================================================

  describe('edge cases', () => {
    it('throws on reference to non-existent object due to foreign key constraint', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const nonExistentId = generateId(); // This ID doesn't exist
      const blockId = generateId();

      // The refs table has a foreign key constraint on targetObjectId,
      // so referencing a non-existent object will cause the patch to throw
      expect(() =>
        applyBlockPatch(db, {
          apiVersion: 'v1',
          objectId: sourceObjectId,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: paragraphContent([objectRef(nonExistentId)]),
            },
          ],
        })
      ).toThrow(/FOREIGN KEY constraint failed/);

      // Block should not have been created (transaction rolled back)
      const block = db.select().from(blocks).where(eq(blocks.id, blockId)).all()[0];
      expect(block).toBeUndefined();
    });

    it('handles reference in nested block', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const parentBlockId = generateId();
      const nestedBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Parent')]),
          },
          {
            op: 'block.insert',
            blockId: nestedBlockId,
            parentBlockId: parentBlockId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(nestedBlockId);
    });

    it('handles deeply nested block with ref', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      const level1 = generateId();
      const level2 = generateId();
      const level3 = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: level1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Level 1')]),
          },
          {
            op: 'block.insert',
            blockId: level2,
            parentBlockId: level1,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Level 2')]),
          },
          {
            op: 'block.insert',
            blockId: level3,
            parentBlockId: level2,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(level3);
    });

    it('handles ref in table cell', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'table',
            content: tableContent([tableRow([[text('Name')], [objectRef(targetObjectId)]])]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
    });

    it('handles empty content (no refs)', () => {
      const objectId = createTestObject(db, typeId, 'Empty');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([]),
          },
        ],
      });

      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(0);
    });

    it('handles ref update in same patch as move', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetA = createTestObject(db, typeId, 'Target A');
      const targetB = createTestObject(db, typeId, 'Target B');

      const parentBlockId = generateId();
      const childBlockId = generateId();

      // Create parent and child
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Parent')]),
          },
          {
            op: 'block.insert',
            blockId: childBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetA)]),
          },
        ],
      });

      expect(getBacklinks(db, targetA)).toHaveLength(1);

      // Move child under parent AND update content in same patch
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.move',
            blockId: childBlockId,
            newParentBlockId: parentBlockId,
            place: { where: 'end' },
          },
          {
            op: 'block.update',
            blockId: childBlockId,
            patch: {
              content: paragraphContent([objectRef(targetB)]),
            },
          },
        ],
      });

      expect(getBacklinks(db, targetA)).toHaveLength(0);
      expect(getBacklinks(db, targetB)).toHaveLength(1);
    });

    it('handles block.delete without subtree flag', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Delete without subtree flag
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
            // subtree not specified
          },
        ],
      });

      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('handles multiple refs in heading block type', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const target1 = createTestObject(db, typeId, 'Target 1');
      const target2 = createTestObject(db, typeId, 'Target 2');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'heading',
            content: headingContent(2, [objectRef(target1), text(' and '), objectRef(target2)]),
          },
        ],
      });

      expect(getBacklinks(db, target1)).toHaveLength(1);
      expect(getBacklinks(db, target2)).toHaveLength(1);
    });

    it('recreates refs after import with replace mode', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const target1 = createTestObject(db, typeId, 'Target 1');
      const target2 = createTestObject(db, typeId, 'Target 2');
      const blockId = generateId();

      // Create block with ref to target1
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(target1)]),
          },
        ],
      });

      // Export
      const exported = exportObject(db, sourceObjectId);
      expect(exported).not.toBeNull();
      if (exported === null) {
        throw new Error('Export should not be null');
      }

      // Modify exported data to reference target2 instead
      const firstBlock = exported.blocks[0];
      if (firstBlock === undefined) {
        throw new Error('First block should exist');
      }
      const modifiedExport: ExportedObject = {
        ...exported,
        blocks: [
          {
            ...firstBlock,
            content: paragraphContent([objectRef(target2)]),
          },
        ],
      };

      // Import with replace
      const importResult = importObject(db, modifiedExport, { mode: 'replace' });
      expect(importResult.success).toBe(true);

      // target1 should have no backlinks
      expect(getBacklinks(db, target1)).toHaveLength(0);

      // target2 should have the backlink
      expect(getBacklinks(db, target2)).toHaveLength(1);
    });
  });

  // ============================================================================
  // 7. Atomicity Tests
  // ============================================================================

  describe('atomicity', () => {
    it('refs are created atomically with block insert', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');
      const blockId = generateId();

      // Start of test - no refs
      expect(db.select().from(refs).all()).toHaveLength(0);

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
        ],
      });

      expect(result.success).toBe(true);

      // Both block and ref should exist
      const block = db.select().from(blocks).where(eq(blocks.id, blockId)).all()[0];
      expect(block).toBeDefined();

      const ref = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all()[0];
      expect(ref).toBeDefined();
    });

    it('multiple blocks with refs are indexed atomically in single patch', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const target1 = createTestObject(db, typeId, 'Target 1');
      const target2 = createTestObject(db, typeId, 'Target 2');
      const target3 = createTestObject(db, typeId, 'Target 3');

      const block1 = generateId();
      const block2 = generateId();
      const block3 = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: block1,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(target1)]),
          },
          {
            op: 'block.insert',
            blockId: block2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(target2)]),
          },
          {
            op: 'block.insert',
            blockId: block3,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(target3)]),
          },
        ],
      });

      expect(result.success).toBe(true);

      // All three refs should be created
      expect(getBacklinks(db, target1)).toHaveLength(1);
      expect(getBacklinks(db, target2)).toHaveLength(1);
      expect(getBacklinks(db, target3)).toHaveLength(1);
    });
  });

  // ============================================================================
  // 8. Block Reference vs Object Reference
  // ============================================================================

  describe('block reference vs object reference', () => {
    it('distinguishes between object ref and block ref in backlinks', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      // Create block in target to reference
      const targetBlockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: targetObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: targetBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Target content')]),
          },
        ],
      });

      // Create object ref and block ref from source
      const objectRefBlockId = generateId();
      const blockRefBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: objectRefBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([objectRef(targetObjectId)]),
          },
          {
            op: 'block.insert',
            blockId: blockRefBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([blockRef(targetObjectId, targetBlockId)]),
          },
        ],
      });

      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(2);

      // Find the object ref (no targetBlockId)
      const objectRefBacklink = backlinks.find((b) => b.sourceBlockId === objectRefBlockId);
      expect(objectRefBacklink?.targetBlockId).toBeNull();

      // Find the block ref (has targetBlockId)
      const blockRefBacklink = backlinks.find((b) => b.sourceBlockId === blockRefBlockId);
      expect(blockRefBacklink?.targetBlockId).toBe(targetBlockId);
    });

    it('block ref still shows up in object backlinks', () => {
      const sourceObjectId = createTestObject(db, typeId, 'Source');
      const targetObjectId = createTestObject(db, typeId, 'Target');

      const targetBlockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: targetObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: targetBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([text('Block to reference')]),
          },
        ],
      });

      const sourceBlockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: sourceBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: paragraphContent([blockRef(targetObjectId, targetBlockId)]),
          },
        ],
      });

      // Block refs should appear in object backlinks
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(sourceBlockId);
    });
  });
});
