import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType } from './objectTypeService.js';
import { listObjects, createObject, CreateObjectError } from './objectService.js';
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

  describe('createObject', () => {
    it('creates an object with valid type and title', () => {
      seedBuiltInTypes(db);

      const result = createObject(db, 'Page', 'My First Page');

      expect(result.id).toHaveLength(26); // ULID
      expect(result.title).toBe('My First Page');
      expect(result.typeKey).toBe('Page');
      expect(result.properties).toEqual({});
      expect(result.docVersion).toBe(0);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('creates an object with properties', () => {
      seedBuiltInTypes(db);

      const result = createObject(db, 'Person', 'John Doe', {
        email: 'john@example.com',
      });

      expect(result.title).toBe('John Doe');
      expect(result.typeKey).toBe('Person');
      expect(result.properties).toEqual({ email: 'john@example.com' });
    });

    it('throws TYPE_NOT_FOUND for unknown type key', () => {
      seedBuiltInTypes(db);

      expect(() => createObject(db, 'UnknownType', 'Test')).toThrow(CreateObjectError);
      try {
        createObject(db, 'UnknownType', 'Test');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CreateObjectError);
        expect((e as CreateObjectError).code).toBe('TYPE_NOT_FOUND');
      }
    });

    it('validates properties against type schema', () => {
      seedBuiltInTypes(db);

      // DailyNote requires date_key as a valid date string
      expect(() =>
        createObject(db, 'DailyNote', '2024-01-15', {
          date_key: 'not-a-valid-date',
        })
      ).toThrow(CreateObjectError);
      try {
        createObject(db, 'DailyNote', '2024-01-15', {
          date_key: 'not-a-valid-date',
        });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CreateObjectError);
        expect((e as CreateObjectError).code).toBe('VALIDATION_FAILED');
      }
    });

    it('accepts valid properties for DailyNote', () => {
      seedBuiltInTypes(db);

      const result = createObject(db, 'DailyNote', '2024-01-15', {
        date_key: '2024-01-15',
      });

      expect(result.title).toBe('2024-01-15');
      expect(result.properties).toEqual({ date_key: '2024-01-15' });
    });

    it('merges default values for missing properties', () => {
      // Create a custom type with default values
      seedBuiltInTypes(db);
      createObjectType(db, {
        key: 'Task',
        name: 'Task',
        schema: {
          properties: [
            {
              key: 'status',
              name: 'Status',
              type: 'select',
              required: false,
              options: ['todo', 'in-progress', 'done'],
              defaultValue: 'todo',
            },
            {
              key: 'priority',
              name: 'Priority',
              type: 'number',
              required: false,
              defaultValue: 1,
            },
          ],
        },
      });

      const result = createObject(db, 'Task', 'My Task');

      expect(result.properties).toEqual({ status: 'todo', priority: 1 });
    });

    it('user-provided properties override defaults', () => {
      seedBuiltInTypes(db);
      createObjectType(db, {
        key: 'Task',
        name: 'Task',
        schema: {
          properties: [
            {
              key: 'status',
              name: 'Status',
              type: 'select',
              required: false,
              options: ['todo', 'in-progress', 'done'],
              defaultValue: 'todo',
            },
          ],
        },
      });

      const result = createObject(db, 'Task', 'My Task', { status: 'done' });

      expect(result.properties).toEqual({ status: 'done' });
    });

    it('created object appears in listObjects', () => {
      seedBuiltInTypes(db);

      const created = createObject(db, 'Page', 'Test Page');
      const list = listObjects(db);

      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe(created.id);
      expect(list[0]?.title).toBe('Test Page');
    });

    it('validates select options', () => {
      seedBuiltInTypes(db);
      createObjectType(db, {
        key: 'Task',
        name: 'Task',
        schema: {
          properties: [
            {
              key: 'status',
              name: 'Status',
              type: 'select',
              required: false,
              options: ['todo', 'in-progress', 'done'],
            },
          ],
        },
      });

      try {
        createObject(db, 'Task', 'My Task', { status: 'invalid' });
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CreateObjectError);
        expect((e as CreateObjectError).code).toBe('VALIDATION_FAILED');
      }
    });
  });
});
