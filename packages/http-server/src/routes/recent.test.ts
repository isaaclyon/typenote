import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
  recordView,
} from '@typenote/storage';
import { recent } from './recent.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Recent Routes', () => {
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
    app.route('/recent', recent);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('GET /recent', () => {
    it('returns empty array when no recent views', async () => {
      const res = await app.request('/recent');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns recently viewed objects', async () => {
      // Create objects and record views
      const page1 = createObject(db, 'Page', 'First Page');
      const page2 = createObject(db, 'Page', 'Second Page');

      recordView(db, page1.id);
      recordView(db, page2.id);

      const res = await app.request('/recent');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string; title: string }>;
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
      // Verify both items are returned (ordering tested in storage layer)
      const ids = body.data.map((item) => item.id);
      expect(ids).toContain(page1.id);
      expect(ids).toContain(page2.id);
    });

    it('respects limit parameter', async () => {
      // Create 5 objects and record views
      const objects = [];
      for (let i = 0; i < 5; i++) {
        const obj = createObject(db, 'Page', `Page ${i}`);
        objects.push(obj);
        recordView(db, obj.id);
      }

      const res = await app.request('/recent?limit=3');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(3);
    });
  });

  describe('POST /recent/:id', () => {
    it('records a view and returns success', async () => {
      const page = createObject(db, 'Page', 'Test Page');

      const res = await app.request(`/recent/${page.id}`, {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
      };
      expect(body.success).toBe(true);

      // Verify the view was recorded
      const recentRes = await app.request('/recent');
      const recentBody = (await recentRes.json()) as {
        success: boolean;
        data: Array<{ id: string }>;
      };
      expect(recentBody.data).toHaveLength(1);
      expect(recentBody.data[0]?.id).toBe(page.id);
    });
  });
});
