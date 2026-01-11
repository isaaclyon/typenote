/**
 * Recent Objects Service tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import { objects, recentObjects } from './schema.js';
import { recordView, getRecentObjects, clearRecentObjects } from './recentObjectsService.js';

describe('RecentObjectsService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // recordView
  // ============================================================================

  describe('recordView', () => {
    it('records a view of an object', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      // Record view (should not throw)
      recordView(db, obj.id);

      // Verify object appears in recent list
      const recent = getRecentObjects(db);
      expect(recent).toHaveLength(1);
      expect(recent[0]?.id).toBe(obj.id);
    });

    it('updates timestamp on duplicate view', () => {
      const obj = createObject(db, 'Page', 'Test Page');

      // Manually insert with old timestamp using Drizzle
      const oldTimestamp = new Date('2024-01-01T00:00:00Z');
      db.insert(recentObjects).values({ objectId: obj.id, viewedAt: oldTimestamp }).run();

      // Verify old timestamp is in place
      const beforeUpdate = getRecentObjects(db);
      expect(beforeUpdate).toHaveLength(1);
      expect(beforeUpdate[0]?.viewedAt.getTime()).toBe(oldTimestamp.getTime());

      // Record view should update timestamp
      recordView(db, obj.id);
      const afterUpdate = getRecentObjects(db);

      // Should still be 1 entry (UPSERT semantics)
      expect(afterUpdate).toHaveLength(1);
      expect(afterUpdate[0]?.id).toBe(obj.id);

      // Timestamp should be updated (later than old timestamp)
      expect(afterUpdate[0]?.viewedAt.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });

    it('evicts oldest entry when exceeding 100 items', () => {
      // Create 101 objects and record views
      const objects = [];
      for (let i = 0; i < 101; i++) {
        const obj = createObject(db, 'Page', `Page ${i}`);
        objects.push(obj);
        recordView(db, obj.id);
      }

      // Should have exactly 100 entries (LRU eviction)
      const recent = getRecentObjects(db, 100);
      expect(recent).toHaveLength(100);

      // First object (oldest) should be evicted
      const firstObjectId = objects[0]?.id;
      expect(recent.some((r) => r.id === firstObjectId)).toBe(false);

      // Last object (newest) should be present
      const lastObjectId = objects[100]?.id;
      expect(recent.some((r) => r.id === lastObjectId)).toBe(true);
    });

    it('silently fails on invalid object ID (no throw)', () => {
      // Should not throw even with invalid ID
      expect(() => recordView(db, 'invalid-id-xyz')).not.toThrow();

      // Recent list should remain empty
      const recent = getRecentObjects(db);
      expect(recent).toHaveLength(0);
    });
  });

  // ============================================================================
  // getRecentObjects
  // ============================================================================

  describe('getRecentObjects', () => {
    it('returns empty array when no views recorded', () => {
      const recent = getRecentObjects(db);
      expect(recent).toEqual([]);
    });

    it('returns recent objects ordered by most recent first', () => {
      const obj1 = createObject(db, 'Page', 'First Page');
      const obj2 = createObject(db, 'Page', 'Second Page');
      const obj3 = createObject(db, 'Page', 'Third Page');

      // Manually insert with controlled timestamps (1 hour apart)
      const baseTime = new Date('2024-01-01T00:00:00Z').getTime();
      db.run('INSERT INTO recent_objects (object_id, viewed_at) VALUES (?, ?)', [
        obj1.id,
        baseTime,
      ]);
      db.run('INSERT INTO recent_objects (object_id, viewed_at) VALUES (?, ?)', [
        obj2.id,
        baseTime + 3600000, // 1 hour later
      ]);
      db.run('INSERT INTO recent_objects (object_id, viewed_at) VALUES (?, ?)', [
        obj3.id,
        baseTime + 7200000, // 2 hours later
      ]);

      const recent = getRecentObjects(db);
      expect(recent).toHaveLength(3);

      // Most recent first
      expect(recent[0]?.id).toBe(obj3.id);
      expect(recent[1]?.id).toBe(obj2.id);
      expect(recent[2]?.id).toBe(obj1.id);
    });

    it('returns object details including title and type', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      recordView(db, obj.id);

      const recent = getRecentObjects(db);
      expect(recent).toHaveLength(1);
      expect(recent[0]).toMatchObject({
        id: obj.id,
        title: 'Test Page',
        typeKey: 'Page',
      });
      expect(recent[0]?.viewedAt).toBeInstanceOf(Date);
    });

    it('respects limit parameter', () => {
      // Create 15 objects
      for (let i = 0; i < 15; i++) {
        const obj = createObject(db, 'Page', `Page ${i}`);
        recordView(db, obj.id);
      }

      const recent = getRecentObjects(db, 10);
      expect(recent).toHaveLength(10);
    });

    it('excludes soft-deleted objects', () => {
      const obj1 = createObject(db, 'Page', 'Active Page');
      const obj2 = createObject(db, 'Page', 'Deleted Page');

      recordView(db, obj1.id);
      recordView(db, obj2.id);

      // Soft-delete obj2
      db.update(objects).set({ deletedAt: new Date() }).where(eq(objects.id, obj2.id)).run();

      const recent = getRecentObjects(db);
      expect(recent).toHaveLength(1);
      expect(recent[0]?.id).toBe(obj1.id);
    });

    it('silently returns empty array on error', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw, return empty array
      const recent = getRecentObjects(db);
      expect(recent).toEqual([]);
    });
  });

  // ============================================================================
  // clearRecentObjects
  // ============================================================================

  describe('clearRecentObjects', () => {
    it('clears all recent object entries', () => {
      const obj1 = createObject(db, 'Page', 'Page 1');
      const obj2 = createObject(db, 'Page', 'Page 2');

      recordView(db, obj1.id);
      recordView(db, obj2.id);

      expect(getRecentObjects(db)).toHaveLength(2);

      clearRecentObjects(db);

      expect(getRecentObjects(db)).toHaveLength(0);
    });

    it('silently fails on error (no throw)', () => {
      // Close DB to force error
      closeDb(db);

      // Should not throw
      expect(() => clearRecentObjects(db)).not.toThrow();
    });
  });

  // ============================================================================
  // CASCADE DELETE behavior
  // ============================================================================

  describe('cascade delete', () => {
    it('removes recent entry when object is deleted', () => {
      const obj = createObject(db, 'Page', 'Test Page');
      recordView(db, obj.id);

      expect(getRecentObjects(db)).toHaveLength(1);

      // Delete the object (hard delete for test)
      db.delete(objects).where(eq(objects.id, obj.id)).run();

      // Recent entry should be automatically removed
      expect(getRecentObjects(db)).toHaveLength(0);
    });
  });
});
