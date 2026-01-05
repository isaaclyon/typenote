import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  applyBlockPatch,
  getOrCreateTodayDailyNote,
  createObject,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { createIpcHandlers, type IpcHandlers } from './ipc.js';

describe('IPC Handlers', () => {
  let db: TypenoteDb;
  let handlers: IpcHandlers;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    handlers = createIpcHandlers(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('infrastructure', () => {
    it('creates handlers object with expected methods', () => {
      expect(handlers).toBeDefined();
      expect(typeof handlers.getDocument).toBe('function');
      expect(typeof handlers.applyBlockPatch).toBe('function');
      expect(typeof handlers.getOrCreateTodayDailyNote).toBe('function');
      expect(typeof handlers.listObjects).toBe('function');
    });
  });

  describe('listObjects', () => {
    it('returns list of objects with type info', () => {
      // Create a daily note (which creates an object)
      const { dailyNote } = getOrCreateTodayDailyNote(db);

      const result = handlers.listObjects();

      expect(result).toEqual({
        success: true,
        result: expect.arrayContaining([
          expect.objectContaining({
            id: dailyNote.id,
            title: dailyNote.title,
            typeKey: 'DailyNote',
          }),
        ]),
      });
    });

    it('returns empty array when no objects exist', () => {
      const result = handlers.listObjects();

      expect(result).toEqual({
        success: true,
        result: [],
      });
    });
  });

  describe('getDocument', () => {
    it('returns document for valid objectId', () => {
      // Arrange: create an object with a root block
      const { dailyNote } = getOrCreateTodayDailyNote(db);
      const rootBlockId = generateId();

      const patchResult = applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: dailyNote.id,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId: rootBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello world' }] },
          },
        ],
      });
      if (!patchResult.success) {
        throw new Error(`Patch failed: ${JSON.stringify(patchResult.error)}`);
      }

      // Act
      const result = handlers.getDocument(dailyNote.id);

      // Assert
      expect(result).toEqual({
        success: true,
        result: {
          objectId: dailyNote.id,
          docVersion: 1,
          blocks: [
            expect.objectContaining({
              id: rootBlockId,
              blockType: 'paragraph',
            }),
          ],
        },
      });
    });

    it('returns error for non-existent objectId', () => {
      const result = handlers.getDocument('nonexistent-id');

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND_OBJECT',
          message: expect.any(String),
        },
      });
    });
  });

  describe('applyBlockPatch', () => {
    it('applies valid patch and returns result', () => {
      // Arrange
      const { dailyNote } = getOrCreateTodayDailyNote(db);
      const blockId = generateId();

      // Act
      const result = handlers.applyBlockPatch({
        apiVersion: 'v1',
        objectId: dailyNote.id,
        baseDocVersion: 0,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Test content' }] },
          },
        ],
      });

      // Assert
      expect(result).toEqual({
        success: true,
        result: {
          apiVersion: 'v1',
          objectId: dailyNote.id,
          previousDocVersion: 0,
          newDocVersion: 1,
          applied: {
            insertedBlockIds: [blockId],
            updatedBlockIds: [],
            movedBlockIds: [],
            deletedBlockIds: [],
          },
        },
      });
    });

    it('returns validation error for invalid input', () => {
      const result = handlers.applyBlockPatch({
        // Missing apiVersion and other required fields
        objectId: 'some-id',
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION',
          message: expect.any(String),
        },
      });
    });
  });

  describe('getOrCreateTodayDailyNote', () => {
    it('creates new daily note when none exists', () => {
      const result = handlers.getOrCreateTodayDailyNote();

      expect(result).toEqual({
        success: true,
        result: {
          created: true,
          dailyNote: expect.objectContaining({
            id: expect.any(String),
            title: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          }),
        },
      });
    });

    it('returns existing daily note on subsequent call', () => {
      const first = handlers.getOrCreateTodayDailyNote() as {
        success: true;
        result: { created: boolean; dailyNote: { id: string } };
      };
      const second = handlers.getOrCreateTodayDailyNote() as {
        success: true;
        result: { created: boolean; dailyNote: { id: string } };
      };

      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      expect(second.result.created).toBe(false);
      expect(second.result.dailyNote.id).toBe(first.result.dailyNote.id);
    });
  });

  describe('searchBlocks', () => {
    it('returns matching blocks for valid query', () => {
      // Create an object with a block containing searchable text
      const { dailyNote } = getOrCreateTodayDailyNote(db);
      const blockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: dailyNote.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'searchable unique content' }] },
          },
        ],
      });

      const result = handlers.searchBlocks('searchable');

      expect(result).toEqual({
        success: true,
        result: [
          {
            blockId,
            objectId: dailyNote.id,
          },
        ],
      });
    });

    it('returns empty array for no matches', () => {
      const result = handlers.searchBlocks('nonexistentquerythatmatchesnothing');

      expect(result).toEqual({
        success: true,
        result: [],
      });
    });

    it('respects limit filter', () => {
      // Create object with multiple blocks
      const { dailyNote } = getOrCreateTodayDailyNote(db);

      for (let i = 0; i < 5; i++) {
        applyBlockPatch(db, {
          apiVersion: 'v1',
          objectId: dailyNote.id,
          ops: [
            {
              op: 'block.insert',
              blockId: generateId(),
              parentBlockId: null,
              place: { where: 'end' },
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: `limittest block ${i}` }] },
            },
          ],
        });
      }

      const result = handlers.searchBlocks('limittest', { limit: 2 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(2);
      }
    });

    it('filters by objectId', () => {
      // Create two objects with similar content
      const obj1 = createObject(db, 'Page', 'Object 1');
      const obj2 = createObject(db, 'Page', 'Object 2');

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: obj1.id,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'filtertest content' }] },
          },
        ],
      });

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: obj2.id,
        ops: [
          {
            op: 'block.insert',
            blockId: generateId(),
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'filtertest content' }] },
          },
        ],
      });

      const result = handlers.searchBlocks('filtertest', { objectId: obj1.id });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(1);
        expect(result.result[0]?.objectId).toBe(obj1.id);
      }
    });
  });

  describe('getBacklinks', () => {
    it('returns backlinks for object with references', () => {
      // Create two objects
      const targetObj = createObject(db, 'Page', 'Target Page');
      const sourceObj = createObject(db, 'Page', 'Source Page');

      // Add a block in sourceObj that references targetObj
      // Note: Object references use the format { t: 'ref', mode: 'link', target: { kind: 'object', objectId } }
      const blockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [
                { t: 'text', text: 'Check out ' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObj.id } },
              ],
            },
          },
        ],
      });

      const result = handlers.getBacklinks(targetObj.id);

      expect(result).toEqual({
        success: true,
        result: [
          {
            sourceBlockId: blockId,
            sourceObjectId: sourceObj.id,
            targetBlockId: null,
          },
        ],
      });
    });

    it('returns empty array for object with no backlinks', () => {
      const obj = createObject(db, 'Page', 'Lonely Page');

      const result = handlers.getBacklinks(obj.id);

      expect(result).toEqual({
        success: true,
        result: [],
      });
    });
  });

  describe('createObject', () => {
    it('creates object with valid type and title', () => {
      const result = handlers.createObject('Page', 'My Test Page');

      expect(result).toEqual({
        success: true,
        result: expect.objectContaining({
          id: expect.any(String),
          typeKey: 'Page',
          title: 'My Test Page',
        }),
      });
    });

    it('creates object with properties', () => {
      const result = handlers.createObject('Person', 'John Doe', {
        email: 'john@example.com',
      });

      expect(result).toEqual({
        success: true,
        result: expect.objectContaining({
          id: expect.any(String),
          typeKey: 'Person',
          title: 'John Doe',
          properties: { email: 'john@example.com' },
        }),
      });
    });

    it('returns error for unknown type', () => {
      const result = handlers.createObject('NonExistentType', 'Test');

      expect(result).toEqual({
        success: false,
        error: {
          code: 'TYPE_NOT_FOUND',
          message: expect.any(String),
        },
      });
    });

    it('returns validation error for invalid properties', () => {
      // DailyNote requires date_key property in YYYY-MM-DD format
      const result = handlers.createObject('DailyNote', 'Test', {
        date_key: 'invalid-date',
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: expect.any(String),
        },
      });
    });
  });
});
