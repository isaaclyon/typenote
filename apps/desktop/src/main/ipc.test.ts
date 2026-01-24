import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  applyBlockPatch,
  getOrCreateTodayDailyNote,
  createObject,
  InMemoryFileService,
  type TypenoteDb,
  type FileService,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { createIpcHandlers, type IpcHandlers } from './ipc.js';
import { typenoteEvents } from './events.js';

describe('IPC Handlers', () => {
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
            objectTitle: '2026-01-24',
            typeKey: 'DailyNote',
            typeIcon: 'calendar',
            typeColor: '#F59E0B',
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
            sourceObjectTitle: 'Source Page',
            sourceTypeId: expect.any(String),
            sourceTypeKey: 'Page',
            sourceTypeIcon: 'file-text',
            sourceTypeColor: '#6B7280',
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

  describe('getUnlinkedMentions', () => {
    it('returns unlinked mentions when text matches object title', () => {
      // Create target object
      const targetObj = createObject(db, 'Page', 'Project Alpha');
      // Create source object that mentions target without linking
      const sourceObj = createObject(db, 'Page', 'Task List');

      // Add block with plain text mention (no explicit reference)
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
              inline: [{ t: 'text', text: 'Working on Project Alpha this week' }],
            },
          },
        ],
      });

      const result = handlers.getUnlinkedMentions(targetObj.id);

      expect(result).toEqual({
        success: true,
        result: [
          {
            sourceBlockId: blockId,
            sourceObjectId: sourceObj.id,
            sourceObjectTitle: 'Task List',
            sourceTypeId: expect.any(String),
            sourceTypeKey: 'Page',
            sourceTypeIcon: 'file-text',
            sourceTypeColor: '#6B7280',
          },
        ],
      });
    });

    it('excludes blocks that already have explicit references', () => {
      const targetObj = createObject(db, 'Page', 'Project Alpha');
      const sourceObj = createObject(db, 'Page', 'Task List');

      // Add block with both text mention AND explicit reference
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
                { t: 'text', text: 'See ' },
                { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObj.id } },
                { t: 'text', text: ' for details about Project Alpha' },
              ],
            },
          },
        ],
      });

      const result = handlers.getUnlinkedMentions(targetObj.id);

      // Should return empty because block already links to target
      expect(result).toEqual({
        success: true,
        result: [],
      });
    });

    it('excludes self-references from target object', () => {
      const targetObj = createObject(db, 'Page', 'Project Alpha');

      // Add block within targetObj that mentions its own title
      const blockId = generateId();
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: targetObj.id,
        ops: [
          {
            op: 'block.insert',
            blockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: {
              inline: [{ t: 'text', text: 'This is Project Alpha documentation' }],
            },
          },
        ],
      });

      const result = handlers.getUnlinkedMentions(targetObj.id);

      // Should return empty because it's a self-reference
      expect(result).toEqual({
        success: true,
        result: [],
      });
    });

    it('returns empty array for object with no unlinked mentions', () => {
      const obj = createObject(db, 'Page', 'Unique Unmatchable Title XYZ123');

      const result = handlers.getUnlinkedMentions(obj.id);

      expect(result).toEqual({
        success: true,
        result: [],
      });
    });

    it('returns empty array for non-existent object', () => {
      const result = handlers.getUnlinkedMentions('01NONEXISTENT0000000000000');

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

    it('emits object:created event on successful creation', () => {
      const emitSpy = vi.spyOn(typenoteEvents, 'emit');

      const result = handlers.createObject('Page', 'Test Page');

      expect(result.success).toBe(true);
      expect(emitSpy).toHaveBeenCalledWith({
        type: 'object:created',
        payload: expect.objectContaining({
          id: expect.any(String),
          typeKey: 'Page',
          title: 'Test Page',
          createdAt: expect.any(Date),
        }),
      });

      emitSpy.mockRestore();
    });

    it('emits event with correct payload structure', () => {
      const emitSpy = vi.spyOn(typenoteEvents, 'emit');

      const result = handlers.createObject('Person', 'Jane Doe', {
        email: 'jane@example.com',
      });

      expect(result.success).toBe(true);
      expect(emitSpy).toHaveBeenCalledOnce();

      const emittedEvent = emitSpy.mock.calls[0]?.[0];
      expect(emittedEvent).toBeDefined();
      expect(emittedEvent?.type).toBe('object:created');
      expect(emittedEvent?.payload).toEqual({
        id: expect.any(String),
        typeKey: 'Person',
        title: 'Jane Doe',
        createdAt: expect.any(Date),
      });

      emitSpy.mockRestore();
    });

    it('does NOT emit event when creation fails', () => {
      const emitSpy = vi.spyOn(typenoteEvents, 'emit');

      // Try to create with invalid type
      const result = handlers.createObject('NonExistentType', 'Test');

      expect(result.success).toBe(false);
      expect(emitSpy).not.toHaveBeenCalled();

      emitSpy.mockRestore();
    });

    it('does NOT emit event when validation fails', () => {
      const emitSpy = vi.spyOn(typenoteEvents, 'emit');

      // Try to create with invalid properties
      const result = handlers.createObject('DailyNote', 'Test', {
        date_key: 'invalid-date',
      });

      expect(result.success).toBe(false);
      expect(emitSpy).not.toHaveBeenCalled();

      emitSpy.mockRestore();
    });
  });

  describe('getOrCreateDailyNoteByDate', () => {
    it('creates new daily note for specified date', () => {
      const result = handlers.getOrCreateDailyNoteByDate('2024-06-15');

      expect(result).toEqual({
        success: true,
        result: {
          created: true,
          dailyNote: expect.objectContaining({
            id: expect.any(String),
            title: '2024-06-15',
            properties: { date_key: '2024-06-15' },
          }),
        },
      });
    });

    it('returns existing daily note for same date (idempotent)', () => {
      const first = handlers.getOrCreateDailyNoteByDate('2024-06-15') as {
        success: true;
        result: { created: boolean; dailyNote: { id: string } };
      };
      const second = handlers.getOrCreateDailyNoteByDate('2024-06-15') as {
        success: true;
        result: { created: boolean; dailyNote: { id: string } };
      };

      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      expect(first.result.created).toBe(true);
      expect(second.result.created).toBe(false);
      expect(second.result.dailyNote.id).toBe(first.result.dailyNote.id);
    });

    it('creates different notes for different dates', () => {
      const result1 = handlers.getOrCreateDailyNoteByDate('2024-06-15') as {
        success: true;
        result: { dailyNote: { id: string } };
      };
      const result2 = handlers.getOrCreateDailyNoteByDate('2024-06-16') as {
        success: true;
        result: { dailyNote: { id: string } };
      };

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.result.dailyNote.id).not.toBe(result2.result.dailyNote.id);
    });

    it('returns error for invalid date format', () => {
      const result = handlers.getOrCreateDailyNoteByDate('invalid-date');

      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: expect.any(String),
        },
      });
    });

    it('returns error for wrong date format (MM-DD-YYYY)', () => {
      const result = handlers.getOrCreateDailyNoteByDate('06-15-2024');

      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: expect.any(String),
        },
      });
    });
  });

  describe('attachment operations', () => {
    describe('uploadAttachment', () => {
      it('uploads attachment and returns attachmentId', () => {
        const result = handlers.uploadAttachment({
          filename: 'test.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test data').toString('base64'),
        });

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.result.attachmentId).toBeDefined();
          expect(typeof result.result.attachmentId).toBe('string');
        }
      });

      it('returns validation error for invalid mimeType', () => {
        const result = handlers.uploadAttachment({
          filename: 'test.exe',
          mimeType: 'application/x-msdownload',
          sizeBytes: 100,
          data: Buffer.from('test').toString('base64'),
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('UNSUPPORTED_FILE_TYPE');
        }
      });

      it('returns error for file too large', () => {
        const result = handlers.uploadAttachment({
          filename: 'big.png',
          mimeType: 'image/png',
          sizeBytes: 11 * 1024 * 1024, // 11 MB (exceeds 10 MB limit)
          data: Buffer.from('small').toString('base64'),
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('FILE_TOO_LARGE');
        }
      });

      it('returns validation error for missing required fields', () => {
        const result = handlers.uploadAttachment({
          filename: 'test.png',
          // missing mimeType, sizeBytes, data
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('VALIDATION');
        }
      });
    });

    describe('getAttachment', () => {
      it('returns attachment by id', () => {
        // First upload an attachment
        const uploadResult = handlers.uploadAttachment({
          filename: 'test.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test data').toString('base64'),
        });
        expect(uploadResult.success).toBe(true);
        if (!uploadResult.success) return;

        const result = handlers.getAttachment(uploadResult.result.attachmentId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.result).not.toBeNull();
          expect(result.result?.filename).toBe('test.png');
          expect(result.result?.mimeType).toBe('image/png');
        }
      });

      it('returns null for non-existent attachment', () => {
        const result = handlers.getAttachment('nonexistent-id');

        expect(result).toEqual({
          success: true,
          result: null,
        });
      });
    });

    describe('listAttachments', () => {
      it('returns empty array when no attachments exist', () => {
        const result = handlers.listAttachments();

        expect(result).toEqual({
          success: true,
          result: [],
        });
      });

      it('returns all attachments', () => {
        // Upload two attachments
        handlers.uploadAttachment({
          filename: 'test1.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test1').toString('base64'),
        });
        handlers.uploadAttachment({
          filename: 'test2.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 200,
          data: Buffer.from('test2').toString('base64'),
        });

        const result = handlers.listAttachments();

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.result.length).toBe(2);
        }
      });
    });

    describe('linkBlockToAttachment', () => {
      it('links block to attachment successfully', () => {
        // Create a daily note with a block
        const { dailyNote } = getOrCreateTodayDailyNote(db);
        const blockId = generateId();
        applyBlockPatch(db, {
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
              content: { inline: [{ t: 'text', text: 'test' }] },
            },
          ],
        });

        // Upload an attachment
        const uploadResult = handlers.uploadAttachment({
          filename: 'test.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test').toString('base64'),
        });
        expect(uploadResult.success).toBe(true);
        if (!uploadResult.success) return;

        const result = handlers.linkBlockToAttachment(blockId, uploadResult.result.attachmentId);

        expect(result).toEqual({
          success: true,
          result: undefined,
        });
      });

      it('returns error for non-existent attachment', () => {
        const blockId = generateId();

        const result = handlers.linkBlockToAttachment(blockId, 'nonexistent-id');

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.code).toBe('ATTACHMENT_NOT_FOUND');
        }
      });
    });

    describe('unlinkBlockFromAttachment', () => {
      it('unlinks block from attachment successfully', () => {
        // Create a daily note with a block
        const { dailyNote } = getOrCreateTodayDailyNote(db);
        const blockId = generateId();
        applyBlockPatch(db, {
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
              content: { inline: [{ t: 'text', text: 'test' }] },
            },
          ],
        });

        // Upload and link an attachment
        const uploadResult = handlers.uploadAttachment({
          filename: 'test.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test').toString('base64'),
        });
        expect(uploadResult.success).toBe(true);
        if (!uploadResult.success) return;

        handlers.linkBlockToAttachment(blockId, uploadResult.result.attachmentId);

        // Now unlink
        const result = handlers.unlinkBlockFromAttachment(
          blockId,
          uploadResult.result.attachmentId
        );

        expect(result).toEqual({
          success: true,
          result: undefined,
        });

        // Verify it's unlinked
        const attachmentsResult = handlers.getBlockAttachments(blockId);
        expect(attachmentsResult.success).toBe(true);
        if (attachmentsResult.success) {
          expect(attachmentsResult.result.length).toBe(0);
        }
      });
    });

    describe('getBlockAttachments', () => {
      it('returns empty array for block with no attachments', () => {
        const result = handlers.getBlockAttachments('some-block-id');

        expect(result).toEqual({
          success: true,
          result: [],
        });
      });

      it('returns attachments linked to block', () => {
        // Create a daily note with a block
        const { dailyNote } = getOrCreateTodayDailyNote(db);
        const blockId = generateId();
        applyBlockPatch(db, {
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
              content: { inline: [{ t: 'text', text: 'test' }] },
            },
          ],
        });

        // Upload and link two attachments
        const upload1 = handlers.uploadAttachment({
          filename: 'test1.png',
          mimeType: 'image/png',
          sizeBytes: 100,
          data: Buffer.from('test1').toString('base64'),
        });
        const upload2 = handlers.uploadAttachment({
          filename: 'test2.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 200,
          data: Buffer.from('test2').toString('base64'),
        });

        expect(upload1.success).toBe(true);
        expect(upload2.success).toBe(true);
        if (!upload1.success || !upload2.success) return;

        handlers.linkBlockToAttachment(blockId, upload1.result.attachmentId);
        handlers.linkBlockToAttachment(blockId, upload2.result.attachmentId);

        const result = handlers.getBlockAttachments(blockId);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.result.length).toBe(2);
          expect(result.result.map((a) => a.filename)).toContain('test1.png');
          expect(result.result.map((a) => a.filename)).toContain('test2.pdf');
        }
      });
    });
  });

  describe('duplicateObject', () => {
    it('duplicates object with new ID and title', () => {
      // Arrange: Create source object with blocks
      const sourceObject = createObject(db, 'Page', 'Original Page');
      const rootBlockId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObject.id,
        ops: [
          {
            op: 'block.insert',
            blockId: rootBlockId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Test content' }] },
          },
        ],
      });

      // Act: Duplicate the object
      const result = handlers.duplicateObject(sourceObject.id);

      // Assert: Success with new object
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.object.id).not.toBe(sourceObject.id);
        expect(result.result.object.title).toBe('Original Page (Copy)');
        expect(result.result.object.typeId).toBe(sourceObject.typeId);
        expect(result.result.blockCount).toBe(1);
      }
    });

    it('returns error for non-existent object', () => {
      const fakeId = generateId();
      const result = handlers.duplicateObject(fakeId);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND_OBJECT',
          message: expect.stringContaining(fakeId),
        },
      });
    });

    it('returns error when trying to duplicate a DailyNote', () => {
      // Create a DailyNote
      const { dailyNote } = getOrCreateTodayDailyNote(db);

      // Try to duplicate it
      const result = handlers.duplicateObject(dailyNote.id);

      expect(result).toEqual({
        success: false,
        error: {
          code: 'INVARIANT_DAILY_NOTE_NOT_DUPLICABLE',
          message: expect.any(String),
        },
      });
    });

    it('duplicates object with multiple blocks preserving tree structure', () => {
      // Arrange: Create object with nested blocks
      const sourceObject = createObject(db, 'Page', 'Multi-block Page');
      const rootId = generateId();
      const childId = generateId();

      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: sourceObject.id,
        ops: [
          {
            op: 'block.insert',
            blockId: rootId,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Root block' }] },
          },
          {
            op: 'block.insert',
            blockId: childId,
            parentBlockId: rootId,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Child block' }] },
          },
        ],
      });

      // Act
      const result = handlers.duplicateObject(sourceObject.id);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.blockCount).toBe(2);
      }
    });

    it('returns error for soft-deleted object', () => {
      // Arrange: Create object
      const sourceObject = createObject(db, 'Page', 'Deleted Page');

      // Soft delete using raw SQL
      // Note: In production, there would be a deleteObject service function
      db.run(`UPDATE objects SET deleted_at = datetime('now') WHERE id = ?`, [sourceObject.id]);

      // Act: Try to duplicate deleted object
      const result = handlers.duplicateObject(sourceObject.id);

      // Assert: Should fail with NOT_FOUND_OBJECT
      expect(result).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND_OBJECT',
          message: expect.stringContaining(sourceObject.id),
        },
      });
    });
  });
});
