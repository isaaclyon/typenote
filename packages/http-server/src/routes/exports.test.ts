import { describe, it, afterEach, beforeEach, expect } from 'vitest';
import { Hono } from 'hono';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  InMemoryFileService,
  applyBlockPatch,
  closeDb,
  createObject,
  createTestDb,
  seedBuiltInTypes,
  uploadAttachment,
} from '@typenote/storage';
import type { TypenoteDb } from '@typenote/storage';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import { exports as exportsRoute } from './exports.js';
import type { ServerContext } from '../types.js';

describe('exportsRoute', () => {
  let db: TypenoteDb;
  let tempDir: string;
  let fileService: InMemoryFileService;

  beforeEach(async () => {
    db = createTestDb();
    seedBuiltInTypes(db);
    fileService = new InMemoryFileService();
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'typenote-export-'));
  });

  afterEach(async () => {
    closeDb(db);
    await rm(tempDir, { recursive: true, force: true });
  });

  it('exports markdown and attachments to disk', async () => {
    const created = createObject(db, 'Page', 'Export Page');
    const image = Buffer.from('image-bytes');
    const uploadResult = uploadAttachment(db, fileService, {
      filename: 'logo.png',
      mimeType: 'image/png',
      sizeBytes: image.length,
      fileData: image,
    });

    const paragraphId = '01EXPORTPARAGRAPH000000001';
    const attachmentBlockId = '01EXPORTATTACHMENT00000001';

    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: created.id,
      ops: [
        {
          op: 'block.insert',
          blockId: paragraphId,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Hello export' }] },
        },
        {
          op: 'block.insert',
          blockId: attachmentBlockId,
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'attachment',
          content: {
            attachmentId: uploadResult.attachmentId,
            alt: 'Logo',
          },
        },
      ],
    });

    const app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      c.set('fileService', fileService);
      await next();
    });
    app.route('/objects', exportsRoute);

    const response = await app.request(`/objects/${created.id}/export/markdown`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiVersion: 'v1', outputDir: tempDir }),
    });

    const payload = (await response.json()) as {
      success: boolean;
      data: { path: string };
    };
    expect(response.status, JSON.stringify(payload)).toBe(200);
    expect(payload.success).toBe(true);

    const outputPath = path.join(tempDir, 'export-page.md');
    expect(payload.data.path).toBe(outputPath);

    const markdown = await readFile(outputPath, 'utf8');
    expect(markdown).toContain('# Export Page');
    expect(markdown).toContain('Hello export');
    expect(markdown).toContain('attachments/logo.png');

    const attachmentPath = path.join(tempDir, 'attachments', 'logo.png');
    const copied = await readFile(attachmentPath);
    expect(copied).toEqual(image);
  });
});
