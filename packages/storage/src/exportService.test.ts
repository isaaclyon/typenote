import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, getObjectTypeByKey, createObjectType } from './objectTypeService.js';
import { objects, blocks, refs } from './schema.js';
import { generateId } from '@typenote/core';
import { eq } from 'drizzle-orm';
import {
  deterministicStringify,
  exportObject,
  exportObjectsByType,
  exportToFolder,
  importObject,
  importFromFolder,
  type ExportedType,
  type ExportedObject,
} from './exportService.js';

// Helper to create an object with blocks for testing
function createObjectWithBlocks(
  db: TypenoteDb,
  typeKey: string,
  title: string,
  blockData: Array<{
    id: string;
    parentBlockId: string | null;
    orderKey: string;
    blockType: string;
    content: unknown;
  }>
): string {
  const objectType = getObjectTypeByKey(db, typeKey);
  if (!objectType) throw new Error(`${typeKey} type not found`);

  const objectId = generateId();
  const now = new Date();

  db.insert(objects)
    .values({
      id: objectId,
      typeId: objectType.id,
      title,
      properties: JSON.stringify({}),
      docVersion: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  for (const block of blockData) {
    db.insert(blocks)
      .values({
        id: block.id,
        objectId,
        parentBlockId: block.parentBlockId,
        orderKey: block.orderKey,
        blockType: block.blockType,
        content: JSON.stringify(block.content),
        meta: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }

  return objectId;
}

describe('exportService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('deterministicStringify', () => {
    it('sorts object keys alphabetically', () => {
      const input = { zebra: 1, apple: 2, mango: 3 };

      const result = deterministicStringify(input);

      // Keys should be sorted: apple, mango, zebra
      expect(result).toBe('{\n  "apple": 2,\n  "mango": 3,\n  "zebra": 1\n}\n');
    });

    it('uses 2-space indentation', () => {
      const input = { nested: { value: 42 } };

      const result = deterministicStringify(input);

      expect(result).toBe('{\n  "nested": {\n    "value": 42\n  }\n}\n');
    });

    it('adds trailing newline', () => {
      const input = { a: 1 };

      const result = deterministicStringify(input);

      expect(result.endsWith('\n')).toBe(true);
    });

    it('sorts nested object keys', () => {
      const input = { outer: { z: 1, a: 2 } };

      const result = deterministicStringify(input);

      expect(result).toBe('{\n  "outer": {\n    "a": 2,\n    "z": 1\n  }\n}\n');
    });

    it('preserves array order (does not sort arrays)', () => {
      const input = { items: [3, 1, 2] };

      const result = deterministicStringify(input);

      expect(result).toBe('{\n  "items": [\n    3,\n    1,\n    2\n  ]\n}\n');
    });

    it('handles arrays of objects with sorted keys', () => {
      const input = { items: [{ z: 1, a: 2 }] };

      const result = deterministicStringify(input);

      expect(result).toBe('{\n  "items": [\n    {\n      "a": 2,\n      "z": 1\n    }\n  ]\n}\n');
    });
  });

  describe('exportObject', () => {
    it('exports a basic object with correct structure', () => {
      // Create a Page object (no special properties)
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const objectId = generateId();
      const now = new Date();
      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Test Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const result = exportObject(db, objectId);

      expect(result).not.toBeNull();
      expect(result?.$schema).toBe('typenote/object/v1');
      expect(result?.id).toBe(objectId);
      expect(result?.typeKey).toBe('Page');
      expect(result?.title).toBe('Test Page');
      expect(result?.properties).toEqual({});
      expect(result?.docVersion).toBe(0);
      expect(result?.blocks).toEqual([]);
    });

    it('exports object with nested block tree', () => {
      const blockId1 = generateId();
      const blockId2 = generateId();
      const blockId3 = generateId();

      const objectId = createObjectWithBlocks(db, 'Page', 'Page with Blocks', [
        {
          id: blockId1,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: 'Title' }] },
        },
        {
          id: blockId2,
          parentBlockId: null,
          orderKey: 'a1',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'First paragraph' }] },
        },
        {
          id: blockId3,
          parentBlockId: blockId2,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Nested paragraph' }] },
        },
      ]);

      const result = exportObject(db, objectId);

      expect(result).not.toBeNull();
      expect(result?.blocks).toHaveLength(2); // Two root blocks
      expect(result?.blocks[0]?.id).toBe(blockId1);
      expect(result?.blocks[0]?.blockType).toBe('heading');
      expect(result?.blocks[0]?.children).toHaveLength(0);
      expect(result?.blocks[1]?.id).toBe(blockId2);
      expect(result?.blocks[1]?.children).toHaveLength(1);
      expect(result?.blocks[1]?.children[0]?.id).toBe(blockId3);
    });

    it('exports timestamps as ISO strings', () => {
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const objectId = generateId();
      const createdAt = new Date('2026-01-04T10:30:00.000Z');
      const updatedAt = new Date('2026-01-04T14:45:00.000Z');

      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Test Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt,
          updatedAt,
        })
        .run();

      const result = exportObject(db, objectId);

      expect(result?.createdAt).toBe('2026-01-04T10:30:00.000Z');
      expect(result?.updatedAt).toBe('2026-01-04T14:45:00.000Z');
    });

    it('returns null for non-existent object', () => {
      const result = exportObject(db, generateId());

      expect(result).toBeNull();
    });

    it('returns null for deleted object', () => {
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const objectId = generateId();
      const now = new Date();

      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Deleted Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
          deletedAt: now, // Soft deleted
        })
        .run();

      const result = exportObject(db, objectId);

      expect(result).toBeNull();
    });
  });

  describe('exportObjectsByType', () => {
    it('exports all non-deleted objects of a specific type', () => {
      const pageType = getObjectTypeByKey(db, 'Page');
      const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
      if (!pageType || !dailyNoteType) throw new Error('Types not found');

      const now = new Date();

      // Create 2 Page objects
      const pageId1 = generateId();
      const pageId2 = generateId();
      db.insert(objects)
        .values([
          {
            id: pageId1,
            typeId: pageType.id,
            title: 'Page 1',
            properties: JSON.stringify({}),
            docVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: pageId2,
            typeId: pageType.id,
            title: 'Page 2',
            properties: JSON.stringify({}),
            docVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
        ])
        .run();

      // Create 1 DailyNote object
      const dailyNoteId = generateId();
      db.insert(objects)
        .values({
          id: dailyNoteId,
          typeId: dailyNoteType.id,
          title: '2026-01-04',
          properties: JSON.stringify({ date_key: '2026-01-04' }),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Create 1 deleted Page object (should be excluded)
      const deletedPageId = generateId();
      db.insert(objects)
        .values({
          id: deletedPageId,
          typeId: pageType.id,
          title: 'Deleted Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
          deletedAt: now,
        })
        .run();

      // Export all Page objects
      const result = exportObjectsByType(db, 'Page');

      // Should only export the 2 non-deleted Page objects
      expect(result).toHaveLength(2);
      expect(result.map((obj) => obj.id).sort()).toEqual([pageId1, pageId2].sort());
      expect(result.every((obj) => obj.typeKey === 'Page')).toBe(true);
    });

    it('returns empty array for non-existent type', () => {
      const result = exportObjectsByType(db, 'NonExistentType');

      expect(result).toEqual([]);
    });

    it('returns empty array when no objects exist for type', () => {
      // DailyNote type exists but has no objects
      const result = exportObjectsByType(db, 'DailyNote');

      expect(result).toEqual([]);
    });
  });

  describe('exportToFolder', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'typenote-export-test-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('creates folder structure with manifest.json, types/, and objects/ directories', () => {
      const manifest = exportToFolder(db, tempDir);

      // Verify manifest.json exists
      expect(existsSync(join(tempDir, 'manifest.json'))).toBe(true);

      // Verify types/ directory exists
      expect(existsSync(join(tempDir, 'types'))).toBe(true);

      // Verify objects/ directory exists
      expect(existsSync(join(tempDir, 'objects'))).toBe(true);

      // Verify manifest structure
      expect(manifest.$schema).toBe('typenote/manifest/v1');
      expect(typeof manifest.exportedAt).toBe('string');
      expect(typeof manifest.typeCount).toBe('number');
      expect(typeof manifest.objectCount).toBe('number');
      expect(typeof manifest.blockCount).toBe('number');
    });

    it('writes object files to objects/<TypeKey>/<objectId>.json', () => {
      // Create a Page object
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const objectId = generateId();
      const now = new Date();

      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Test Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      const manifest = exportToFolder(db, tempDir);

      // Verify object file exists at correct path
      const objectFilePath = join(tempDir, 'objects', 'Page', `${objectId}.json`);
      expect(existsSync(objectFilePath)).toBe(true);

      // Verify file content matches exportObject output
      const fileContent = readFileSync(objectFilePath, 'utf-8');
      const exported = exportObject(db, objectId);
      expect(fileContent).toBe(deterministicStringify(exported));

      // Verify manifest counts
      expect(manifest.objectCount).toBe(1);
      expect(manifest.blockCount).toBe(0);
    });

    it('exports custom (non-built-in) types to types/<typeKey>.json', () => {
      // Create a custom object type
      const customType = createObjectType(db, {
        key: 'Recipe',
        name: 'Recipe',
        icon: 'utensils',
        schema: {
          properties: [{ key: 'prep_time', name: 'Prep Time', type: 'number', required: false }],
        },
      });

      const manifest = exportToFolder(db, tempDir);

      // Verify custom type file exists
      const typeFilePath = join(tempDir, 'types', 'Recipe.json');
      expect(existsSync(typeFilePath)).toBe(true);

      // Verify type file content
      const fileContent = readFileSync(typeFilePath, 'utf-8');
      const parsed = JSON.parse(fileContent) as ExportedType;
      expect(parsed.$schema).toBe('typenote/type/v1');
      expect(parsed.key).toBe('Recipe');
      expect(parsed.name).toBe('Recipe');
      expect(parsed.icon).toBe('utensils');
      expect(parsed.builtIn).toBe(false);
      expect(parsed.schema).toEqual(customType.schema);

      // Verify built-in types are NOT exported
      expect(existsSync(join(tempDir, 'types', 'Page.json'))).toBe(false);
      expect(existsSync(join(tempDir, 'types', 'DailyNote.json'))).toBe(false);

      // Verify manifest typeCount
      expect(manifest.typeCount).toBe(1);
    });
  });

  describe('importObject', () => {
    it('imports a basic object with no blocks', () => {
      const objectId = generateId();
      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Imported Page',
        properties: {},
        docVersion: 5,
        createdAt: '2026-01-04T10:00:00.000Z',
        updatedAt: '2026-01-04T12:00:00.000Z',
        blocks: [],
      };

      const result = importObject(db, exportedObject);

      // Verify success
      expect(result.success).toBe(true);
      expect(result.objectId).toBe(objectId);
      expect(result.blocksImported).toBe(0);
      expect(result.error).toBeUndefined();

      // Verify object exists in DB with correct data
      const imported = exportObject(db, objectId);
      expect(imported).not.toBeNull();
      expect(imported?.title).toBe('Imported Page');
      expect(imported?.typeKey).toBe('Page');
      expect(imported?.properties).toEqual({});
      expect(imported?.docVersion).toBe(5);
      expect(imported?.createdAt).toBe('2026-01-04T10:00:00.000Z');
      expect(imported?.updatedAt).toBe('2026-01-04T12:00:00.000Z');
    });

    it('resolves typeKey to correct typeId', () => {
      const objectId = generateId();
      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Page Object',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [],
      };

      const result = importObject(db, exportedObject);

      expect(result.success).toBe(true);

      // Verify the object's typeId matches the Page type
      const pageType = getObjectTypeByKey(db, 'Page');
      const rows = db
        .select({ typeId: objects.typeId })
        .from(objects)
        .where(eq(objects.id, objectId))
        .all();
      expect(rows[0]?.typeId).toBe(pageType?.id);
    });

    it('returns error for invalid typeKey', () => {
      const objectId = generateId();
      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'NonExistentType',
        title: 'Invalid Type',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [],
      };

      const result = importObject(db, exportedObject);

      expect(result.success).toBe(false);
      expect(result.error).toContain('NonExistentType');
      expect(result.blocksImported).toBe(0);
    });

    it('imports object with nested blocks maintaining hierarchy', () => {
      const objectId = generateId();
      const blockId1 = generateId();
      const blockId2 = generateId();
      const blockId3 = generateId();

      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Page with Blocks',
        properties: {},
        docVersion: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [
          {
            id: blockId1,
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Heading' }] },
            meta: null,
            children: [],
          },
          {
            id: blockId2,
            parentBlockId: null,
            orderKey: 'a1',
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Parent paragraph' }] },
            meta: null,
            children: [
              {
                id: blockId3,
                parentBlockId: blockId2,
                orderKey: 'a0',
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: 'Nested paragraph' }] },
                meta: { collapsed: true },
                children: [],
              },
            ],
          },
        ],
      };

      const result = importObject(db, exportedObject);

      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(3);

      // Verify blocks exist in DB with correct relationships
      const allBlocks = db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();

      expect(allBlocks).toHaveLength(3);

      // Check block1 (root heading)
      const block1 = allBlocks.find((b) => b.id === blockId1);
      expect(block1?.parentBlockId).toBeNull();
      expect(block1?.blockType).toBe('heading');

      // Check block2 (root paragraph with child)
      const block2 = allBlocks.find((b) => b.id === blockId2);
      expect(block2?.parentBlockId).toBeNull();
      expect(block2?.blockType).toBe('paragraph');

      // Check block3 (nested under block2)
      const block3 = allBlocks.find((b) => b.id === blockId3);
      expect(block3?.parentBlockId).toBe(blockId2);
      expect(block3?.meta).toBe(JSON.stringify({ collapsed: true }));
    });

    it('rebuilds refs table for blocks with object references', () => {
      // First create a target object to reference
      const targetObjectId = generateId();
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      db.insert(objects)
        .values({
          id: targetObjectId,
          typeId: pageType.id,
          title: 'Target Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      // Now import an object with a reference to the target
      const objectId = generateId();
      const blockId = generateId();

      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Page with Reference',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [
          {
            id: blockId,
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'See ' },
                { t: 'ref', target: { kind: 'object', objectId: targetObjectId } },
              ],
            },
            meta: null,
            children: [],
          },
        ],
      };

      const result = importObject(db, exportedObject);

      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(1);

      // Verify refs table has the reference
      const refRows = db.select().from(refs).where(eq(refs.sourceBlockId, blockId)).all();

      expect(refRows).toHaveLength(1);
      expect(refRows[0]?.sourceObjectId).toBe(objectId);
      expect(refRows[0]?.targetObjectId).toBe(targetObjectId);
    });

    it('replaces existing object with mode=replace (default)', () => {
      // Create initial object
      const objectId = generateId();
      const blockId1 = generateId();

      const initialExport: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Original Title',
        properties: { key: 'original' },
        docVersion: 1,
        createdAt: '2026-01-04T10:00:00.000Z',
        updatedAt: '2026-01-04T10:00:00.000Z',
        blocks: [
          {
            id: blockId1,
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Original content' }] },
            meta: null,
            children: [],
          },
        ],
      };

      // Import initial version
      importObject(db, initialExport);

      // Create modified export
      const blockId2 = generateId();
      const modifiedExport: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Updated Title',
        properties: { key: 'updated' },
        docVersion: 2,
        createdAt: '2026-01-04T10:00:00.000Z',
        updatedAt: '2026-01-04T12:00:00.000Z',
        blocks: [
          {
            id: blockId2,
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'New heading' }] },
            meta: null,
            children: [],
          },
        ],
      };

      // Import with replace mode (default)
      const result = importObject(db, modifiedExport, { mode: 'replace' });

      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(1);

      // Verify object is updated
      const exported = exportObject(db, objectId);
      expect(exported?.title).toBe('Updated Title');
      expect(exported?.properties).toEqual({ key: 'updated' });
      expect(exported?.docVersion).toBe(2);

      // Verify old block is gone and new block exists
      const allBlocks = db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();

      expect(allBlocks).toHaveLength(1);
      expect(allBlocks[0]?.id).toBe(blockId2);
      expect(allBlocks[0]?.blockType).toBe('heading');
    });

    it('skips import if object exists with mode=skip', () => {
      // Create initial object
      const objectId = generateId();

      const initialExport: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'Original Title',
        properties: {},
        docVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [],
      };

      // Import initial version
      importObject(db, initialExport);

      // Try to import modified version with skip mode
      const modifiedExport: ExportedObject = {
        ...initialExport,
        title: 'Modified Title',
        docVersion: 2,
      };

      const result = importObject(db, modifiedExport, { mode: 'skip' });

      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(0);

      // Verify object was NOT updated (still has original title)
      const exported = exportObject(db, objectId);
      expect(exported?.title).toBe('Original Title');
      expect(exported?.docVersion).toBe(1);
    });

    it('imports new object even with mode=skip', () => {
      const objectId = generateId();

      const exportedObject: ExportedObject = {
        $schema: 'typenote/object/v1',
        id: objectId,
        typeKey: 'Page',
        title: 'New Page',
        properties: {},
        docVersion: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        blocks: [],
      };

      const result = importObject(db, exportedObject, { mode: 'skip' });

      expect(result.success).toBe(true);

      // Verify object was created
      const exported = exportObject(db, objectId);
      expect(exported).not.toBeNull();
      expect(exported?.title).toBe('New Page');
    });
  });

  describe('importFromFolder', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = mkdtempSync(join(tmpdir(), 'typenote-import-test-'));
    });

    afterEach(() => {
      rmSync(tempDir, { recursive: true, force: true });
    });

    it('imports from a folder with manifest.json, types/, objects/ structure', () => {
      // First export some data to create the folder structure
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const objectId = generateId();
      const now = new Date();

      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Test Page',
          properties: JSON.stringify({}),
          docVersion: 1,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Export to folder
      exportToFolder(db, tempDir);

      // Create a fresh DB and import
      const db2 = createTestDb();
      seedBuiltInTypes(db2);

      const result = importFromFolder(db2, tempDir);

      expect(result.success).toBe(true);
      expect(result.objectsImported).toBe(1);
      expect(result.errors).toHaveLength(0);

      // Verify the object was imported
      const imported = exportObject(db2, objectId);
      expect(imported).not.toBeNull();
      expect(imported?.title).toBe('Test Page');

      closeDb(db2);
    });

    it('imports custom types from types/ folder', () => {
      // Create a custom type and an object of that type
      const customType = createObjectType(db, {
        key: 'Recipe',
        name: 'Recipe',
        icon: 'utensils',
        schema: {
          properties: [{ key: 'prep_time', name: 'Prep Time', type: 'number', required: false }],
        },
      });

      const objectId = generateId();
      const now = new Date();

      db.insert(objects)
        .values({
          id: objectId,
          typeId: customType.id,
          title: 'Chocolate Cake',
          properties: JSON.stringify({ prep_time: 30 }),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Export to folder
      exportToFolder(db, tempDir);

      // Create fresh DB (only built-in types)
      const db2 = createTestDb();
      seedBuiltInTypes(db2);

      // Verify Recipe type doesn't exist yet
      expect(getObjectTypeByKey(db2, 'Recipe')).toBeNull();

      // Import from folder
      const result = importFromFolder(db2, tempDir);

      expect(result.success).toBe(true);
      expect(result.typesImported).toBe(1);
      expect(result.objectsImported).toBe(1);

      // Verify Recipe type was created
      const importedType = getObjectTypeByKey(db2, 'Recipe');
      expect(importedType).not.toBeNull();
      expect(importedType?.name).toBe('Recipe');
      expect(importedType?.icon).toBe('utensils');
      expect(importedType?.builtIn).toBe(false);

      // Verify object was imported with correct type
      const importedObject = exportObject(db2, objectId);
      expect(importedObject).not.toBeNull();
      expect(importedObject?.typeKey).toBe('Recipe');
      expect(importedObject?.title).toBe('Chocolate Cake');

      closeDb(db2);
    });

    it('imports objects from objects/<TypeKey>/ directories', () => {
      // Create multiple objects of different types
      const pageType = getObjectTypeByKey(db, 'Page');
      const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
      if (!pageType || !dailyNoteType) throw new Error('Types not found');

      const now = new Date();

      const pageId1 = generateId();
      const pageId2 = generateId();
      const dailyNoteId = generateId();

      db.insert(objects)
        .values([
          {
            id: pageId1,
            typeId: pageType.id,
            title: 'Page 1',
            properties: JSON.stringify({}),
            docVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: pageId2,
            typeId: pageType.id,
            title: 'Page 2',
            properties: JSON.stringify({}),
            docVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
          {
            id: dailyNoteId,
            typeId: dailyNoteType.id,
            title: '2026-01-04',
            properties: JSON.stringify({ date_key: '2026-01-04' }),
            docVersion: 0,
            createdAt: now,
            updatedAt: now,
          },
        ])
        .run();

      // Export to folder
      exportToFolder(db, tempDir);

      // Create fresh DB and import
      const db2 = createTestDb();
      seedBuiltInTypes(db2);

      const result = importFromFolder(db2, tempDir);

      expect(result.success).toBe(true);
      expect(result.objectsImported).toBe(3);

      // Verify all objects were imported
      expect(exportObject(db2, pageId1)).not.toBeNull();
      expect(exportObject(db2, pageId2)).not.toBeNull();
      expect(exportObject(db2, dailyNoteId)).not.toBeNull();

      closeDb(db2);
    });

    it('returns accurate counts and any errors', () => {
      // Create some valid objects
      const pageType = getObjectTypeByKey(db, 'Page');
      if (!pageType) throw new Error('Page type not found');

      const now = new Date();
      const objectId = generateId();
      const blockId = generateId();

      db.insert(objects)
        .values({
          id: objectId,
          typeId: pageType.id,
          title: 'Page with Blocks',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      db.insert(blocks)
        .values({
          id: blockId,
          objectId,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: JSON.stringify({ inline: [{ t: 'text', text: 'Hello' }] }),
          meta: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Export to folder
      const manifest = exportToFolder(db, tempDir);

      // Create fresh DB and import
      const db2 = createTestDb();
      seedBuiltInTypes(db2);

      const result = importFromFolder(db2, tempDir);

      expect(result.success).toBe(true);
      expect(result.typesImported).toBe(manifest.typeCount);
      expect(result.objectsImported).toBe(manifest.objectCount);
      expect(result.blocksImported).toBe(manifest.blockCount);
      expect(result.errors).toHaveLength(0);

      closeDb(db2);
    });

    it('skips types that already exist', () => {
      // Create a custom type
      createObjectType(db, {
        key: 'CustomTask',
        name: 'Custom Task',
        icon: 'check',
        schema: undefined,
      });

      // Export to folder
      exportToFolder(db, tempDir);

      // Create fresh DB with built-in types AND the CustomTask type already
      const db2 = createTestDb();
      seedBuiltInTypes(db2);
      createObjectType(db2, {
        key: 'CustomTask',
        name: 'Custom Task (Already Exists)',
        icon: 'check-circle',
        schema: undefined,
      });

      // Import from folder
      const result = importFromFolder(db2, tempDir);

      expect(result.success).toBe(true);
      // Type should be skipped (already exists)
      expect(result.typesImported).toBe(0);

      // Verify the existing type was not overwritten
      const existingType = getObjectTypeByKey(db2, 'CustomTask');
      expect(existingType?.name).toBe('Custom Task (Already Exists)');
      expect(existingType?.icon).toBe('check-circle');

      closeDb(db2);
    });
  });

  describe('round-trip invariant', () => {
    let tempDirA: string;
    let tempDirB: string;

    beforeEach(() => {
      tempDirA = mkdtempSync(join(tmpdir(), 'typenote-roundtrip-a-'));
      tempDirB = mkdtempSync(join(tmpdir(), 'typenote-roundtrip-b-'));
    });

    afterEach(() => {
      rmSync(tempDirA, { recursive: true, force: true });
      rmSync(tempDirB, { recursive: true, force: true });
    });

    it('round-trip produces identical export', () => {
      // 1. Create object with blocks in DB
      const blockId1 = generateId();
      const blockId2 = generateId();
      const blockId3 = generateId();

      const objectId = createObjectWithBlocks(db, 'Page', 'Round-trip Test Page', [
        {
          id: blockId1,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: 'Main Heading' }] },
        },
        {
          id: blockId2,
          parentBlockId: null,
          orderKey: 'a1',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'A paragraph with some content.' }] },
        },
        {
          id: blockId3,
          parentBlockId: blockId2,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Nested paragraph' }] },
        },
      ]);

      // Also create a custom type with an object
      const customType = createObjectType(db, {
        key: 'Project',
        name: 'Project',
        icon: 'folder',
        schema: {
          properties: [{ key: 'status', name: 'Status', type: 'text', required: false }],
        },
      });

      const projectId = generateId();
      const now = new Date();
      db.insert(objects)
        .values({
          id: projectId,
          typeId: customType.id,
          title: 'Test Project',
          properties: JSON.stringify({ status: 'active' }),
          docVersion: 3,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // 2. Export to folder A
      exportToFolder(db, tempDirA);

      // 3. Create fresh DB, import from folder A
      const db2 = createTestDb();
      seedBuiltInTypes(db2);
      importFromFolder(db2, tempDirA);

      // 4. Export to folder B
      exportToFolder(db2, tempDirB);

      // 5. Compare files in A and B (should be identical except exportedAt in manifest)

      // Compare object files (should be byte-for-byte identical)
      const objectFileA = readFileSync(
        join(tempDirA, 'objects', 'Page', `${objectId}.json`),
        'utf-8'
      );
      const objectFileB = readFileSync(
        join(tempDirB, 'objects', 'Page', `${objectId}.json`),
        'utf-8'
      );
      expect(objectFileA).toBe(objectFileB);

      // Compare project files
      const projectFileA = readFileSync(
        join(tempDirA, 'objects', 'Project', `${projectId}.json`),
        'utf-8'
      );
      const projectFileB = readFileSync(
        join(tempDirB, 'objects', 'Project', `${projectId}.json`),
        'utf-8'
      );
      expect(projectFileA).toBe(projectFileB);

      // Compare type files
      const typeFileA = readFileSync(join(tempDirA, 'types', 'Project.json'), 'utf-8');
      const typeFileB = readFileSync(join(tempDirB, 'types', 'Project.json'), 'utf-8');
      expect(typeFileA).toBe(typeFileB);

      // Manifests will differ in exportedAt timestamp (that's expected)
      const manifestA = JSON.parse(readFileSync(join(tempDirA, 'manifest.json'), 'utf-8')) as {
        typeCount: number;
        objectCount: number;
        blockCount: number;
      };
      const manifestB = JSON.parse(readFileSync(join(tempDirB, 'manifest.json'), 'utf-8')) as {
        typeCount: number;
        objectCount: number;
        blockCount: number;
      };

      // Counts should match
      expect(manifestB.typeCount).toBe(manifestA.typeCount);
      expect(manifestB.objectCount).toBe(manifestA.objectCount);
      expect(manifestB.blockCount).toBe(manifestA.blockCount);

      closeDb(db2);
    });
  });

  describe('git-friendly diffs', () => {
    /**
     * Helper to count how many lines differ between two strings.
     */
    function countChangedLines(before: string, after: string): number {
      const beforeLines = before.split('\n');
      const afterLines = after.split('\n');
      let changed = 0;
      const maxLen = Math.max(beforeLines.length, afterLines.length);
      for (let i = 0; i < maxLen; i++) {
        if (beforeLines[i] !== afterLines[i]) changed++;
      }
      return changed;
    }

    it('small change produces minimal diff', () => {
      // 1. Create object with blocks
      const blockId = generateId();
      const objectId = createObjectWithBlocks(db, 'Page', 'Original Title', [
        {
          id: blockId,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: {
            inline: [{ t: 'text', text: 'This is the first paragraph with some content.' }],
          },
        },
      ]);

      // 2. Export to string
      const exported1 = exportObject(db, objectId);
      if (!exported1) throw new Error('Export failed');
      const json1 = deterministicStringify(exported1);

      // 3. Make small change (update title)
      db.update(objects).set({ title: 'Modified Title' }).where(eq(objects.id, objectId)).run();

      // 4. Export again
      const exported2 = exportObject(db, objectId);
      if (!exported2) throw new Error('Export failed');
      const json2 = deterministicStringify(exported2);

      // 5. Count changed lines
      const changedLines = countChangedLines(json1, json2);

      // Only ~1-2 lines should change (title line and possibly updatedAt)
      // With deterministic serialization, the structure stays stable
      expect(changedLines).toBeLessThanOrEqual(2);
    });

    it('adding a block produces minimal structural diff', () => {
      // 1. Create object with one block
      const blockId1 = generateId();
      const objectId = createObjectWithBlocks(db, 'Page', 'Page with Blocks', [
        {
          id: blockId1,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'First paragraph' }] },
        },
      ]);

      // 2. Export to string
      const exported1 = exportObject(db, objectId);
      if (!exported1) throw new Error('Export failed');
      const json1 = deterministicStringify(exported1);

      // 3. Add a second block
      const blockId2 = generateId();
      const now = new Date();
      db.insert(blocks)
        .values({
          id: blockId2,
          objectId,
          parentBlockId: null,
          orderKey: 'a1',
          blockType: 'paragraph',
          content: JSON.stringify({ inline: [{ t: 'text', text: 'Second paragraph' }] }),
          meta: null,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // 4. Export again
      const exported2 = exportObject(db, objectId);
      if (!exported2) throw new Error('Export failed');
      const json2 = deterministicStringify(exported2);

      // 5. The new block adds lines but doesn't restructure existing content
      // Calculate the number of new lines in json2 vs json1
      const lines1 = json1.split('\n').length;
      const lines2 = json2.split('\n').length;

      // New block adds lines (roughly 10-15 for a simple block structure)
      expect(lines2).toBeGreaterThan(lines1);

      // But the beginning of the file (up to the first block's children array)
      // should remain stable - verify the first paragraph block is unchanged
      expect(json2).toContain('"text": "First paragraph"');
      expect(json2).toContain('"text": "Second paragraph"');

      // The sorted key order ensures predictable structure
      expect(json2.indexOf('"blockType": "paragraph"')).toBeGreaterThan(0);
    });

    it('changing block content only affects that block in export', () => {
      // 1. Create object with multiple blocks
      const blockId1 = generateId();
      const blockId2 = generateId();
      const objectId = createObjectWithBlocks(db, 'Page', 'Multi-block Page', [
        {
          id: blockId1,
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'heading',
          content: { level: 1, inline: [{ t: 'text', text: 'Heading stays same' }] },
        },
        {
          id: blockId2,
          parentBlockId: null,
          orderKey: 'a1',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Original text' }] },
        },
      ]);

      // 2. Export to string
      const exported1 = exportObject(db, objectId);
      if (!exported1) throw new Error('Export failed');
      const json1 = deterministicStringify(exported1);

      // 3. Update only the second block's content
      db.update(blocks)
        .set({
          content: JSON.stringify({ inline: [{ t: 'text', text: 'Modified text' }] }),
        })
        .where(eq(blocks.id, blockId2))
        .run();

      // 4. Export again
      const exported2 = exportObject(db, objectId);
      if (!exported2) throw new Error('Export failed');
      const json2 = deterministicStringify(exported2);

      // 5. The heading block should be unchanged
      expect(json1).toContain('"text": "Heading stays same"');
      expect(json2).toContain('"text": "Heading stays same"');

      // 6. Count changed lines - should be minimal (just the text content line)
      const changedLines = countChangedLines(json1, json2);

      // Only the text content line should change
      expect(changedLines).toBeLessThanOrEqual(2);
    });
  });
});
