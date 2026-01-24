import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  applyBlockPatch,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Export Routes', () => {
  let db: TypenoteDb;
  let tempDir: string;
  let app: Hono<ServerContext>;

  beforeEach(async () => {
    db = createTestDb();
    seedBuiltInTypes(db);
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'typenote-export-all-'));

    app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      c.set('fileService', new InMemoryFileService());
      await next();
    });
    app.route('/', createRouter());
  });

  afterEach(async () => {
    closeDb(db);
    await rm(tempDir, { recursive: true, force: true });
  });

  it('exports all objects to a folder and returns manifest', async () => {
    const created = createObject(db, 'Page', 'Export All Page');
    applyBlockPatch(db, {
      apiVersion: 'v1',
      objectId: created.id,
      ops: [
        {
          op: 'block.insert',
          blockId: '01EXPORTALLBLOCK0000000001',
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Export all' }] },
        },
      ],
    });

    const response = await app.request('/export/all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiVersion: 'v1', outputDir: tempDir }),
    });

    const raw = await response.text();
    expect(response.status, raw).toBe(200);

    const payload = JSON.parse(raw) as {
      success: boolean;
      data: { path: string; manifest: { objectCount: number; blockCount: number } };
    };
    expect(payload.success).toBe(true);
    expect(payload.data.path).toBe(tempDir);
    expect(payload.data.manifest.objectCount).toBe(1);
    expect(payload.data.manifest.blockCount).toBe(1);

    const manifestPath = path.join(tempDir, 'manifest.json');
    const manifestRaw = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestRaw) as { objectCount: number; blockCount: number };
    expect(manifest.objectCount).toBe(1);
    expect(manifest.blockCount).toBe(1);
  });
});
