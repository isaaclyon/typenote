import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType } from './objectTypeService.js';
import { listObjects } from './objectService.js';
import { objects } from './schema.js';
import { generateId } from '@typenote/core';

describe('ObjectService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('listObjects', () => {
    it('returns objects with type info ordered by updatedAt desc', () => {
      seedBuiltInTypes(db);

      // Create a custom type
      const customType = createObjectType(db, {
        key: 'Project',
        name: 'Project',
      });

      // Insert two objects with different updatedAt times
      const now = new Date();
      const earlier = new Date(now.getTime() - 1000);

      const olderId = generateId();
      const newerId = generateId();

      db.insert(objects)
        .values({
          id: olderId,
          typeId: customType.id,
          title: 'Older Project',
          docVersion: 0,
          properties: '{}',
          createdAt: earlier,
          updatedAt: earlier,
        })
        .run();

      db.insert(objects)
        .values({
          id: newerId,
          typeId: customType.id,
          title: 'Newer Project',
          docVersion: 0,
          properties: '{}',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const result = listObjects(db);

      expect(result).toHaveLength(2);
      // Newer should come first (desc order)
      expect(result[0]?.title).toBe('Newer Project');
      expect(result[0]?.typeKey).toBe('Project');
      expect(result[1]?.title).toBe('Older Project');
    });

    it('excludes soft-deleted objects', () => {
      seedBuiltInTypes(db);

      const customType = createObjectType(db, {
        key: 'Note',
        name: 'Note',
      });

      const activeId = generateId();
      const deletedId = generateId();
      const now = new Date();

      db.insert(objects)
        .values({
          id: activeId,
          typeId: customType.id,
          title: 'Active Note',
          docVersion: 0,
          properties: '{}',
          createdAt: now,
          updatedAt: now,
        })
        .run();

      db.insert(objects)
        .values({
          id: deletedId,
          typeId: customType.id,
          title: 'Deleted Note',
          docVersion: 0,
          properties: '{}',
          createdAt: now,
          updatedAt: now,
          deletedAt: now, // Soft deleted
        })
        .run();

      const result = listObjects(db);

      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe('Active Note');
    });

    it('returns empty array when no objects exist', () => {
      seedBuiltInTypes(db);

      const result = listObjects(db);

      expect(result).toEqual([]);
    });
  });
});
