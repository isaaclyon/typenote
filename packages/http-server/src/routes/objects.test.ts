import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
} from '@typenote/storage';
import { objects } from './objects.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Objects Routes', () => {
  let db: TypenoteDb;
  let app: Hono<ServerContext>;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);

    // Create app with db injected via middleware
    app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      await next();
    });
    app.route('/objects', objects);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('GET /objects/:id', () => {
    it('returns object details for valid ID', async () => {
      // Create a test object
      const created = createObject(db, 'Page', 'Test Page');

      const res = await app.request(`/objects/${created.id}`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; title: string; typeKey: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(created.id);
      expect(body.data.title).toBe('Test Page');
      expect(body.data.typeKey).toBe('Page');
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV'; // Valid ULID format

      const res = await app.request(`/objects/${fakeId}`);

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string; message: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND_OBJECT');
    });
  });
});
