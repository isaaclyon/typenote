/**
 * Integration tests for applyBlockPatch indexing side effects.
 * Verifies that refs and FTS are updated correctly within the patch transaction.
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { generateId } from '@typenote/core';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { getBacklinks } from './backlinks.js';
import { searchBlocks } from './search.js';
import { refs } from './schema.js';
import { createTestObjectType, createTestObject } from './testFixtures.js';
import { eq } from 'drizzle-orm';

describe('applyBlockPatch indexing integration', () => {
  let db: TypenoteDb;
  let typeId: string;
  let sourceObjectId: string;
  let targetObjectId: string;

  beforeEach(() => {
    db = createTestDb();
    typeId = createTestObjectType(db, 'Page');
    sourceObjectId = createTestObject(db, typeId, 'Source Object');
    targetObjectId = createTestObject(db, typeId, 'Target Object');
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('insert operations', () => {
    it('indexes refs on block insert', () => {
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
            content: {
              inline: [
                { t: 'text', text: 'See also: ' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify refs were indexed
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(1);
      expect(refsResult[0]?.targetObjectId).toBe(targetObjectId);

      // Verify backlinks work
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(blockId);
    });

    it('indexes FTS on block insert', () => {
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
            content: {
              inline: [{ t: 'text', text: 'This is searchable content' }],
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify FTS was indexed
      const searchResult = searchBlocks(db, 'searchable');
      expect(searchResult).toHaveLength(1);
      expect(searchResult[0]?.blockId).toBe(blockId);
    });
  });

  describe('update operations', () => {
    it('updates refs when block content changes', () => {
      const blockId = generateId();

      // First insert a block with a ref to targetObjectId
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
            content: {
              inline: [
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      // Create a third object to reference
      const thirdObjectId = createTestObject(db, typeId, 'Third Object');

      // Update the block to reference thirdObjectId instead
      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: thirdObjectId } },
                ],
              },
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Old ref should be gone
      const targetBacklinks = getBacklinks(db, targetObjectId);
      expect(targetBacklinks).toHaveLength(0);

      // New ref should exist
      const thirdBacklinks = getBacklinks(db, thirdObjectId);
      expect(thirdBacklinks).toHaveLength(1);
    });

    it('updates FTS when block content changes', () => {
      const blockId = generateId();

      // First insert a block
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
            content: {
              inline: [{ t: 'text', text: 'Original content' }],
            },
          },
        ],
      });

      // Update the content
      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: {
                inline: [{ t: 'text', text: 'Updated content' }],
              },
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Old content should not be searchable
      const oldSearch = searchBlocks(db, 'Original');
      expect(oldSearch).toHaveLength(0);

      // New content should be searchable
      const newSearch = searchBlocks(db, 'Updated');
      expect(newSearch).toHaveLength(1);
    });

    it('does not update indexing when only meta changes', () => {
      const blockId = generateId();

      // Insert a block with refs and text
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
            content: {
              inline: [
                { t: 'text', text: 'Hello ' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      const refsBefore = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();

      // Update only meta
      const result = applyBlockPatch(db, {
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

      expect(result.success).toBe(true);

      // Refs should remain unchanged (same count - IDs may differ due to re-insert logic)
      const refsAfter = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsAfter).toHaveLength(refsBefore.length);
    });
  });

  describe('delete operations', () => {
    it('cleans up refs when block is deleted', () => {
      const blockId = generateId();

      // Insert a block with refs
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
            content: {
              inline: [
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      // Verify ref exists
      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Delete the block
      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
            subtree: true,
          },
        ],
      });

      expect(result.success).toBe(true);

      // Ref should be cleaned up
      const refsResult = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();
      expect(refsResult).toHaveLength(0);

      // Backlinks should also be empty
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('cleans up FTS when block is deleted', () => {
      const blockId = generateId();

      // Insert a block with text
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
            content: {
              inline: [{ t: 'text', text: 'Searchable content' }],
            },
          },
        ],
      });

      // Verify FTS exists
      expect(searchBlocks(db, 'Searchable')).toHaveLength(1);

      // Delete the block
      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
            subtree: true,
          },
        ],
      });

      expect(result.success).toBe(true);

      // FTS should be cleaned up
      const ftsResult = db.all<{ block_id: string }>(
        `SELECT block_id FROM fts_blocks WHERE block_id = ?`,
        [blockId]
      );
      expect(ftsResult).toHaveLength(0);
    });

    it('cleans up refs and FTS for entire subtree on delete', () => {
      const parentBlockId = generateId();
      const childBlockId = generateId();

      // Insert parent and child blocks
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
            content: {
              inline: [
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
          {
            op: 'block.insert',
            blockId: childBlockId,
            parentBlockId: parentBlockId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Child content' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      // Verify both refs exist
      expect(getBacklinks(db, targetObjectId)).toHaveLength(2);

      // Delete parent (which should delete child too)
      const result = applyBlockPatch(db, {
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

      expect(result.success).toBe(true);

      // All refs should be cleaned up
      const allRefs = db.select().from(refs).all();
      expect(allRefs).toHaveLength(0);

      // All FTS should be cleaned up
      const allFts = db.all<{ block_id: string }>(`SELECT block_id FROM fts_blocks`);
      expect(allFts).toHaveLength(0);
    });
  });

  describe('multi-op patches', () => {
    it('indexes all operations in a single patch atomically', () => {
      const block1Id = generateId();
      const block2Id = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        ops: [
          {
            op: 'block.insert',
            blockId: block1Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'First block' }],
            },
          },
          {
            op: 'block.insert',
            blockId: block2Id,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Second block with ref: ' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Both blocks should be searchable
      const searchResult = searchBlocks(db, 'block');
      expect(searchResult).toHaveLength(2);

      // Ref from second block should be indexed
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(block2Id);
    });
  });
});
