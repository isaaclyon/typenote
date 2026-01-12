import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
  applyBlockPatch,
} from '@typenote/storage';
import { documents } from './documents.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Documents Routes', () => {
  let db: TypenoteDb;
  let app: Hono<ServerContext>;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);

    app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      await next();
    });
    app.route('/objects', documents);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('GET /objects/:id/document', () => {
    it('returns document with empty blocks for new object', async () => {
      const created = createObject(db, 'Page', 'Empty Page');

      const res = await app.request(`/objects/${created.id}/document`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { objectId: string; docVersion: number; blocks: unknown[] };
      };
      expect(body.success).toBe(true);
      expect(body.data.objectId).toBe(created.id);
      expect(body.data.docVersion).toBe(0);
      expect(body.data.blocks).toEqual([]);
    });

    it('returns document with blocks after patch', async () => {
      const created = createObject(db, 'Page', 'Page with Content');

      // Add a block via patch
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: created.id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01TEST00000000000000000001',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello world' }] },
            place: { where: 'end' },
          },
        ],
      });

      const res = await app.request(`/objects/${created.id}/document`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { objectId: string; docVersion: number; blocks: unknown[] };
      };
      expect(body.success).toBe(true);
      expect(body.data.docVersion).toBe(1);
      expect(body.data.blocks).toHaveLength(1);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}/document`);

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND_OBJECT');
    });
  });

  describe('PATCH /objects/:id/document', () => {
    it('applies block patch and returns new doc version', async () => {
      const created = createObject(db, 'Page', 'Test Page');

      const res = await app.request(`/objects/${created.id}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiVersion: 'v1',
          objectId: created.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01PATCH0000000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'New paragraph' }] },
              place: { where: 'end' },
            },
          ],
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { newDocVersion: number };
      };
      expect(body.success).toBe(true);
      expect(body.data.newDocVersion).toBe(1);
    });

    it('returns 400 when objectId in body mismatches URL', async () => {
      const created = createObject(db, 'Page', 'Test Page');
      const otherId = '01OTHERID00000000000000000';

      const res = await app.request(`/objects/${created.id}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiVersion: 'v1',
          objectId: otherId, // Mismatch!
          ops: [],
        }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION');
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}/document`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiVersion: 'v1',
          objectId: fakeId,
          ops: [],
        }),
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND_OBJECT');
    });
  });
});
