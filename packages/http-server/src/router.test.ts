import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
} from '@typenote/storage';
import { createRouter } from './router.js';
import { errorHandler, errorOnError } from './middleware/errorHandler.js';
import type { ServerContext } from './types.js';

describe('Router', () => {
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
    // Mount router at /api/v1 (like the real server does)
    app.route('/api/v1', createRouter());
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('route mounting', () => {
    it('mounts health routes at /api/v1/health', async () => {
      const res = await app.request('/api/v1/health');

      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    it('mounts objects routes at /api/v1/objects', async () => {
      const res = await app.request('/api/v1/objects');

      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    it('mounts search routes at /api/v1/search', async () => {
      const res = await app.request('/api/v1/search?q=test');

      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    it('mounts recent routes at /api/v1/recent', async () => {
      const res = await app.request('/api/v1/recent');

      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });

    it('mounts document routes under objects', async () => {
      const page = createObject(db, 'Page', 'Test Page');
      const res = await app.request(`/api/v1/objects/${page.id}/document`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as { success: boolean };
      expect(body.success).toBe(true);
    });
  });
});
