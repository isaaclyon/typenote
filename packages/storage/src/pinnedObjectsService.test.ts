/**
 * Pinned Objects Service tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { objects, pinnedObjects } from './schema.js';
import {
  pinObject,
  unpinObject,
  isPinned,
  getPinnedObjects,
  reorderPinnedObjects,
  clearPinnedObjects,
} from './pinnedObjectsService.js';

describe('PinnedObjectsService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // pinObject
  // ============================================================================

  describe('pinObject', () => {
    it('pins a new object', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      // Pin object (should not throw)
      pinObject(db, obj.id);

      // Verify object appears in pinned list
      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(1);
      expect(pinned[0]?.id).toBe(obj.id);
      expect(pinned[0]?.order).toBe(0);
    });

    it('updates timestamp on duplicate pin', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      // Manually insert with old timestamp
      const oldTimestamp = new Date('2024-01-01T00:00:00Z');
      db.insert(pinnedObjects).values({ objectId: obj.id, pinnedAt: oldTimestamp, order: 0 }).run();

      // Verify old timestamp is in place
      const beforeUpdate = getPinnedObjects(db);
      expect(beforeUpdate).toHaveLength(1);
      expect(beforeUpdate[0]?.pinnedAt.getTime()).toBe(oldTimestamp.getTime());

      // Pin again should update timestamp
      pinObject(db, obj.id);
      const afterUpdate = getPinnedObjects(db);

      // Should still be 1 entry (UPSERT semantics)
      expect(afterUpdate).toHaveLength(1);
      expect(afterUpdate[0]?.id).toBe(obj.id);

      // Timestamp should be updated (later than old timestamp)
      expect(afterUpdate[0]?.pinnedAt.getTime()).toBeGreaterThan(oldTimestamp.getTime());

      // Order should remain unchanged
      expect(afterUpdate[0]?.order).toBe(0);
    });

    it('assigns sequential order to new pins', () => {
      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');
      const obj3 = createObject(db, 'Page', 'Page 3');

      pinObject(db, obj1.id);
      pinObject(db, obj2.id);
      pinObject(db, obj3.id);

      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(3);
      expect(pinned[0]?.order).toBe(0);
      expect(pinned[1]?.order).toBe(1);
      expect(pinned[2]?.order).toBe(2);
    });

    it('silently fails on invalid object ID (no throw)', () => {
      // Should not throw even with invalid ID
      expect(() => pinObject(db, 'invalid-id-xyz')).not.toThrow();

      // Pinned list should remain empty
      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(0);
    });
  });

  // ============================================================================
  // unpinObject
  // ============================================================================

  describe('unpinObject', () => {
    it('removes a pinned object', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);

      expect(getPinnedObjects(db)).toHaveLength(1);

      unpinObject(db, obj.id);

      expect(getPinnedObjects(db)).toHaveLength(0);
    });

    it('is idempotent (no error if not pinned)', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      // Unpin without pinning first (should not throw)
      expect(() => unpinObject(db, obj.id)).not.toThrow();
    });

    it('silently fails on error (no throw)', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw
      expect(() => unpinObject(db, 'some-id')).not.toThrow();
    });
  });

  // ============================================================================
  // isPinned
  // ============================================================================

  describe('isPinned', () => {
    it('returns true for pinned object', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);

      expect(isPinned(db, obj.id)).toBe(true);
    });

    it('returns false for unpinned object', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      expect(isPinned(db, obj.id)).toBe(false);
    });

    it('returns false after unpinning', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);
      unpinObject(db, obj.id);

      expect(isPinned(db, obj.id)).toBe(false);
    });

    it('returns false on error', () => {
      // Close DB to force error
      closeDb(db);

      // Should return false instead of throwing
      expect(isPinned(db, 'some-id')).toBe(false);
    });
  });

  // ============================================================================
  // getPinnedObjects
  // ============================================================================

  describe('getPinnedObjects', () => {
    it('returns empty array when no pins', () => {
      const pinned = getPinnedObjects(db);
      expect(pinned).toEqual([]);
    });

    it('returns pinned objects ordered by order column', () => {
      const obj1 = createObject(db, 'Page', 'First Page');
      const obj2 = createObject(db, 'Page', 'Second Page');
      const obj3 = createObject(db, 'Page', 'Third Page');

      // Pin in specific order
      pinObject(db, obj1.id);
      pinObject(db, obj2.id);
      pinObject(db, obj3.id);

      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(3);

      // Should be in pin order (0, 1, 2)
      expect(pinned[0]?.id).toBe(obj1.id);
      expect(pinned[1]?.id).toBe(obj2.id);
      expect(pinned[2]?.id).toBe(obj3.id);
    });

    it('returns object details including title and type', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);

      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(1);
      expect(pinned[0]).toMatchObject({
        id: obj.id,
        title: 'Test Page',
        typeKey: 'Page',
      });
      expect(pinned[0]?.pinnedAt).toBeInstanceOf(Date);
      expect(pinned[0]?.updatedAt).toBeInstanceOf(Date);
      expect(pinned[0]?.order).toBe(0);
    });

    it('excludes soft-deleted objects', () => {
      const obj1 = createObject(db, 'Page', 'Active Page');
      const obj2 = createObject(db, 'Page', 'Deleted Page');

      pinObject(db, obj1.id);
      pinObject(db, obj2.id);

      // Soft-delete obj2
      db.update(objects).set({ deletedAt: new Date() }).where(eq(objects.id, obj2.id)).run();

      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(1);
      expect(pinned[0]?.id).toBe(obj1.id);
    });

    it('silently returns empty array on error', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw, return empty array
      const pinned = getPinnedObjects(db);
      expect(pinned).toEqual([]);
    });
  });

  // ============================================================================
  // reorderPinnedObjects
  // ============================================================================

  describe('reorderPinnedObjects', () => {
    it('updates order based on array position', () => {
      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');
      const obj3 = createObject(db, 'Page', 'Page 3');

      // Pin in original order
      pinObject(db, obj1.id);
      pinObject(db, obj2.id);
      pinObject(db, obj3.id);

      // Reorder: 3, 1, 2
      reorderPinnedObjects(db, [obj3.id, obj1.id, obj2.id]);

      const pinned = getPinnedObjects(db);
      expect(pinned).toHaveLength(3);

      // Should be in new order
      expect(pinned[0]?.id).toBe(obj3.id);
      expect(pinned[0]?.order).toBe(0);
      expect(pinned[1]?.id).toBe(obj1.id);
      expect(pinned[1]?.order).toBe(1);
      expect(pinned[2]?.id).toBe(obj2.id);
      expect(pinned[2]?.order).toBe(2);
    });

    it('handles partial reorder (only some IDs)', () => {
      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');
      const obj3 = createObject(db, 'Page', 'Page 3');

      pinObject(db, obj1.id);
      pinObject(db, obj2.id);
      pinObject(db, obj3.id);

      // Only reorder two of them
      reorderPinnedObjects(db, [obj2.id, obj1.id]);

      const pinned = getPinnedObjects(db);

      // obj2 and obj1 should have new orders
      const pin1 = pinned.find((p) => p.id === obj1.id);
      const pin2 = pinned.find((p) => p.id === obj2.id);
      const pin3 = pinned.find((p) => p.id === obj3.id);

      expect(pin2?.order).toBe(0);
      expect(pin1?.order).toBe(1);
      expect(pin3?.order).toBe(2); // Unchanged
    });

    it('silently fails on error (no throw)', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw
      expect(() => reorderPinnedObjects(db, ['id1', 'id2'])).not.toThrow();
    });
  });

  // ============================================================================
  // clearPinnedObjects
  // ============================================================================

  describe('clearPinnedObjects', () => {
    it('clears all pinned object entries', () => {
      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');

      pinObject(db, obj1.id);
      pinObject(db, obj2.id);

      expect(getPinnedObjects(db)).toHaveLength(2);

      clearPinnedObjects(db);

      expect(getPinnedObjects(db)).toHaveLength(0);
    });

    it('silently fails on error (no throw)', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw
      expect(() => clearPinnedObjects(db)).not.toThrow();
    });
  });

  // ============================================================================
  // CASCADE DELETE behavior
  // ============================================================================

  describe('cascade delete', () => {
    it('removes pin when object is hard-deleted', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);

      expect(getPinnedObjects(db)).toHaveLength(1);

      // Delete the object (hard delete)
      db.delete(objects).where(eq(objects.id, obj.id)).run();

      // Pin entry should be automatically removed
      expect(getPinnedObjects(db)).toHaveLength(0);
    });

    it('soft-delete hides object from pinned list but keeps pin record', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      pinObject(db, obj.id);

      expect(getPinnedObjects(db)).toHaveLength(1);

      // Soft-delete the object
      db.update(objects).set({ deletedAt: new Date() }).where(eq(objects.id, obj.id)).run();

      // getPinnedObjects should filter it out
      expect(getPinnedObjects(db)).toHaveLength(0);

      // But isPinned should still return true (pin record exists)
      expect(isPinned(db, obj.id)).toBe(true);
    });
  });
});
