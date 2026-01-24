import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  uploadAttachment,
  getAttachment,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
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

  it('returns 404 for missing attachments', async () => {
    const res = await app.request('/attachments/01HZX1X5E1G8G5Q2B2V9XG4M2F');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_ATTACHMENT');
  });
});
