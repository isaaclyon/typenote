import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  getOrCreateDailyNoteByDate,
  getObjectTypeByKey,
  type TypenoteDb,
  InMemoryFileService,
  type FileService,
  objects,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { createIpcHandlers, type IpcHandlers } from './ipc.js';

describe('getObjectsCreatedOnDate IPC handler', () => {
  let db: TypenoteDb;
  let fileService: FileService;
  let handlers: IpcHandlers;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();
    handlers = createIpcHandlers(db, fileService);
  });

  afterEach(() => {
    closeDb(db);
  });

  it('should exclude Daily Notes from results', () => {
    // Create a Daily Note on 2026-01-16
    const dailyNoteResult = getOrCreateDailyNoteByDate(db, '2026-01-16');
    expect(dailyNoteResult.created).toBe(true);

    // Create 2 regular Page objects on the same date
    const jan16 = new Date('2026-01-16T10:00:00Z');
    const pageType = getObjectTypeByKey(db, 'Page');
    if (!pageType) throw new Error('Page type not found');

    const page1Id = generateId();
    const page2Id = generateId();

    db.insert(objects)
      .values({
        id: page1Id,
        typeId: pageType.id,
        title: 'Page 1',
        docVersion: 0,
        properties: '{}',
        createdAt: jan16,
        updatedAt: jan16,
      })
      .run();

    db.insert(objects)
      .values({
        id: page2Id,
        typeId: pageType.id,
        title: 'Page 2',
        docVersion: 0,
        properties: '{}',
        createdAt: jan16,
        updatedAt: jan16,
      })
      .run();

    // Call IPC handler for 2026-01-16
    const result = handlers.getObjectsCreatedOnDate('2026-01-16');

    // Verify only the 2 Pages are returned (Daily Note excluded)
    expect(result).toEqual({
      success: true,
      result: expect.arrayContaining([
        {
          id: page1Id,
          title: 'Page 1',
          typeIcon: 'file-text',
          typeColor: '#6B7280',
        },
        {
          id: page2Id,
          title: 'Page 2',
          typeIcon: 'file-text',
          typeColor: '#6B7280',
        },
      ]),
    });

    expect(result.success && result.result.length).toBe(2);

    // Verify Daily Note is NOT in results
    if (result.success) {
      const dailyNoteInResults = result.result.some(
        (obj) => obj.id === dailyNoteResult.dailyNote.id
      );
      expect(dailyNoteInResults).toBe(false);
    }
  });

  it('should return empty array when only Daily Note exists on date', () => {
    // Create only a Daily Note on 2026-01-17
    const dailyNoteResult = getOrCreateDailyNoteByDate(db, '2026-01-17');
    expect(dailyNoteResult.created).toBe(true);

    // Call IPC handler for 2026-01-17
    const result = handlers.getObjectsCreatedOnDate('2026-01-17');

    // Verify empty array returned
    expect(result).toEqual({
      success: true,
      result: [],
    });
  });

  it('should include all non-DailyNote types', () => {
    // Create objects of various types on 2026-01-18
    const jan18 = new Date('2026-01-18T10:00:00Z');

    // Get built-in types
    const pageType = getObjectTypeByKey(db, 'Page');
    const personType = getObjectTypeByKey(db, 'Person');
    const eventType = getObjectTypeByKey(db, 'Event');
    const taskType = getObjectTypeByKey(db, 'Task');

    if (!pageType || !personType || !eventType || !taskType) {
      throw new Error('Required types not found');
    }

    const pageId = generateId();
    const personId = generateId();
    const eventId = generateId();
    const taskId = generateId();

    // Insert objects
    db.insert(objects)
      .values([
        {
          id: pageId,
          typeId: pageType.id,
          title: 'Test Page',
          docVersion: 0,
          properties: '{}',
          createdAt: jan18,
          updatedAt: jan18,
        },
        {
          id: personId,
          typeId: personType.id,
          title: 'Test Person',
          docVersion: 0,
          properties: '{}',
          createdAt: jan18,
          updatedAt: jan18,
        },
        {
          id: eventId,
          typeId: eventType.id,
          title: 'Test Event',
          docVersion: 0,
          properties: '{}',
          createdAt: jan18,
          updatedAt: jan18,
        },
        {
          id: taskId,
          typeId: taskType.id,
          title: 'Test Task',
          docVersion: 0,
          properties: '{"status":"todo"}',
          createdAt: jan18,
          updatedAt: jan18,
        },
      ])
      .run();

    // Call IPC handler
    const result = handlers.getObjectsCreatedOnDate('2026-01-18');

    // Verify all 4 non-DailyNote objects are returned
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.length).toBe(4);

      const ids = result.result.map((obj) => obj.id);
      expect(ids).toContain(pageId);
      expect(ids).toContain(personId);
      expect(ids).toContain(eventId);
      expect(ids).toContain(taskId);
    }
  });

  it('should handle empty date (no objects created)', () => {
    // Call IPC handler for a date with no objects
    const result = handlers.getObjectsCreatedOnDate('2025-06-15');

    // Verify empty array returned
    expect(result).toEqual({
      success: true,
      result: [],
    });
  });

  it('should handle multiple objects and Daily Note mixed together', () => {
    // Create Daily Note + 3 Pages on same date
    const jan19 = new Date('2026-01-19T10:00:00Z');

    // Create Daily Note
    const dailyNoteResult = getOrCreateDailyNoteByDate(db, '2026-01-19');
    expect(dailyNoteResult.created).toBe(true);

    // Create Pages
    const pageType = getObjectTypeByKey(db, 'Page');
    if (!pageType) throw new Error('Page type not found');

    const page1Id = generateId();
    const page2Id = generateId();
    const page3Id = generateId();

    db.insert(objects)
      .values([
        {
          id: page1Id,
          typeId: pageType.id,
          title: 'Alpha Page',
          docVersion: 0,
          properties: '{}',
          createdAt: jan19,
          updatedAt: jan19,
        },
        {
          id: page2Id,
          typeId: pageType.id,
          title: 'Beta Page',
          docVersion: 0,
          properties: '{}',
          createdAt: jan19,
          updatedAt: jan19,
        },
        {
          id: page3Id,
          typeId: pageType.id,
          title: 'Gamma Page',
          docVersion: 0,
          properties: '{}',
          createdAt: jan19,
          updatedAt: jan19,
        },
      ])
      .run();

    // Call IPC handler
    const result = handlers.getObjectsCreatedOnDate('2026-01-19');

    // Should return exactly 3 objects (Pages only)
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.length).toBe(3);

      // Verify Daily Note is not in results
      const dailyNoteInResults = result.result.some(
        (obj) => obj.id === dailyNoteResult.dailyNote.id
      );
      expect(dailyNoteInResults).toBe(false);

      // Verify all Pages are present
      const titles = result.result.map((obj) => obj.title).sort();
      expect(titles).toEqual(['Alpha Page', 'Beta Page', 'Gamma Page']);
    }
  });
});
