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
  createObjectType,
  deterministicStringify,
  exportObject,
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

  it('exports a single object and writes a custom type definition', async () => {
    createObjectType(db, {
      key: 'Recipe',
      name: 'Recipe',
      icon: 'utensils',
      schema: {
        properties: [{ key: 'serves', name: 'Serves', type: 'number', required: false }],
      },
    });
    const created = createObject(db, 'Recipe', 'Export Recipe');

    const response = await app.request('/export/object', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiVersion: 'v1', objectId: created.id, outputDir: tempDir }),
    });

    const raw = await response.text();
    expect(response.status, raw).toBe(200);

    const payload = JSON.parse(raw) as { success: boolean; data: { path: string } };
    expect(payload.success).toBe(true);

    const objectPath = path.join(tempDir, 'objects', 'Recipe', `${created.id}.json`);
    expect(payload.data.path).toBe(objectPath);

    const exported = exportObject(db, created.id);
    const objectContent = await readFile(objectPath, 'utf8');
    expect(objectContent).toBe(deterministicStringify(exported));

    const typePath = path.join(tempDir, 'types', 'Recipe.json');
    const typeContent = await readFile(typePath, 'utf8');
    const parsed = JSON.parse(typeContent) as { key: string; builtIn: boolean };
    expect(parsed.key).toBe('Recipe');
    expect(parsed.builtIn).toBe(false);
  });

  it('exports a type and writes all objects for that type', async () => {
    const first = createObject(db, 'Page', 'Export Page A');
    const second = createObject(db, 'Page', 'Export Page B');

    const response = await app.request('/export/type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiVersion: 'v1', typeKey: 'Page', outputDir: tempDir }),
    });

    const raw = await response.text();
    expect(response.status, raw).toBe(200);

    const payload = JSON.parse(raw) as { success: boolean; data: { path: string } };
    expect(payload.success).toBe(true);

    const typePath = path.join(tempDir, 'types', 'Page.json');
    expect(payload.data.path).toBe(typePath);

    const typeContent = await readFile(typePath, 'utf8');
    const typeJson = JSON.parse(typeContent) as { key: string; builtIn: boolean };
    expect(typeJson.key).toBe('Page');
    expect(typeJson.builtIn).toBe(true);

    const firstPath = path.join(tempDir, 'objects', 'Page', `${first.id}.json`);
    const secondPath = path.join(tempDir, 'objects', 'Page', `${second.id}.json`);
    const firstContent = await readFile(firstPath, 'utf8');
    const secondContent = await readFile(secondPath, 'utf8');
    expect(firstContent).toBe(deterministicStringify(exportObject(db, first.id)));
    expect(secondContent).toBe(deterministicStringify(exportObject(db, second.id)));
  });
});
