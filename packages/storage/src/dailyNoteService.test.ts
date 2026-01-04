import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, getObjectTypeByKey } from './objectTypeService.js';
import {
  getOrCreateDailyNoteByDate,
  getOrCreateTodayDailyNote,
  listDailyNotes,
  getDailyNoteBySlug,
  getDailyNoteSlug,
  DailyNoteError,
} from './dailyNoteService.js';
import { objects } from './schema.js';
import { generateId } from '@typenote/core';

describe('DailyNoteService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('getOrCreateDailyNoteByDate', () => {
    it('creates a new DailyNote when none exists for the date', () => {
      seedBuiltInTypes(db);

      const result = getOrCreateDailyNoteByDate(db, '2024-01-15');

      expect(result.created).toBe(true);
      expect(result.dailyNote.title).toBe('2024-01-15');
      expect(result.dailyNote.properties).toEqual({ date_key: '2024-01-15' });
    });

    it('returns existing DailyNote when one exists for the date', () => {
      seedBuiltInTypes(db);

      const first = getOrCreateDailyNoteByDate(db, '2024-01-15');
      const second = getOrCreateDailyNoteByDate(db, '2024-01-15');

      expect(second.created).toBe(false);
      expect(second.dailyNote.id).toBe(first.dailyNote.id);
    });

    it('rejects invalid date format', () => {
      seedBuiltInTypes(db);

      expect(() => getOrCreateDailyNoteByDate(db, 'invalid')).toThrow(DailyNoteError);
      expect(() => getOrCreateDailyNoteByDate(db, '01-15-2024')).toThrow(DailyNoteError);
      expect(() => getOrCreateDailyNoteByDate(db, '2024/01/15')).toThrow(DailyNoteError);
    });

    it('enforces uniqueness at database level for date_key', () => {
      seedBuiltInTypes(db);

      // Manually insert a DailyNote bypassing the service
      const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
      if (!dailyNoteType) throw new Error('DailyNote type not found');
      db.insert(objects)
        .values({
          id: generateId(),
          typeId: dailyNoteType.id,
          title: '2024-01-15',
          properties: JSON.stringify({ date_key: '2024-01-15' }),
          docVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .run();

      // Second insert with same date_key should fail at DB level
      expect(() => {
        db.insert(objects)
          .values({
            id: generateId(),
            typeId: dailyNoteType.id,
            title: '2024-01-15',
            properties: JSON.stringify({ date_key: '2024-01-15' }),
            docVersion: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .run();
      }).toThrow(/UNIQUE constraint failed.*daily_note\.date_key/);
    });
  });

  describe('getOrCreateTodayDailyNote', () => {
    it('creates DailyNote for current date', () => {
      seedBuiltInTypes(db);

      const result = getOrCreateTodayDailyNote(db);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      expect(result.dailyNote.properties.date_key).toBe(today);
    });
  });

  describe('listDailyNotes', () => {
    it('returns all DailyNotes ordered by date descending', () => {
      seedBuiltInTypes(db);
      getOrCreateDailyNoteByDate(db, '2024-01-15');
      getOrCreateDailyNoteByDate(db, '2024-01-10');
      getOrCreateDailyNoteByDate(db, '2024-01-20');

      const result = listDailyNotes(db, {});

      expect(result.items).toHaveLength(3);
      expect(result.items[0]?.properties.date_key).toBe('2024-01-20');
      expect(result.items[1]?.properties.date_key).toBe('2024-01-15');
      expect(result.items[2]?.properties.date_key).toBe('2024-01-10');
    });

    it('filters by date range', () => {
      seedBuiltInTypes(db);
      getOrCreateDailyNoteByDate(db, '2024-01-10');
      getOrCreateDailyNoteByDate(db, '2024-01-15');
      getOrCreateDailyNoteByDate(db, '2024-01-20');

      const result = listDailyNotes(db, {
        startDate: '2024-01-12',
        endDate: '2024-01-18',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.properties.date_key).toBe('2024-01-15');
    });

    it('supports limit and offset pagination', () => {
      seedBuiltInTypes(db);
      for (let i = 1; i <= 10; i++) {
        getOrCreateDailyNoteByDate(db, `2024-01-${String(i).padStart(2, '0')}`);
      }

      const page1 = listDailyNotes(db, { limit: 3, offset: 0 });
      const page2 = listDailyNotes(db, { limit: 3, offset: 3 });

      expect(page1.items).toHaveLength(3);
      expect(page2.items).toHaveLength(3);
      expect(page1.items[0]?.properties.date_key).toBe('2024-01-10');
      expect(page2.items[0]?.properties.date_key).toBe('2024-01-07');
      expect(page1.total).toBe(10);
    });
  });

  describe('getDailyNoteBySlug', () => {
    it('resolves daily/YYYY-MM-DD slug to DailyNote', () => {
      seedBuiltInTypes(db);
      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-01-15');

      const result = getDailyNoteBySlug(db, 'daily/2024-01-15');

      expect(result).not.toBeNull();
      expect(result?.id).toBe(dailyNote.id);
    });

    it('returns null for non-existent date', () => {
      seedBuiltInTypes(db);

      const result = getDailyNoteBySlug(db, 'daily/2024-01-15');

      expect(result).toBeNull();
    });

    it('returns null for invalid slug format', () => {
      seedBuiltInTypes(db);

      expect(getDailyNoteBySlug(db, 'page/2024-01-15')).toBeNull();
      expect(getDailyNoteBySlug(db, '2024-01-15')).toBeNull();
      expect(getDailyNoteBySlug(db, 'daily/invalid')).toBeNull();
    });
  });

  describe('getDailyNoteSlug', () => {
    it('generates slug from DailyNote', () => {
      seedBuiltInTypes(db);
      const { dailyNote } = getOrCreateDailyNoteByDate(db, '2024-01-15');

      const slug = getDailyNoteSlug(dailyNote);

      expect(slug).toBe('daily/2024-01-15');
    });
  });
});
