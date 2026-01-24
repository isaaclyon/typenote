import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  applyBlockPatch,
  exportToFolder,
  getObject,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Import Routes', () => {
  let db: TypenoteDb;
  let tempDir: string;
  let app: Hono<ServerContext>;

  beforeEach(async () => {
    db = createTestDb();
    seedBuiltInTypes(db);
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'typenote-import-'));

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

  it('imports objects from an exported folder', async () => {
    const sourceDb = createTestDb();
    seedBuiltInTypes(sourceDb);
    const created = createObject(sourceDb, 'Page', 'Imported Page');
    applyBlockPatch(sourceDb, {
      apiVersion: 'v1',
      objectId: created.id,
      ops: [
        {
          op: 'block.insert',
          blockId: '01IMPORTBLOCK0000000000001',
          parentBlockId: null,
          place: { where: 'end' },
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Import me' }] },
        },
      ],
    });

    exportToFolder(sourceDb, tempDir);
    closeDb(sourceDb);

    const response = await app.request('/import/folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiVersion: 'v1', inputDir: tempDir, mode: 'replace' }),
    });

    const raw = await response.text();
    expect(response.status, raw).toBe(200);

    const payload = JSON.parse(raw) as {
      success: boolean;
      data: { success: boolean; objectsImported: number };
    };

    expect(payload.success).toBe(true);
    expect(payload.data.success).toBe(true);
    expect(payload.data.objectsImported).toBe(1);

    const imported = getObject(db, created.id);
    expect(imported?.title).toBe('Imported Page');
  });
});
