import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import {
  createObjectType,
  getObjectType,
  getObjectTypeByKey,
  listObjectTypes,
  updateObjectType,
  deleteObjectType,
  seedBuiltInTypes,
  isBuiltInTypeKey,
  ObjectTypeError,
  BUILT_IN_TYPES,
} from './objectTypeService.js';
import { BUILT_IN_TYPE_KEYS } from '@typenote/api';
import { objects } from './schema.js';
import { generateId } from '@typenote/core';

describe('ObjectTypeService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('createObjectType', () => {
    it('creates a new object type', () => {
      const result = createObjectType(db, {
        key: 'Project',
        name: 'Project',
      });

      expect(result.id).toHaveLength(26);
      expect(result.key).toBe('Project');
      expect(result.name).toBe('Project');
      expect(result.icon).toBeNull();
      expect(result.schema).toBeNull();
      expect(result.builtIn).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('creates a type with icon and schema', () => {
      const result = createObjectType(db, {
        key: 'Task',
        name: 'Task',
        icon: 'check-square',
        schema: {
          properties: [
            { key: 'due_date', name: 'Due Date', type: 'date', required: false },
            {
              key: 'status',
              name: 'Status',
              type: 'select',
              required: true,
              options: ['todo', 'done'],
            },
          ],
        },
      });

      expect(result.icon).toBe('check-square');
      expect(result.schema).toEqual({
        properties: [
          { key: 'due_date', name: 'Due Date', type: 'date', required: false },
          {
            key: 'status',
            name: 'Status',
            type: 'select',
            required: true,
            options: ['todo', 'done'],
          },
        ],
      });
    });

    it('throws TYPE_KEY_EXISTS for duplicate key', () => {
      createObjectType(db, { key: 'Project', name: 'Project' });

      expect(() => createObjectType(db, { key: 'Project', name: 'Another Project' })).toThrow(
        ObjectTypeError
      );

      try {
        createObjectType(db, { key: 'Project', name: 'Another Project' });
      } catch (error) {
        expect(error).toBeInstanceOf(ObjectTypeError);
        expect((error as ObjectTypeError).code).toBe('TYPE_KEY_EXISTS');
      }
    });
  });

  describe('getObjectType', () => {
    it('returns object type by ID', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });
      const result = getObjectType(db, created.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(created.id);
      expect(result?.key).toBe('Project');
    });

    it('returns null for non-existent ID', () => {
      const result = getObjectType(db, generateId());
      expect(result).toBeNull();
    });
  });

  describe('getObjectTypeByKey', () => {
    it('returns object type by key', () => {
      createObjectType(db, { key: 'Project', name: 'My Project' });
      const result = getObjectTypeByKey(db, 'Project');

      expect(result).not.toBeNull();
      expect(result?.key).toBe('Project');
      expect(result?.name).toBe('My Project');
    });

    it('returns null for non-existent key', () => {
      const result = getObjectTypeByKey(db, 'NonExistent');
      expect(result).toBeNull();
    });
  });

  describe('listObjectTypes', () => {
    it('lists all object types', () => {
      createObjectType(db, { key: 'TypeA', name: 'Type A' });
      createObjectType(db, { key: 'TypeB', name: 'Type B' });

      const result = listObjectTypes(db);
      expect(result).toHaveLength(2);
      expect(result.map((t) => t.key)).toContain('TypeA');
      expect(result.map((t) => t.key)).toContain('TypeB');
    });

    it('filters to built-in types only', () => {
      seedBuiltInTypes(db);
      createObjectType(db, { key: 'Custom', name: 'Custom' });

      const result = listObjectTypes(db, { builtInOnly: true });
      expect(result.every((t) => t.builtIn)).toBe(true);
      expect(result.length).toBe(BUILT_IN_TYPE_KEYS.length);
    });

    it('filters to custom types only', () => {
      seedBuiltInTypes(db);
      createObjectType(db, { key: 'Custom', name: 'Custom' });

      const result = listObjectTypes(db, { customOnly: true });
      expect(result.every((t) => !t.builtIn)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]?.key).toBe('Custom');
    });
  });

  describe('updateObjectType', () => {
    it('updates name of custom type', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });
      const updated = updateObjectType(db, created.id, { name: 'My Project' });

      expect(updated.name).toBe('My Project');
      expect(updated.key).toBe('Project'); // Key unchanged
    });

    it('updates icon', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });
      const updated = updateObjectType(db, created.id, { icon: 'folder' });

      expect(updated.icon).toBe('folder');
    });

    it('updates schema', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });
      const updated = updateObjectType(db, created.id, {
        schema: {
          properties: [{ key: 'priority', name: 'Priority', type: 'number', required: false }],
        },
      });

      expect(updated.schema).toEqual({
        properties: [{ key: 'priority', name: 'Priority', type: 'number', required: false }],
      });
    });

    it('clears icon when set to null', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project', icon: 'folder' });
      const updated = updateObjectType(db, created.id, { icon: null });

      expect(updated.icon).toBeNull();
    });

    it('throws TYPE_NOT_FOUND for non-existent ID', () => {
      expect(() => updateObjectType(db, generateId(), { name: 'Test' })).toThrow(ObjectTypeError);

      try {
        updateObjectType(db, generateId(), { name: 'Test' });
      } catch (error) {
        expect((error as ObjectTypeError).code).toBe('TYPE_NOT_FOUND');
      }
    });

    it('throws TYPE_BUILT_IN when changing name of built-in type', () => {
      seedBuiltInTypes(db);
      const page = getObjectTypeByKey(db, 'Page');

      expect(() => updateObjectType(db, page?.id ?? '', { name: 'My Page' })).toThrow(
        ObjectTypeError
      );

      try {
        updateObjectType(db, page?.id ?? '', { name: 'My Page' });
      } catch (error) {
        expect((error as ObjectTypeError).code).toBe('TYPE_BUILT_IN');
      }
    });

    it('allows updating icon and schema of built-in type', () => {
      seedBuiltInTypes(db);
      const page = getObjectTypeByKey(db, 'Page');

      const updated = updateObjectType(db, page?.id ?? '', {
        icon: 'custom-icon',
        schema: {
          properties: [{ key: 'tags', name: 'Tags', type: 'multiselect', required: false }],
        },
      });

      expect(updated.icon).toBe('custom-icon');
      expect(updated.schema?.properties).toHaveLength(1);
    });
  });

  describe('deleteObjectType', () => {
    it('deletes a custom type', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });
      deleteObjectType(db, created.id);

      const result = getObjectType(db, created.id);
      expect(result).toBeNull();
    });

    it('throws TYPE_NOT_FOUND for non-existent ID', () => {
      expect(() => deleteObjectType(db, generateId())).toThrow(ObjectTypeError);

      try {
        deleteObjectType(db, generateId());
      } catch (error) {
        expect((error as ObjectTypeError).code).toBe('TYPE_NOT_FOUND');
      }
    });

    it('throws TYPE_BUILT_IN for built-in type', () => {
      seedBuiltInTypes(db);
      const page = getObjectTypeByKey(db, 'Page');

      expect(() => deleteObjectType(db, page?.id ?? '')).toThrow(ObjectTypeError);

      try {
        deleteObjectType(db, page?.id ?? '');
      } catch (error) {
        expect((error as ObjectTypeError).code).toBe('TYPE_BUILT_IN');
      }
    });

    it('throws TYPE_IN_USE when type has objects', () => {
      const created = createObjectType(db, { key: 'Project', name: 'Project' });

      // Create an object using this type
      const now = new Date();
      db.insert(objects)
        .values({
          id: generateId(),
          typeId: created.id,
          title: 'Test Object',
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      expect(() => deleteObjectType(db, created.id)).toThrow(ObjectTypeError);

      try {
        deleteObjectType(db, created.id);
      } catch (error) {
        expect((error as ObjectTypeError).code).toBe('TYPE_IN_USE');
      }
    });
  });

  describe('seedBuiltInTypes', () => {
    it('seeds all built-in types', () => {
      seedBuiltInTypes(db);

      const types = listObjectTypes(db);
      expect(types.length).toBe(BUILT_IN_TYPE_KEYS.length);

      for (const key of BUILT_IN_TYPE_KEYS) {
        const type = types.find((t) => t.key === key);
        expect(type).toBeDefined();
        expect(type?.builtIn).toBe(true);
      }
    });

    it('is idempotent - does not duplicate types', () => {
      seedBuiltInTypes(db);
      seedBuiltInTypes(db);
      seedBuiltInTypes(db);

      const types = listObjectTypes(db);
      expect(types.length).toBe(BUILT_IN_TYPE_KEYS.length);
    });

    it('seeds correct configuration for DailyNote', () => {
      seedBuiltInTypes(db);

      const dailyNote = getObjectTypeByKey(db, 'DailyNote');
      expect(dailyNote).not.toBeNull();
      expect(dailyNote?.name).toBe('Daily Note');
      expect(dailyNote?.icon).toBe('calendar');
      expect(dailyNote?.schema?.properties).toHaveLength(1);
      expect(dailyNote?.schema?.properties[0]?.key).toBe('date_key');
    });

    it('seeds correct configuration for Page', () => {
      seedBuiltInTypes(db);

      const page = getObjectTypeByKey(db, 'Page');
      expect(page).not.toBeNull();
      expect(page?.name).toBe('Page');
      expect(page?.schema).toBeNull();
    });

    it('matches BUILT_IN_TYPES configuration', () => {
      seedBuiltInTypes(db);

      for (const key of BUILT_IN_TYPE_KEYS) {
        const type = getObjectTypeByKey(db, key);
        const config = BUILT_IN_TYPES[key];

        expect(type?.name).toBe(config?.name);
        expect(type?.icon).toBe(config?.icon);
        // Schema comparison (both could be null)
        if (config?.schema === null) {
          expect(type?.schema).toBeNull();
        } else {
          expect(type?.schema).toEqual(config?.schema);
        }
      }
    });
  });

  describe('isBuiltInTypeKey', () => {
    it('returns true for built-in type keys', () => {
      expect(isBuiltInTypeKey('DailyNote')).toBe(true);
      expect(isBuiltInTypeKey('Page')).toBe(true);
      expect(isBuiltInTypeKey('Person')).toBe(true);
      expect(isBuiltInTypeKey('Event')).toBe(true);
      expect(isBuiltInTypeKey('Place')).toBe(true);
    });

    it('returns false for custom type keys', () => {
      expect(isBuiltInTypeKey('Project')).toBe(false);
      expect(isBuiltInTypeKey('Task')).toBe(false);
      expect(isBuiltInTypeKey('custom')).toBe(false);
    });
  });
});
