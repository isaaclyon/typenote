import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  applyBlockPatch,
  getOrCreateTodayDailyNote,
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
});
