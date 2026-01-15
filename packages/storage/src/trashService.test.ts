/**
 * Trash Service tests (TDD Phase 1 - RED).
 *
 * Tests for listing and restoring soft-deleted objects.
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { applyBlockPatch } from './applyBlockPatch.js';
import { searchBlocks } from './search.js';
import { getBacklinks } from './backlinks.js';
import { generateId } from '@typenote/core';
import { listDeletedObjects, restoreObject, TrashServiceError } from './trashService.js';

describe('TrashService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // listDeletedObjects
  // ============================================================================

  describe('listDeletedObjects', () => {
    it('returns empty array when no deleted objects', () => {
      const result = listDeletedObjects(db);
      expect(result).toEqual([]);
    });

    it('returns only soft-deleted objects (not active ones)', () => {
      createObject(db, 'Page', 'Active Page'); // Active - should not be returned
      const obj2 = createObject(db, 'Page', 'Deleted Page');

      // Soft delete obj2
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj2.id]);

      const result = listDeletedObjects(db);
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe(obj2.id);
      expect(result[0]?.title).toBe('Deleted Page');
    });

    it('orders by deletedAt DESC (most recent first)', () => {
      const obj1 = createObject(db, 'Page', 'First Deleted');
      const obj2 = createObject(db, 'Page', 'Second Deleted');

      const earlier = new Date(Date.now() - 1000);
      const later = new Date();

      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [earlier.getTime(), obj1.id]);
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [later.getTime(), obj2.id]);

      const result = listDeletedObjects(db);
      expect(result[0]?.id).toBe(obj2.id); // More recent first
      expect(result[1]?.id).toBe(obj1.id);
    });

    it('respects limit option', () => {
      // Create and delete 5 objects
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        const obj = createObject(db, 'Page', `Page ${i}`);
        db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);
      }

      const result = listDeletedObjects(db, { limit: 3 });
      expect(result).toHaveLength(3);
    });

    it('filters by typeKey when specified', () => {
      const page = createObject(db, 'Page', 'Deleted Page');
      const person = createObject(db, 'Person', 'Deleted Person');

      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), page.id]);
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), person.id]);

      const result = listDeletedObjects(db, { typeKey: 'Page' });
      expect(result).toHaveLength(1);
      expect(result[0]?.typeKey).toBe('Page');
    });

    it('includes typeKey in results via join', () => {
      const obj = createObject(db, 'Page', 'Test');
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);

      const result = listDeletedObjects(db);
      expect(result[0]?.typeKey).toBe('Page');
    });
  });

  // ============================================================================
  // restoreObject
  // ============================================================================

  describe('restoreObject', () => {
    it('throws OBJECT_NOT_FOUND for non-existent object', () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV'; // Valid ULID format

      expect(() => restoreObject(db, fakeId)).toThrow(TrashServiceError);
      try {
        restoreObject(db, fakeId);
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(TrashServiceError);
        expect((e as TrashServiceError).code).toBe('OBJECT_NOT_FOUND');
      }
    });

    it('returns no-op result for already active object', () => {
      const obj = createObject(db, 'Page', 'Active Page');

      const result = restoreObject(db, obj.id);

      expect(result.id).toBe(obj.id);
      expect(result.title).toBe('Active Page');
      expect(result.blocksRestored).toBe(0);
      expect(result.blocksReindexed).toBe(0);
    });

    it('clears deletedAt on object', () => {
      const obj = createObject(db, 'Page', 'Test');
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);

      restoreObject(db, obj.id);

      const row = db.all<{ deleted_at: number | null }>(
        'SELECT deleted_at FROM objects WHERE id = ?',
        [obj.id]
      )[0];
      expect(row?.deleted_at).toBeNull();
    });

    it('clears deletedAt on all object blocks', () => {
      const obj = createObject(db, 'Page', 'Test');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: obj.id,
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
      });

      // Soft delete object and blocks
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);
      db.run('UPDATE blocks SET deleted_at = ? WHERE object_id = ?', [now.getTime(), obj.id]);

      restoreObject(db, obj.id);

      const blockRows = db.all<{ deleted_at: number | null }>(
        'SELECT deleted_at FROM blocks WHERE object_id = ?',
        [obj.id]
      );
      expect(blockRows.every((b) => b.deleted_at === null)).toBe(true);
    });

    it('re-indexes FTS for restored blocks (verify searchable)', () => {
      const obj = createObject(db, 'Page', 'Searchable Page');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: obj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'unique_searchterm_xyz123' }] },
          },
        ],
      });

      // Verify searchable before delete
      expect(searchBlocks(db, 'unique_searchterm_xyz123').length).toBeGreaterThan(0);

      // Soft delete and clear FTS (simulating what delete should do)
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);
      db.run('UPDATE blocks SET deleted_at = ? WHERE object_id = ?', [now.getTime(), obj.id]);
      db.run('DELETE FROM fts_blocks WHERE object_id = ?', [obj.id]);

      // Verify not searchable after delete
      expect(searchBlocks(db, 'unique_searchterm_xyz123')).toHaveLength(0);

      // Restore
      restoreObject(db, obj.id);

      // Verify searchable again
      expect(searchBlocks(db, 'unique_searchterm_xyz123').length).toBeGreaterThan(0);
    });

    it('re-indexes refs for blocks with references (verify backlinks)', () => {
      const targetObj = createObject(db, 'Page', 'Target Page');
      const sourceObj = createObject(db, 'Page', 'Source Page');
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: targetObj.id },
                },
              ],
            },
          },
        ],
      });

      // Verify backlink exists
      expect(getBacklinks(db, targetObj.id).length).toBeGreaterThan(0);

      // Soft delete and clear refs
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), sourceObj.id]);
      db.run('UPDATE blocks SET deleted_at = ? WHERE object_id = ?', [now.getTime(), sourceObj.id]);
      db.run('DELETE FROM refs WHERE source_object_id = ?', [sourceObj.id]);

      // Verify backlink gone
      expect(getBacklinks(db, targetObj.id)).toHaveLength(0);

      // Restore
      restoreObject(db, sourceObj.id);

      // Verify backlink restored
      expect(getBacklinks(db, targetObj.id).length).toBeGreaterThan(0);
    });

    it('returns correct counts in result', () => {
      const obj = createObject(db, 'Page', 'Test');

      // Add 3 blocks
      for (let i = 0; i < 3; i++) {
        applyBlockPatch(db, {
          apiVersion: 'v1',
          objectId: obj.id,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: `Block ${i}` }] },
            },
          ],
        });
      }

      // Soft delete
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);
      db.run('UPDATE blocks SET deleted_at = ? WHERE object_id = ?', [now.getTime(), obj.id]);

      const result = restoreObject(db, obj.id);

      expect(result.id).toBe(obj.id);
      expect(result.title).toBe('Test');
      expect(result.blocksRestored).toBe(3);
      expect(result.blocksReindexed).toBe(3);
    });

    it('object no longer appears in listDeletedObjects after restore', () => {
      const obj = createObject(db, 'Page', 'Test');
      const now = new Date();
      db.run('UPDATE objects SET deleted_at = ? WHERE id = ?', [now.getTime(), obj.id]);

      expect(listDeletedObjects(db)).toHaveLength(1);

      restoreObject(db, obj.id);

      expect(listDeletedObjects(db)).toHaveLength(0);
    });
  });
});
