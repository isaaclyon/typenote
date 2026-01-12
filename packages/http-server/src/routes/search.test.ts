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
import { search } from './search.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Search Routes', () => {
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
    app.route('/search', search);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('GET /search', () => {
    it('returns empty results for no matches', async () => {
      const res = await app.request('/search?q=nonexistent');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns matching blocks', async () => {
      // Create an object with content
      const created = createObject(db, 'Page', 'Test Page');
      applyBlockPatch(db, {
        apiVersion: 'v1',
        objectId: created.id,
        ops: [
          {
            op: 'block.insert',
            blockId: '01SEARCH000000000000000001',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello searchable world' }] },
            place: { where: 'end' },
          },
        ],
      });

      const res = await app.request('/search?q=searchable');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ blockId: string; objectId: string }>;
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.objectId).toBe(created.id);
    });

    it('returns 400 when query is missing', async () => {
      const res = await app.request('/search');

      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION');
    });
  });
});
