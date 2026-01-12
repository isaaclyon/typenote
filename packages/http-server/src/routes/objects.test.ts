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

  describe('GET /objects', () => {
    it('returns empty array when no objects exist', async () => {
      const res = await app.request('/objects');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns list of objects with type info', async () => {
      // Create objects
      const page = createObject(db, 'Page', 'My Page');
      const person = createObject(db, 'Person', 'John Doe');

      const res = await app.request('/objects');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string; title: string; typeKey: string }>;
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);

      // Verify both objects are returned with correct type info
      const ids = body.data.map((o) => o.id);
      expect(ids).toContain(page.id);
      expect(ids).toContain(person.id);

      const pageData = body.data.find((o) => o.id === page.id);
      expect(pageData?.title).toBe('My Page');
      expect(pageData?.typeKey).toBe('Page');
    });
  });

  describe('POST /objects', () => {
    it('creates object with valid type and title', async () => {
      const res = await app.request('/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeKey: 'Page',
          title: 'New Page',
        }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; title: string; typeKey: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('New Page');
      expect(body.data.typeKey).toBe('Page');
      expect(body.data.id).toHaveLength(26); // ULID
    });

    it('creates object with properties', async () => {
      const res = await app.request('/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeKey: 'Person',
          title: 'Jane Doe',
          properties: { email: 'jane@example.com' },
        }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; properties: Record<string, unknown> };
      };
      expect(body.success).toBe(true);
      expect(body.data.properties).toEqual({ email: 'jane@example.com' });
    });

    it('returns 400 for unknown type', async () => {
      const res = await app.request('/objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeKey: 'UnknownType',
          title: 'Test',
        }),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      // createObject throws CreateObjectError with TYPE_NOT_FOUND
      expect(body.error.code).toBe('TYPE_NOT_FOUND');
    });
  });
});
