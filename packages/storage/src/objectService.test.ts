import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType, getObjectTypeByKey } from './objectTypeService.js';
import { listObjects, createObject, getObject, CreateObjectError } from './objectService.js';
import { createTemplate } from './templateService.js';
import { getDocument } from './getDocument.js';
import { objects } from './schema.js';
import { generateId } from '@typenote/core';
import { createTag, assignTags } from './tagService.js';

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

    describe('with default templates', () => {
      it('auto-applies default template when one exists', () => {
        seedBuiltInTypes(db);

        // Get the Page type
        const pageType = getObjectTypeByKey(db, 'Page');
        expect(pageType).not.toBeNull();
        if (!pageType) throw new Error('Expected Page type');

        // Create a default template for Page
        createTemplate(db, {
          objectTypeId: pageType.id,
          name: 'Default Page Template',
          content: {
            blocks: [
              {
                blockType: 'heading',
                content: { level: 1, inline: [{ t: 'text', text: '{{title}}' }] },
              },
              {
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: 'Start writing here...' }] },
              },
            ],
          },
          isDefault: true,
        });

        // Create an object - template should auto-apply
        const created = createObject(db, 'Page', 'My New Page');

        // Verify the document has blocks from the template
        const doc = getDocument(db, created.id);
        expect(doc.blocks).toHaveLength(2);

        const heading = doc.blocks[0];
        expect(heading).toBeDefined();
        if (!heading) throw new Error('Expected heading');
        expect(heading.blockType).toBe('heading');

        // Title placeholder should be substituted
        const headingContent = heading.content as {
          level: number;
          inline: Array<{ t: string; text: string }>;
        };
        const firstInline = headingContent.inline[0];
        expect(firstInline).toBeDefined();
        if (!firstInline) throw new Error('Expected inline');
        expect(firstInline.text).toBe('My New Page');

        // docVersion should be 1 (template applied)
        const obj = getObject(db, created.id);
        expect(obj).not.toBeNull();
        if (!obj) throw new Error('Expected object');
        expect(obj.docVersion).toBe(1);
      });

      it('does not apply template when none exists', () => {
        seedBuiltInTypes(db);

        // Create an object without any template
        const created = createObject(db, 'Page', 'Plain Page');

        // Verify the document has no blocks
        const doc = getDocument(db, created.id);
        expect(doc.blocks).toHaveLength(0);

        // docVersion should be 0 (no template applied)
        expect(created.docVersion).toBe(0);
      });

      it('skips template when applyDefaultTemplate is false', () => {
        seedBuiltInTypes(db);

        const pageType = getObjectTypeByKey(db, 'Page');
        expect(pageType).not.toBeNull();
        if (!pageType) throw new Error('Expected Page type');

        // Create a default template
        createTemplate(db, {
          objectTypeId: pageType.id,
          name: 'Default Template',
          content: {
            blocks: [
              {
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: 'Template content' }] },
              },
            ],
          },
          isDefault: true,
        });

        // Create object with template application disabled
        const created = createObject(db, 'Page', 'No Template Page', undefined, {
          applyDefaultTemplate: false,
        });

        // Verify no blocks were added
        const doc = getDocument(db, created.id);
        expect(doc.blocks).toHaveLength(0);
        expect(created.docVersion).toBe(0);
      });

      it('substitutes {{date_key}} for DailyNote', () => {
        seedBuiltInTypes(db);

        const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
        expect(dailyNoteType).not.toBeNull();
        if (!dailyNoteType) throw new Error('Expected DailyNote type');

        // Create a DailyNote template with date_key placeholder
        createTemplate(db, {
          objectTypeId: dailyNoteType.id,
          name: 'Daily Note Template',
          content: {
            blocks: [
              {
                blockType: 'heading',
                content: { level: 1, inline: [{ t: 'text', text: '📅 {{date_key}}' }] },
              },
            ],
          },
          isDefault: true,
        });

        // Create a DailyNote with date_key property
        const created = createObject(db, 'DailyNote', '2026-01-06', {
          date_key: '2026-01-06',
        });

        // Verify the date_key was substituted
        const doc = getDocument(db, created.id);
        expect(doc.blocks).toHaveLength(1);

        const heading = doc.blocks[0];
        expect(heading).toBeDefined();
        if (!heading) throw new Error('Expected heading');

        const content = heading.content as {
          level: number;
          inline: Array<{ t: string; text: string }>;
        };
        const firstInline = content.inline[0];
        expect(firstInline).toBeDefined();
        if (!firstInline) throw new Error('Expected inline');
        expect(firstInline.text).toBe('📅 2026-01-06');
      });

      it('only applies default template, not non-default ones', () => {
        seedBuiltInTypes(db);

        const pageType = getObjectTypeByKey(db, 'Page');
        expect(pageType).not.toBeNull();
        if (!pageType) throw new Error('Expected Page type');

        // Create a non-default template
        createTemplate(db, {
          objectTypeId: pageType.id,
          name: 'Non-Default Template',
          content: {
            blocks: [
              {
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: 'Non-default content' }] },
              },
            ],
          },
          isDefault: false,
        });

        // Create an object - should not have template applied
        const created = createObject(db, 'Page', 'Test Page');

        const doc = getDocument(db, created.id);
        expect(doc.blocks).toHaveLength(0);
      });
    });
  });

  describe('getObject', () => {
    it('returns null for non-existent object', () => {
      seedBuiltInTypes(db);

      const result = getObject(db, '01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(result).toBeNull();
    });

    it('returns object with empty tags array when no tags assigned', () => {
      seedBuiltInTypes(db);

      const created = createObject(db, 'Page', 'Test Page');
      const result = getObject(db, created.id);

      expect(result).not.toBeNull();
      expect(result?.tags).toEqual([]);
    });

    it('returns object with assigned tags', () => {
      seedBuiltInTypes(db);

      const created = createObject(db, 'Page', 'Test Page');
      const tag1 = createTag(db, { name: 'TypeScript', slug: 'typescript' });
      const tag2 = createTag(db, { name: 'React', slug: 'react' });

      assignTags(db, { objectId: created.id, tagIds: [tag1.id, tag2.id] });

      const result = getObject(db, created.id);

      expect(result).not.toBeNull();
      expect(result?.tags).toHaveLength(2);
      expect(result?.tags.map((t) => t.slug).sort()).toEqual(['react', 'typescript']);
    });

    it('returns full tag details including color and icon', () => {
      seedBuiltInTypes(db);

      const created = createObject(db, 'Page', 'Styled Page');
      const tag = createTag(db, {
        name: 'Important',
        slug: 'important',
        color: '#FF0000',
        icon: '⭐',
        description: 'High priority items',
      });

      assignTags(db, { objectId: created.id, tagIds: [tag.id] });

      const result = getObject(db, created.id);

      expect(result).not.toBeNull();
      expect(result?.tags).toHaveLength(1);
      const returnedTag = result?.tags[0];
      expect(returnedTag?.name).toBe('Important');
      expect(returnedTag?.color).toBe('#FF0000');
      expect(returnedTag?.icon).toBe('⭐');
      expect(returnedTag?.description).toBe('High priority items');
    });
  });
});
