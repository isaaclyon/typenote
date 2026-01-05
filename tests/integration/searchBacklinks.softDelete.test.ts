/**
 * Integration tests for search and backlinks with soft-delete semantics.
 * Verifies that FTS and backlinks correctly exclude soft-deleted blocks.
 */

import { describe, it, expect } from 'vitest';
import {
  setupIntegrationContext,
  createPage,
  applyBlockPatch,
  generateId,
} from './helpers/testContext.js';
import { paragraph, objectRef, buildLinkedObjects } from './helpers/fixtures.js';
import { searchBlocks, getBacklinks } from '@typenote/storage';
import type { ParagraphContent } from '@typenote/api';

describe('Search and Backlinks with Soft-Delete Semantics', () => {
  const getCtx = setupIntegrationContext();

  describe('Search', () => {
    it('finds content in active blocks', () => {
      const { db, pageTypeId } = getCtx();

      // Create a page with a block containing unique searchable text
      const objectId = createPage(db, pageTypeId, 'Test Page');
      const blockId = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('unique keyword alpha'),
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify search finds the block
      const searchResults = searchBlocks(db, 'unique keyword alpha');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0]?.blockId).toBe(blockId);
      expect(searchResults[0]?.objectId).toBe(objectId);
    });

    it('excludes soft-deleted blocks from search results', () => {
      const { db, pageTypeId } = getCtx();

      // Create a page with searchable content
      const objectId = createPage(db, pageTypeId, 'Test Page');
      const blockId = generateId();

      let result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('searchable beta content'),
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify search finds the block initially
      let searchResults = searchBlocks(db, 'searchable beta content');
      expect(searchResults).toHaveLength(1);

      // Soft-delete the block
      result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId,
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify search no longer finds the deleted block
      searchResults = searchBlocks(db, 'searchable beta content');
      expect(searchResults).toHaveLength(0);
    });

    it('respects objectId filter', () => {
      const { db, pageTypeId } = getCtx();

      // Create two pages with identical content
      const objectId1 = createPage(db, pageTypeId, 'Page 1');
      const objectId2 = createPage(db, pageTypeId, 'Page 2');
      const blockId1 = generateId();
      const blockId2 = generateId();

      // Insert same text in both pages
      const result1 = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: objectId1,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('identical gamma text'),
            place: { where: 'end' },
          },
        ],
      });
      expect(result1.success).toBe(true);

      const result2 = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: objectId2,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('identical gamma text'),
            place: { where: 'end' },
          },
        ],
      });
      expect(result2.success).toBe(true);

      // Search without filter should find both
      let searchResults = searchBlocks(db, 'identical gamma text');
      expect(searchResults).toHaveLength(2);

      // Search with objectId filter should find only first object's blocks
      searchResults = searchBlocks(db, 'identical gamma text', { objectId: objectId1 });
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0]?.objectId).toBe(objectId1);
      expect(searchResults[0]?.blockId).toBe(blockId1);
    });

    it('returns correct block metadata', () => {
      const { db, pageTypeId } = getCtx();

      const objectId = createPage(db, pageTypeId, 'Metadata Test Page');
      const blockId = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('metadata delta test'),
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      const searchResults = searchBlocks(db, 'metadata delta test');
      expect(searchResults).toHaveLength(1);

      const searchResult = searchResults[0];
      expect(searchResult).toBeDefined();
      expect(searchResult?.blockId).toBe(blockId);
      expect(searchResult?.objectId).toBe(objectId);
    });

    it('removes all nested blocks from search when deleting subtree', () => {
      const { db, pageTypeId } = getCtx();

      // Create a document with parent and children blocks
      const objectId = createPage(db, pageTypeId, 'Subtree Test');
      const parentBlockId = generateId();
      const childBlockId1 = generateId();
      const childBlockId2 = generateId();

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('parent epsilon content'),
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: childBlockId1,
            parentBlockId: parentBlockId,
            blockType: 'paragraph',
            content: paragraph('child epsilon one'),
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: childBlockId2,
            parentBlockId: parentBlockId,
            blockType: 'paragraph',
            content: paragraph('child epsilon two'),
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify all blocks are searchable
      expect(searchBlocks(db, 'parent epsilon content')).toHaveLength(1);
      expect(searchBlocks(db, 'child epsilon one')).toHaveLength(1);
      expect(searchBlocks(db, 'child epsilon two')).toHaveLength(1);

      // Delete parent with subtree=true
      const deleteResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: parentBlockId,
            subtree: true,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);

      // Verify none of the blocks appear in search
      expect(searchBlocks(db, 'parent epsilon content')).toHaveLength(0);
      expect(searchBlocks(db, 'child epsilon one')).toHaveLength(0);
      expect(searchBlocks(db, 'child epsilon two')).toHaveLength(0);
    });

    it('updates search index when block content is updated', () => {
      const { db, pageTypeId } = getCtx();

      const objectId = createPage(db, pageTypeId, 'Update Test');
      const blockId = generateId();

      // Create block with old content
      let result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('old zeta content'),
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify old content is searchable
      expect(searchBlocks(db, 'old zeta content')).toHaveLength(1);

      // Update to new content
      result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: paragraph('new zeta content'),
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify old content is no longer searchable
      expect(searchBlocks(db, 'old zeta content')).toHaveLength(0);

      // Verify new content is searchable
      expect(searchBlocks(db, 'new zeta content')).toHaveLength(1);
    });
  });

  describe('Backlinks', () => {
    it('includes active references in backlinks', () => {
      const { db, pageTypeId } = getCtx();

      // Create target and source objects
      const targetObjectId = createPage(db, pageTypeId, 'Target Page');
      const sourceObjectId = createPage(db, pageTypeId, 'Source Page');
      const sourceBlockId = generateId();

      // Create a block in source that references target
      const content: ParagraphContent = {
        inline: [{ t: 'text', text: 'See ' }, objectRef(targetObjectId)],
      };

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: sourceBlockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content,
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify backlinks include the reference
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(sourceBlockId);
      expect(backlinks[0]?.sourceObjectId).toBe(sourceObjectId);
    });

    it('excludes backlinks from deleted source blocks', () => {
      const { db, pageTypeId } = getCtx();

      // Create target and source objects
      const targetObjectId = createPage(db, pageTypeId, 'Target Page');
      const sourceObjectId = createPage(db, pageTypeId, 'Source Page');
      const sourceBlockId = generateId();

      // Create reference from source to target
      const content: ParagraphContent = {
        inline: [{ t: 'text', text: 'Reference to ' }, objectRef(targetObjectId)],
      };

      let result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: sourceBlockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content,
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify backlink exists initially
      let backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);

      // Delete the source block
      result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: sourceBlockId,
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify backlink no longer appears
      backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(0);
    });

    it('works with buildLinkedObjects for circular references', () => {
      const { db, pageTypeId } = getCtx();

      // Create 3 objects with circular references: A -> B -> C -> A
      const { objectIds } = buildLinkedObjects(db, pageTypeId, 3);

      // Each object should have exactly one backlink from the previous object
      // Object 0 (A) should have backlink from Object 2 (C)
      // Object 1 (B) should have backlink from Object 0 (A)
      // Object 2 (C) should have backlink from Object 1 (B)
      for (let i = 0; i < 3; i++) {
        const targetId = objectIds[i];
        const expectedSourceIndex = (i - 1 + 3) % 3;
        const expectedSourceId = objectIds[expectedSourceIndex];

        if (!targetId || !expectedSourceId) continue;

        const backlinks = getBacklinks(db, targetId);
        expect(backlinks).toHaveLength(1);
        expect(backlinks[0]?.sourceObjectId).toBe(expectedSourceId);
      }
    });

    it('updates backlinks when block refs are updated', () => {
      const { db, pageTypeId } = getCtx();

      // Create three objects: source, target A, target B
      const sourceObjectId = createPage(db, pageTypeId, 'Source Page');
      const targetAObjectId = createPage(db, pageTypeId, 'Target A');
      const targetBObjectId = createPage(db, pageTypeId, 'Target B');
      const blockId = generateId();

      // Create block referencing target A
      const contentA: ParagraphContent = {
        inline: [{ t: 'text', text: 'Link to ' }, objectRef(targetAObjectId)],
      };

      let result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: contentA,
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify backlink to A exists, B has none
      expect(getBacklinks(db, targetAObjectId)).toHaveLength(1);
      expect(getBacklinks(db, targetBObjectId)).toHaveLength(0);

      // Update block to reference target B instead
      const contentB: ParagraphContent = {
        inline: [{ t: 'text', text: 'Link to ' }, objectRef(targetBObjectId)],
      };

      result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.update',
            blockId,
            patch: {
              content: contentB,
            },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify A has no backlinks, B has one
      expect(getBacklinks(db, targetAObjectId)).toHaveLength(0);
      expect(getBacklinks(db, targetBObjectId)).toHaveLength(1);
      expect(getBacklinks(db, targetBObjectId)[0]?.sourceBlockId).toBe(blockId);
    });
  });

  describe('Combined Scenarios', () => {
    it('handles document tree with references correctly after subtree delete', () => {
      const { db, pageTypeId } = getCtx();

      // Create a target page
      const targetObjectId = createPage(db, pageTypeId, 'Target');

      // Create a source document with nested structure containing refs
      const sourceObjectId = createPage(db, pageTypeId, 'Source');
      const parentBlockId = generateId();
      const childBlockId = generateId();

      // Parent has searchable content, child has reference
      const parentContent = paragraph('parent eta content');
      const childContent: ParagraphContent = {
        inline: [{ t: 'text', text: 'child refers to ' }, objectRef(targetObjectId)],
      };

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: parentBlockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: parentContent,
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: childBlockId,
            parentBlockId: parentBlockId,
            blockType: 'paragraph',
            content: childContent,
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Verify search and backlinks work before delete
      expect(searchBlocks(db, 'parent eta content')).toHaveLength(1);
      expect(getBacklinks(db, targetObjectId)).toHaveLength(1);

      // Delete parent with subtree
      const deleteResult = applyBlockPatch(db, {
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

      expect(deleteResult.success).toBe(true);

      // Verify both search and backlinks are updated
      expect(searchBlocks(db, 'parent eta content')).toHaveLength(0);
      expect(getBacklinks(db, targetObjectId)).toHaveLength(0);
    });

    it('maintains correct state with multiple references from same source', () => {
      const { db, pageTypeId } = getCtx();

      // Create target
      const targetObjectId = createPage(db, pageTypeId, 'Target');
      const sourceObjectId = createPage(db, pageTypeId, 'Source');

      const blockId1 = generateId();
      const blockId2 = generateId();

      // Create two blocks referencing the same target
      const refContent: ParagraphContent = {
        inline: [{ t: 'text', text: 'Reference: ' }, objectRef(targetObjectId)],
      };

      const result = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            blockType: 'paragraph',
            content: refContent,
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            blockType: 'paragraph',
            content: refContent,
            place: { where: 'end' },
          },
        ],
      });

      expect(result.success).toBe(true);

      // Should have two backlinks
      expect(getBacklinks(db, targetObjectId)).toHaveLength(2);

      // Delete one block
      const deleteResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObjectId,
        baseDocVersion: 1,
        ops: [
          {
            op: 'block.delete',
            blockId: blockId1,
          },
        ],
      });

      expect(deleteResult.success).toBe(true);

      // Should have one backlink remaining
      const backlinks = getBacklinks(db, targetObjectId);
      expect(backlinks).toHaveLength(1);
      expect(backlinks[0]?.sourceBlockId).toBe(blockId2);
    });
  });
});
