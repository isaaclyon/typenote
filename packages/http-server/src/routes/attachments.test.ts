import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  applyBlockPatch,
  uploadAttachment,
  getAttachment,
  getAttachmentBlocks,
  linkBlockToAttachment,
  attachments as attachmentsTable,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';
import { eq } from 'drizzle-orm';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import { attachments as attachmentsRoute } from './attachments.js';
import type { ServerContext } from '../types.js';

describe('Attachments Routes', () => {
  let db: TypenoteDb;
  let app: Hono<ServerContext>;
  let fileService: InMemoryFileService;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();

    app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      c.set('fileService', fileService);
      await next();
    });
    app.route('/attachments', attachmentsRoute);
  });

  afterEach(() => {
    closeDb(db);
  });

  it('GET /attachments/:id returns metadata', async () => {
    const fileData = Buffer.from('hello');
    const uploadResult = uploadAttachment(db, fileService, {
      filename: 'hello.txt',
      mimeType: 'text/plain',
      sizeBytes: fileData.length,
      fileData,
    });
    const attachment = getAttachment(db, uploadResult.attachmentId);
    if (!attachment) throw new Error('Attachment not created');

    const res = await app.request(`/attachments/${attachment.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { id: string } };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(attachment.id);
  });

  it('GET /attachments/:id/content streams content with headers', async () => {
    const fileData = Buffer.from('attachment-bytes');
    const uploadResult = uploadAttachment(db, fileService, {
      filename: 'notes.txt',
      mimeType: 'text/plain',
      sizeBytes: fileData.length,
      fileData,
    });

    const res = await app.request(`/attachments/${uploadResult.attachmentId}/content`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(res.headers.get('content-length')).toBe(String(fileData.length));
    expect(res.headers.get('content-disposition')).toBe('inline; filename="notes.txt"');
    expect(res.headers.get('etag')).toMatch(/^"[0-9a-f]{64}"$/);
    expect(res.headers.get('cache-control')).toBe('private, max-age=31536000, immutable');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');

    const body = Buffer.from(await res.arrayBuffer());
    expect(body).toEqual(fileData);
  });

  it('POST /attachments uploads file with metadata', async () => {
    const object = createObject(
      db,
      'Page',
      'Attachment Upload',
      {},
      { applyDefaultTemplate: false }
    );
    const fileData = new Uint8Array([1, 2, 3, 4]);
    const formData = new FormData();
    formData.append('objectId', object.id);
    formData.append('filename', 'upload.txt');
    formData.append('mimeType', 'text/plain');
    formData.append('alt', 'Alt text');
    formData.append('caption', 'Caption text');
    formData.append('file', new Blob([fileData], { type: 'text/plain' }), 'upload.txt');

    const res = await app.request('/attachments', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      success: boolean;
      data: { attachmentId: string; wasDeduped: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.data.wasDeduped).toBe(false);

    const attachment = getAttachment(db, body.data.attachmentId);
    expect(attachment).not.toBeNull();

    const blocks = getAttachmentBlocks(db, body.data.attachmentId);
    expect(blocks).toHaveLength(1);
  });

  it('GET /attachments returns attachments for objectId', async () => {
    const object = createObject(db, 'Page', 'Attachment List', {}, { applyDefaultTemplate: false });
    const blockId = createTestBlock(db, object.id);
    const fileData = Buffer.from('list-attachment');
    const { attachmentId } = uploadAttachment(db, fileService, {
      filename: 'list.txt',
      mimeType: 'text/plain',
      sizeBytes: fileData.length,
      fileData,
    });

    linkBlockToAttachment(db, blockId, attachmentId);

    const res = await app.request(`/attachments?objectId=${object.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { attachments: { id: string }[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.attachments).toHaveLength(1);
    expect(body.data.attachments[0]?.id).toBe(attachmentId);
  });

  it('POST /attachments/cleanup returns dry-run preview', async () => {
    const fileData = Buffer.from('orphaned');
    const { attachmentId } = uploadAttachment(db, fileService, {
      filename: 'orphan.txt',
      mimeType: 'text/plain',
      sizeBytes: fileData.length,
      fileData,
    });

    markAttachmentOrphanedAt(db, attachmentId, daysAgo(40));

    const res = await app.request('/attachments/cleanup?graceDays=30', {
      method: 'POST',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { count: number; attachmentIds: string[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.count).toBe(1);
    expect(body.data.attachmentIds).toContain(attachmentId);
  });

  it('returns 404 for missing attachments', async () => {
    const res = await app.request('/attachments/01HZX1X5E1G8G5Q2B2V9XG4M2F');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_ATTACHMENT');
  });
});

function createTestBlock(db: TypenoteDb, objectId: string): string {
  const blockId = generateId();
  applyBlockPatch(db, {
    apiVersion: 'v1',
    objectId,
    ops: [
      {
        op: 'block.insert',
        blockId,
        parentBlockId: null,
        blockType: 'paragraph',
        content: { inline: [] },
      },
    ],
  });
  return blockId;
}

function markAttachmentOrphanedAt(db: TypenoteDb, attachmentId: string, date: Date): void {
  db.update(attachmentsTable)
    .set({ orphanedAt: date })
    .where(eq(attachmentsTable.id, attachmentId))
    .run();
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}
