/**
 * P1 Integration tests for DailyNote complete lifecycle.
 *
 * Tests the full lifecycle of daily notes including:
 * - Type seeding and verification
 * - Creation (today and specific dates)
 * - Idempotency on repeated calls
 * - Content editing via block patches
 * - Search indexing
 * - Date range listing
 * - Slug resolution
 * - Date uniqueness enforcement
 * - Title generation
 */

import { describe, it, expect } from 'vitest';
import { setupIntegrationContext, applyBlockPatch, generateId } from './helpers/testContext.js';
import { paragraph } from './helpers/fixtures.js';
import {
  getObjectTypeByKey,
  getOrCreateDailyNoteByDate,
  getOrCreateTodayDailyNote,
  listDailyNotes,
  getDailyNoteBySlug,
  getDocument,
  searchBlocks,
  seedDailyNoteTemplate,
  objects,
} from '@typenote/storage';

describe('DailyNote Lifecycle Integration', () => {
  const getCtx = setupIntegrationContext();

  describe('Type Seeding', () => {
    it('creates DailyNote type with correct schema via seedBuiltInTypes', () => {
      const { db } = getCtx();

      // seedBuiltInTypes is already called in setupIntegrationContext
      const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');

      expect(dailyNoteType).not.toBeNull();
      expect(dailyNoteType?.key).toBe('DailyNote');
      expect(dailyNoteType?.name).toBe('Daily Note');
      expect(dailyNoteType?.icon).toBe('calendar');
      expect(dailyNoteType?.builtIn).toBe(true);

      // Verify schema has date_key property
      expect(dailyNoteType?.schema).not.toBeNull();
      expect(dailyNoteType?.schema?.properties).toHaveLength(1);
      expect(dailyNoteType?.schema?.properties[0]).toMatchObject({
        key: 'date_key',
        name: 'Date',
        type: 'date',
        required: true,
      });
    });
  });

  describe('getOrCreateTodayDailyNote', () => {
    it('creates daily note with correct properties for today', () => {
      const { db } = getCtx();

      const result = getOrCreateTodayDailyNote(db);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      expect(result.created).toBe(true);
      expect(result.dailyNote).toBeDefined();
      expect(result.dailyNote.id).toBeDefined();
      expect(result.dailyNote.properties.date_key).toBe(today);
      expect(result.dailyNote.title).toBe(today);
      expect(result.dailyNote.docVersion).toBe(0);
    });

    it('returns existing daily note on second call (idempotent)', () => {
      const { db } = getCtx();

      const first = getOrCreateTodayDailyNote(db);
      const second = getOrCreateTodayDailyNote(db);

      expect(first.created).toBe(true);
      expect(second.created).toBe(false);
      expect(second.dailyNote.id).toBe(first.dailyNote.id);
      expect(second.dailyNote.properties.date_key).toBe(first.dailyNote.properties.date_key);
    });
  });

  describe('getOrCreateDailyNoteByDate', () => {
    it('creates daily note for specific date with correct date_key', () => {
      const { db } = getCtx();

      const result = getOrCreateDailyNoteByDate(db, '2024-01-15');

      expect(result.created).toBe(true);
      expect(result.dailyNote.properties.date_key).toBe('2024-01-15');
      expect(result.dailyNote.title).toBe('2024-01-15');
    });

    it('returns existing daily note for same date', () => {
      const { db } = getCtx();

      const first = getOrCreateDailyNoteByDate(db, '2024-01-15');
      const second = getOrCreateDailyNoteByDate(db, '2024-01-15');

      expect(second.created).toBe(false);
      expect(second.dailyNote.id).toBe(first.dailyNote.id);
    });
  });

  describe('Content Editing via applyBlockPatch', () => {
    it('adds blocks to daily note and retrieves complete document', () => {
      const { db } = getCtx();

      // Create today's daily note
      const { dailyNote } = getOrCreateTodayDailyNote(db);
      const blockId1 = generateId();
      const blockId2 = generateId();

      // Add blocks via patch
      const patchResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: dailyNote.id,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: blockId1,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('Morning notes'),
            place: { where: 'end' },
          },
          {
            op: 'block.insert',
            blockId: blockId2,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('Afternoon notes'),
            place: { where: 'end' },
          },
        ],
      });

      expect(patchResult.success).toBe(true);
      if (patchResult.success) {
        expect(patchResult.result.newDocVersion).toBe(1);
      }

      // Verify document structure
      const doc = getDocument(db, dailyNote.id);
      expect(doc.objectId).toBe(dailyNote.id);
      expect(doc.docVersion).toBe(1);
      expect(doc.blocks).toHaveLength(2);
      expect(doc.blocks[0]?.id).toBe(blockId1);
      expect(doc.blocks[0]?.content).toEqual(paragraph('Morning notes'));
      expect(doc.blocks[1]?.id).toBe(blockId2);
      expect(doc.blocks[1]?.content).toEqual(paragraph('Afternoon notes'));
    });
  });

  describe('Search Integration', () => {
    it('daily note content appears in search after editing', () => {
      const { db } = getCtx();

      // Create daily note and add searchable content
      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-03-15');
      const blockId = generateId();

      const patchResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: dailyNote.id,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            blockType: 'paragraph',
            content: paragraph('UniqueSearchableMeeting with quarterly review'),
            place: { where: 'end' },
          },
        ],
      });

      expect(patchResult.success).toBe(true);

      // Search should find the content
      const searchResults = searchBlocks(db, 'UniqueSearchableMeeting');

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0]?.blockId).toBe(blockId);
      expect(searchResults[0]?.objectId).toBe(dailyNote.id);
    });
  });

  describe('listDailyNotes with date range', () => {
    it('filters daily notes by start and end date', () => {
      const { db } = getCtx();

      // Create daily notes for multiple dates
      getOrCreateDailyNoteByDate(db, '2024-01-10');
      getOrCreateDailyNoteByDate(db, '2024-01-15');
      getOrCreateDailyNoteByDate(db, '2024-01-20');
      getOrCreateDailyNoteByDate(db, '2024-01-25');

      // List with date range
      const result = listDailyNotes(db, {
        startDate: '2024-01-12',
        endDate: '2024-01-22',
      });

      // Should return only 2024-01-15 and 2024-01-20
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);

      // Results are ordered by date descending
      expect(result.items[0]?.properties.date_key).toBe('2024-01-20');
      expect(result.items[1]?.properties.date_key).toBe('2024-01-15');
    });

    it('returns all daily notes when no date filters applied', () => {
      const { db } = getCtx();

      getOrCreateDailyNoteByDate(db, '2024-02-01');
      getOrCreateDailyNoteByDate(db, '2024-02-05');
      getOrCreateDailyNoteByDate(db, '2024-02-10');

      const result = listDailyNotes(db, {});

      expect(result.items).toHaveLength(3);
      expect(result.total).toBe(3);
    });
  });

  describe('getDailyNoteBySlug', () => {
    it('resolves daily/YYYY-MM-DD slug to correct daily note', () => {
      const { db } = getCtx();

      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-01-15');

      const resolved = getDailyNoteBySlug(db, 'daily/2024-01-15');

      expect(resolved).not.toBeNull();
      expect(resolved?.id).toBe(dailyNote.id);
      expect(resolved?.properties.date_key).toBe('2024-01-15');
    });

    it('returns null for non-existent date slug', () => {
      const { db } = getCtx();

      // Create a different date
      getOrCreateDailyNoteByDate(db, '2024-01-15');

      // Try to resolve a non-existent date
      const resolved = getDailyNoteBySlug(db, 'daily/2024-12-31');

      expect(resolved).toBeNull();
    });

    it('returns null for invalid slug format', () => {
      const { db } = getCtx();

      getOrCreateDailyNoteByDate(db, '2024-01-15');

      expect(getDailyNoteBySlug(db, 'page/2024-01-15')).toBeNull();
      expect(getDailyNoteBySlug(db, '2024-01-15')).toBeNull();
      expect(getDailyNoteBySlug(db, 'daily/invalid-date')).toBeNull();
    });
  });

  describe('Date Uniqueness Enforcement', () => {
    it('database-level unique constraint prevents duplicate date_key', () => {
      const { db, dailyNoteTypeId } = getCtx();

      // Create a daily note for a specific date via service
      getOrCreateDailyNoteByDate(db, '2024-06-15');

      // Attempt to manually insert another object with the same date_key
      // This should fail due to the unique constraint trigger
      expect(() => {
        db.insert(objects)
          .values({
            id: generateId(),
            typeId: dailyNoteTypeId,
            title: 'Duplicate Daily Note',
            properties: JSON.stringify({ date_key: '2024-06-15' }),
            docVersion: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run();
      }).toThrow(/UNIQUE constraint failed.*daily_note\.date_key/);
    });
  });

  describe('Daily Note Title Generation', () => {
    it('title is set to the date in YYYY-MM-DD format', () => {
      const { db } = getCtx();

      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-01-15');

      // Title should contain the date
      expect(dailyNote.title).toBe('2024-01-15');
    });

    it('today daily note title matches current date', () => {
      const { db } = getCtx();

      const { dailyNote } = getOrCreateTodayDailyNote(db);
      const today = new Date().toISOString().slice(0, 10);

      expect(dailyNote.title).toBe(today);
      expect(dailyNote.properties.date_key).toBe(today);
    });
  });

  describe('Template Application', () => {
    it('new DailyNote has template content with heading block', () => {
      const { db } = getCtx();

      // Seed the default DailyNote template
      seedDailyNoteTemplate(db);

      // Create a new DailyNote
      const { dailyNote, created } = getOrCreateDailyNoteByDate(db, '2024-05-15');
      expect(created).toBe(true);

      // Get the document to verify template was applied
      const doc = getDocument(db, dailyNote.id);

      // Template should have created 2 blocks: heading + paragraph
      expect(doc.blocks).toHaveLength(2);

      // First block should be a heading
      expect(doc.blocks[0]?.blockType).toBe('heading');
      expect(doc.blocks[0]?.content).toMatchObject({
        level: 1,
      });

      // Second block should be an empty paragraph
      expect(doc.blocks[1]?.blockType).toBe('paragraph');
      expect(doc.blocks[1]?.content).toMatchObject({
        inline: [],
      });
    });

    it('{{date_key}} placeholder is substituted with actual date', () => {
      const { db } = getCtx();

      // Seed the default DailyNote template
      seedDailyNoteTemplate(db);

      // Create a new DailyNote for a specific date
      const testDate = '2024-07-04';
      const { dailyNote } = getOrCreateDailyNoteByDate(db, testDate);

      // Get the document
      const doc = getDocument(db, dailyNote.id);

      // Heading should contain the substituted date, not the placeholder
      const headingContent = doc.blocks[0]?.content as {
        level: number;
        inline: Array<{ t: string; text: string }>;
      };
      expect(headingContent.inline).toHaveLength(1);
      expect(headingContent.inline[0]?.text).toBe(testDate);
      expect(headingContent.inline[0]?.text).not.toContain('{{');
    });

    it('docVersion increments after template application', () => {
      const { db } = getCtx();

      // Seed the default DailyNote template
      seedDailyNoteTemplate(db);

      // Create a new DailyNote
      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-08-20');

      // Get the document - version should be 1 (incremented from 0 after template patch)
      const doc = getDocument(db, dailyNote.id);
      expect(doc.docVersion).toBe(1);
    });

    it('DailyNote without template has no blocks', () => {
      const { db } = getCtx();

      // Do NOT seed template - create DailyNote without template
      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-09-10');

      // Get the document
      const doc = getDocument(db, dailyNote.id);

      // Should have no blocks since no template was applied
      expect(doc.blocks).toHaveLength(0);
      expect(doc.docVersion).toBe(0);
    });

    it('existing DailyNote is not affected by template on second call', () => {
      const { db } = getCtx();

      // Create DailyNote first WITHOUT template
      const { dailyNote: firstNote } = getOrCreateDailyNoteByDate(db, '2024-10-15');
      const firstDoc = getDocument(db, firstNote.id);
      expect(firstDoc.blocks).toHaveLength(0);

      // Now seed the template
      seedDailyNoteTemplate(db);

      // Get the same DailyNote again (should return existing, not create new)
      const { dailyNote: secondNote, created } = getOrCreateDailyNoteByDate(db, '2024-10-15');
      expect(created).toBe(false);
      expect(secondNote.id).toBe(firstNote.id);

      // Document should still have no blocks - template only applies on creation
      const secondDoc = getDocument(db, secondNote.id);
      expect(secondDoc.blocks).toHaveLength(0);
    });
  });
});
