/**
 * P0 Integration Tests for Export/Import Round-Trip
 *
 * Tests the full round-trip export -> import cycle to verify data integrity,
 * index rebuilding (refs, FTS), and deterministic output.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createIntegrationContext,
  cleanupIntegrationContext,
  createPage,
  type IntegrationTestContext,
} from './helpers/testContext.js';
import {
  paragraph,
  objectRef,
  buildDocumentTree,
  buildLinkedObjects,
  heading,
} from './helpers/fixtures.js';
import {
  exportObject,
  importObject,
  deterministicStringify,
  searchBlocks,
  getBacklinks,
  getDocument,
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  getObjectTypeByKey,
  createObjectType,
  applyBlockPatch,
  objects,
  blocks,
  type ExportedObject,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { eq } from 'drizzle-orm';

describe('Export/Import Round-Trip Integration Tests', () => {
  let ctx: IntegrationTestContext;

  beforeEach(() => {
    ctx = createIntegrationContext();
  });

  afterEach(() => {
    cleanupIntegrationContext(ctx);
  });

  describe('Round-trip preserves object metadata', () => {
    it('preserves title, properties, and docVersion exactly', () => {
      // Setup: Create object with specific metadata
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Test Page Title');

      // Add a block to increment docVersion
      const blockId = generateId();
      const patchResult = applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('Some content'),
            place: { where: 'end' },
          },
        ],
      });

      expect(patchResult.success).toBe(true);

      // Export the object
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to a fresh database
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);

      // Export from target DB and compare
      const reimported = exportObject(targetDb, objectId);
      expect(reimported).not.toBeNull();
      if (!reimported) throw new Error('Re-export failed');

      // Verify metadata matches exactly
      expect(reimported.id).toBe(exported.id);
      expect(reimported.title).toBe(exported.title);
      expect(reimported.typeKey).toBe(exported.typeKey);
      expect(reimported.properties).toEqual(exported.properties);
      expect(reimported.docVersion).toBe(exported.docVersion);
      expect(reimported.createdAt).toBe(exported.createdAt);
      expect(reimported.updatedAt).toBe(exported.updatedAt);

      closeDb(targetDb);
    });

    it('preserves custom properties on objects', () => {
      // Create a custom type with properties
      const customType = createObjectType(ctx.db, {
        key: 'Project',
        name: 'Project',
        icon: 'folder',
        schema: {
          properties: [
            { key: 'status', name: 'Status', type: 'text', required: false },
            { key: 'priority', name: 'Priority', type: 'number', required: false },
          ],
        },
      });

      // Create object with custom properties
      const objectId = generateId();
      const now = new Date();
      const properties = { status: 'active', priority: 1 };

      ctx.db
        .insert(objects)
        .values({
          id: objectId,
          typeId: customType.id,
          title: 'My Project',
          properties: JSON.stringify(properties),
          docVersion: 0,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.properties).toEqual(properties);

      // Import to fresh DB with the custom type
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);
      createObjectType(targetDb, {
        key: 'Project',
        name: 'Project',
        icon: 'folder',
        schema: customType.schema === null ? undefined : customType.schema,
      });

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);

      // Verify properties preserved
      const reimported = exportObject(targetDb, objectId);
      expect(reimported).not.toBeNull();
      if (!reimported) throw new Error('Re-export failed');
      expect(reimported.properties).toEqual(properties);

      closeDb(targetDb);
    });
  });

  describe('Round-trip preserves nested block tree', () => {
    it('preserves 3-level nesting with buildDocumentTree', () => {
      // Create document with 3-level nesting
      const { objectId } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Nested Document', [
        {
          type: 'heading',
          content: 'Level 1 Heading',
          children: [
            {
              type: 'paragraph',
              content: 'Level 2 Paragraph',
              children: [
                {
                  type: 'paragraph',
                  content: 'Level 3 Nested',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: 'Another root paragraph',
        },
      ]);

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.blocks).toHaveLength(2); // 2 root blocks

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);
      expect(importResult.blocksImported).toBe(4); // All 4 blocks

      // Get document from target and verify structure
      const targetDoc = getDocument(targetDb, objectId);

      // Should have 2 root blocks
      expect(targetDoc.blocks).toHaveLength(2);

      // First root block should have children
      const firstRoot = targetDoc.blocks[0];
      expect(firstRoot).toBeDefined();
      expect(firstRoot?.blockType).toBe('heading');
      expect(firstRoot?.children).toHaveLength(1);

      // Level 2 should have children
      const level2 = firstRoot?.children[0];
      expect(level2).toBeDefined();
      expect(level2?.blockType).toBe('paragraph');
      expect(level2?.children).toHaveLength(1);

      // Level 3
      const level3 = level2?.children[0];
      expect(level3).toBeDefined();
      expect(level3?.blockType).toBe('paragraph');
      expect(level3?.children).toHaveLength(0);

      closeDb(targetDb);
    });

    it('preserves orderKeys to maintain correct ordering', () => {
      // Create object with multiple siblings
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Ordered Document');

      // Insert blocks with specific order keys
      const blockIds = [generateId(), generateId(), generateId()];
      const contents = ['First', 'Second', 'Third'];

      for (let i = 0; i < 3; i++) {
        const currentBlockId = blockIds[i];
        const currentContent = contents[i];
        if (!currentBlockId || !currentContent) continue;

        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId: currentBlockId,
              parentBlockId: null,
              blockType: 'paragraph',
              content: paragraph(currentContent),
              place: { where: 'end' },
            },
          ],
        });
        expect(result.success).toBe(true);
      }

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      importObject(targetDb, exported);

      // Verify order is preserved
      const targetDoc = getDocument(targetDb, objectId);
      expect(targetDoc.blocks).toHaveLength(3);

      // Blocks should be in order by orderKey
      const orderedContents = targetDoc.blocks.map((b) => {
        const content = b.content as { inline: Array<{ text: string }> };
        return content.inline[0]?.text;
      });

      expect(orderedContents).toEqual(['First', 'Second', 'Third']);

      closeDb(targetDb);
    });
  });

  describe('Round-trip rebuilds refs index', () => {
    it('rebuilds refs for object references after import', () => {
      // Create linked objects with cross-references
      const { objectIds } = buildLinkedObjects(ctx.db, ctx.pageTypeId, 3);

      // Each object references the next one (circular)
      // Object 0 -> Object 1 -> Object 2 -> Object 0

      const firstObjectId = objectIds[0];
      const secondObjectId = objectIds[1];
      expect(firstObjectId).toBeDefined();
      expect(secondObjectId).toBeDefined();
      if (!firstObjectId || !secondObjectId) throw new Error('Object IDs not defined');

      // Export the first object (which references object 1)
      const exported = exportObject(ctx.db, firstObjectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Verify source has backlinks
      const sourceBacklinks = getBacklinks(ctx.db, secondObjectId);
      expect(sourceBacklinks.length).toBeGreaterThan(0);
      expect(sourceBacklinks.some((bl) => bl.sourceObjectId === firstObjectId)).toBe(true);

      // Import to fresh DB (without the target objects)
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      // Create the target object so the ref can be indexed
      const pageType = getObjectTypeByKey(targetDb, 'Page');
      expect(pageType).not.toBeNull();
      if (!pageType) throw new Error('Page type not found');

      const targetObjectId = createPage(targetDb, pageType.id, 'Target');

      // Modify export to reference the new target
      const modifiedExport: ExportedObject = {
        ...exported,
        blocks: exported.blocks.map((block) => ({
          ...block,
          content: {
            inline: [
              { t: 'text', text: 'See also: ' },
              { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
            ],
          },
        })),
      };

      const importResult = importObject(targetDb, modifiedExport);
      expect(importResult.success).toBe(true);

      // Verify refs were rebuilt
      const targetBacklinks = getBacklinks(targetDb, targetObjectId);
      expect(targetBacklinks).toHaveLength(1);
      expect(targetBacklinks[0]?.sourceObjectId).toBe(firstObjectId);

      closeDb(targetDb);
    });

    it('correctly rebuilds refs using getBacklinks verification', () => {
      // Create two objects, one referencing the other
      const targetId = createPage(ctx.db, ctx.pageTypeId, 'Target Page');
      const sourceId = createPage(ctx.db, ctx.pageTypeId, 'Source Page');

      // Add a block with reference
      const blockId = generateId();
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId: sourceId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'Link to ' }, objectRef(targetId)],
            },
            place: { where: 'end' },
          },
        ],
      });

      // Verify backlinks exist in source
      const sourceBacklinks = getBacklinks(ctx.db, targetId);
      expect(sourceBacklinks).toHaveLength(1);

      // Export source object
      const exported = exportObject(ctx.db, sourceId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB that also has the target
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      // Create target in new DB (same ID)
      const pageType = getObjectTypeByKey(targetDb, 'Page');
      expect(pageType).not.toBeNull();
      if (!pageType) throw new Error('Page type not found');

      targetDb
        .insert(objects)
        .values({
          id: targetId,
          typeId: pageType.id,
          title: 'Target Page',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      // Import source
      importObject(targetDb, exported);

      // Verify refs rebuilt
      const newBacklinks = getBacklinks(targetDb, targetId);
      expect(newBacklinks).toHaveLength(1);
      expect(newBacklinks[0]?.sourceObjectId).toBe(sourceId);
      expect(newBacklinks[0]?.sourceBlockId).toBe(blockId);

      closeDb(targetDb);
    });
  });

  describe('Round-trip rebuilds FTS index', () => {
    it('rebuilds FTS and searchBlocks returns expected results', () => {
      // Create object with searchable content
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Searchable Document');

      const blockId = generateId();
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('The quick brown fox jumps over the lazy dog'),
            place: { where: 'end' },
          },
        ],
      });

      // Verify search works in source
      const sourceResults = searchBlocks(ctx.db, 'quick brown fox');
      expect(sourceResults.length).toBeGreaterThan(0);
      expect(sourceResults.some((r) => r.blockId === blockId)).toBe(true);

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);

      // Verify FTS was rebuilt - search should work
      const targetResults = searchBlocks(targetDb, 'quick brown fox');
      expect(targetResults).toHaveLength(1);
      expect(targetResults[0]?.blockId).toBe(blockId);
      expect(targetResults[0]?.objectId).toBe(objectId);

      closeDb(targetDb);
    });

    it('FTS is rebuilt for multiple blocks with different content', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Multi-block Search Test');

      const blockId1 = generateId();
      const blockId2 = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('TypeScript programming language'),
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('JavaScript runtime environment'),
            place: { where: 'end' },
          },
        ],
      });

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      importObject(targetDb, exported);

      // Search for TypeScript - should find block1
      const tsResults = searchBlocks(targetDb, 'TypeScript');
      expect(tsResults).toHaveLength(1);
      expect(tsResults[0]?.blockId).toBe(blockId1);

      // Search for JavaScript - should find block2
      const jsResults = searchBlocks(targetDb, 'JavaScript');
      expect(jsResults).toHaveLength(1);
      expect(jsResults[0]?.blockId).toBe(blockId2);

      closeDb(targetDb);
    });
  });

  describe('Deterministic output produces identical files', () => {
    it('export -> import -> export produces identical JSON', () => {
      // Create object with blocks
      const { objectId } = buildDocumentTree(ctx.db, ctx.pageTypeId, 'Deterministic Test', [
        {
          type: 'heading',
          content: 'Main Title',
          children: [{ type: 'paragraph', content: 'Nested content here' }],
        },
        { type: 'paragraph', content: 'Root paragraph' },
      ]);

      // Export to JSON string
      const exported1 = exportObject(ctx.db, objectId);
      expect(exported1).not.toBeNull();
      if (!exported1) throw new Error('Export failed');
      const json1 = deterministicStringify(exported1);

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      importObject(targetDb, exported1);

      // Export again from target DB
      const exported2 = exportObject(targetDb, objectId);
      expect(exported2).not.toBeNull();
      if (!exported2) throw new Error('Re-export failed');
      const json2 = deterministicStringify(exported2);

      // JSON strings should be identical
      expect(json2).toBe(json1);

      closeDb(targetDb);
    });

    it('deterministicStringify produces consistent output regardless of property order', () => {
      // Create two objects with different property insertion order
      const obj1 = { zebra: 1, apple: 2, mango: 3 };
      const obj2 = { apple: 2, mango: 3, zebra: 1 };

      const json1 = deterministicStringify(obj1);
      const json2 = deterministicStringify(obj2);

      expect(json1).toBe(json2);
    });
  });

  describe('Import mode=skip preserves existing', () => {
    it('skips import if object exists and preserves modifications', () => {
      // Create initial object
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Original Title');

      // Export it
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      importObject(targetDb, exported);

      // Modify the object in target DB
      targetDb
        .update(objects)
        .set({ title: 'Modified Title' })
        .where(eq(objects.id, objectId))
        .run();

      // Try to import again with mode='skip'
      const reimportResult = importObject(targetDb, exported, { mode: 'skip' });
      expect(reimportResult.success).toBe(true);
      expect(reimportResult.blocksImported).toBe(0); // Nothing imported

      // Verify the modified data was retained
      const afterSkip = exportObject(targetDb, objectId);
      expect(afterSkip).not.toBeNull();
      if (!afterSkip) throw new Error('Export after skip failed');
      expect(afterSkip.title).toBe('Modified Title'); // Not overwritten

      closeDb(targetDb);
    });

    it('imports new object even with mode=skip', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'New Object');
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Fresh DB - object doesn't exist
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const result = importObject(targetDb, exported, { mode: 'skip' });
      expect(result.success).toBe(true);

      // Object should be created
      const imported = exportObject(targetDb, objectId);
      expect(imported).not.toBeNull();
      if (!imported) throw new Error('Import failed');
      expect(imported.title).toBe('New Object');

      closeDb(targetDb);
    });
  });

  describe('Import mode=replace updates existing', () => {
    it('replaces existing object and removes old blocks', () => {
      // Create initial object with blocks
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Original');
      const oldBlockId = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: oldBlockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('Old content'),
            place: { where: 'end' },
          },
        ],
      });

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      importObject(targetDb, exported);

      // Create modified export with new block
      const newBlockId = generateId();
      const modifiedExport: ExportedObject = {
        ...exported,
        title: 'Modified Title',
        docVersion: 5,
        blocks: [
          {
            id: newBlockId,
            parentBlockId: null,
            orderKey: 'a0',
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'New Heading' }] },
            meta: null,
            children: [],
          },
        ],
      };

      // Import with replace mode
      const result = importObject(targetDb, modifiedExport, { mode: 'replace' });
      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(1);

      // Verify new data is present
      const reimported = exportObject(targetDb, objectId);
      expect(reimported).not.toBeNull();
      if (!reimported) throw new Error('Re-export failed');
      expect(reimported.title).toBe('Modified Title');
      expect(reimported.docVersion).toBe(5);
      expect(reimported.blocks).toHaveLength(1);
      expect(reimported.blocks[0]?.id).toBe(newBlockId);

      // Old block should be gone
      const oldBlock = targetDb.select().from(blocks).where(eq(blocks.id, oldBlockId)).get();
      expect(oldBlock).toBeUndefined();

      closeDb(targetDb);
    });
  });

  describe('Export includes all block types', () => {
    it('exports paragraphs and headings with correct structure', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Mixed Blocks');

      const headingId = generateId();
      const paragraphId = generateId();

      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: headingId,
            parentBlockId: null,
            blockType: 'heading',
            content: heading('My Heading', 2),
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: paragraphId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('My paragraph text'),
            place: { where: 'end' },
          },
        ],
      });

      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.blocks).toHaveLength(2);

      // Check heading
      const headingBlock = exported.blocks.find((b) => b.id === headingId);
      expect(headingBlock).toBeDefined();
      expect(headingBlock?.blockType).toBe('heading');
      expect((headingBlock?.content as { level: number }).level).toBe(2);

      // Check paragraph
      const paragraphBlock = exported.blocks.find((b) => b.id === paragraphId);
      expect(paragraphBlock).toBeDefined();
      expect(paragraphBlock?.blockType).toBe('paragraph');
    });
  });

  describe('Import handles missing types gracefully', () => {
    it('returns error when importing object of unknown type', () => {
      // Create custom type and object
      const customType = createObjectType(ctx.db, {
        key: 'CustomWidget',
        name: 'Widget',
        icon: 'widget',
        schema: undefined,
      });

      const objectId = generateId();
      ctx.db
        .insert(objects)
        .values({
          id: objectId,
          typeId: customType.id,
          title: 'My Widget',
          properties: JSON.stringify({}),
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.typeKey).toBe('CustomWidget');

      // Try to import to fresh DB WITHOUT the custom type
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);
      // Note: CustomWidget type NOT created in targetDb

      const result = importObject(targetDb, exported);

      expect(result.success).toBe(false);
      expect(result.error).toContain('CustomWidget');

      closeDb(targetDb);
    });
  });

  describe('Large document export/import', () => {
    it('handles document with 50+ blocks', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Large Document');

      // Create 50 blocks
      const blockIds: string[] = [];
      for (let i = 0; i < 50; i++) {
        const blockId = generateId();
        blockIds.push(blockId);

        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId: null,
              blockType: 'paragraph',
              content: paragraph(`Paragraph number ${i + 1} with some content`),
              place: { where: 'end' },
            },
          ],
        });

        expect(result.success).toBe(true);
      }

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.blocks).toHaveLength(50);

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);
      expect(importResult.blocksImported).toBe(50);

      // Verify all blocks exist
      const targetDoc = getDocument(targetDb, objectId);
      expect(targetDoc.blocks).toHaveLength(50);

      // Verify content integrity - find specific blocks by content
      const allTexts = targetDoc.blocks.map((b) => {
        const content = b.content as { inline: Array<{ text: string }> };
        return content.inline[0]?.text;
      });

      // Verify first and last paragraphs exist in the document
      expect(allTexts).toContain('Paragraph number 1 with some content');
      expect(allTexts).toContain('Paragraph number 50 with some content');
      expect(allTexts).toContain('Paragraph number 25 with some content');

      // Verify FTS works on large document
      const searchResults = searchBlocks(targetDb, 'Paragraph number 25');
      expect(searchResults.length).toBeGreaterThan(0);

      closeDb(targetDb);
    });

    it('handles deeply nested document (10 levels)', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Deep Nesting');

      // Create a chain of 10 nested blocks
      const blockIds: string[] = [];
      let parentBlockId: string | null = null;

      for (let i = 0; i < 10; i++) {
        const blockId = generateId();
        blockIds.push(blockId);

        const result = applyBlockPatch(ctx.db, {
          apiVersion: 'v1',
          objectId,
          baseDocVersion: i,
          ops: [
            {
              op: 'block.insert',
              blockId,
              parentBlockId,
              blockType: 'paragraph',
              content: paragraph(`Level ${i + 1}`),
              place: { where: 'end' },
            },
          ],
        });

        expect(result.success).toBe(true);
        parentBlockId = blockId;
      }

      // Export
      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      // Verify nested structure in export
      expect(exported.blocks).toHaveLength(1); // Only one root

      let currentBlock = exported.blocks[0];
      for (let i = 0; i < 9; i++) {
        expect(currentBlock?.children).toHaveLength(1);
        currentBlock = currentBlock?.children[0];
      }
      expect(currentBlock?.children).toHaveLength(0); // Deepest has no children

      // Import to fresh DB
      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const importResult = importObject(targetDb, exported);
      expect(importResult.success).toBe(true);
      expect(importResult.blocksImported).toBe(10);

      // Verify structure preserved in target
      const targetDoc = getDocument(targetDb, objectId);
      expect(targetDoc.blocks).toHaveLength(1);

      let targetBlock = targetDoc.blocks[0];
      for (let i = 0; i < 9; i++) {
        expect(targetBlock?.children).toHaveLength(1);
        targetBlock = targetBlock?.children[0];
      }

      closeDb(targetDb);
    });
  });

  describe('Edge cases', () => {
    it('handles empty document (no blocks)', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Empty Document');

      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');
      expect(exported.blocks).toHaveLength(0);

      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const result = importObject(targetDb, exported);
      expect(result.success).toBe(true);
      expect(result.blocksImported).toBe(0);

      const imported = exportObject(targetDb, objectId);
      expect(imported).not.toBeNull();
      if (!imported) throw new Error('Import verification failed');
      expect(imported.blocks).toHaveLength(0);

      closeDb(targetDb);
    });

    it('handles block with empty content', () => {
      const objectId = createPage(ctx.db, ctx.pageTypeId, 'Empty Content');

      const blockId = generateId();
      applyBlockPatch(ctx.db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] }, // Empty inline array
            place: { where: 'end' },
          },
        ],
      });

      const exported = exportObject(ctx.db, objectId);
      expect(exported).not.toBeNull();
      if (!exported) throw new Error('Export failed');

      const targetDb = createTestDb();
      seedBuiltInTypes(targetDb);

      const result = importObject(targetDb, exported);
      expect(result.success).toBe(true);

      const imported = exportObject(targetDb, objectId);
      expect(imported).not.toBeNull();
      if (!imported) throw new Error('Import verification failed');
      expect(imported.blocks[0]?.content).toEqual({ inline: [] });

      closeDb(targetDb);
    });
  });
});
