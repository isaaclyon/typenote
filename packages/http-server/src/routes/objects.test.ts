import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
  createTag,
  assignTags,
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

  describe('PATCH /objects/:id', () => {
    it('updates object title', async () => {
      const obj = createObject(db, 'Page', 'Original Title');

      const res = await app.request(`/objects/${obj.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: { title: 'Updated Title' },
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { title: string; docVersion: number };
      };
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Title');
      expect(body.data.docVersion).toBe(1); // Incremented
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patch: { title: 'New Title' },
        }),
      });

      expect(res.status).toBe(404);
    });

    it('returns 409 for version conflict', async () => {
      const obj = createObject(db, 'Page', 'Original');

      const res = await app.request(`/objects/${obj.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseDocVersion: 999, // Wrong version
          patch: { title: 'Updated' },
        }),
      });

      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.error.code).toBe('CONFLICT_VERSION');
    });
  });

  describe('DELETE /objects/:id', () => {
    it('soft-deletes an object', async () => {
      const obj = createObject(db, 'Page', 'To Delete');

      const res = await app.request(`/objects/${obj.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; deletedAt: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(obj.id);
      expect(body.data.deletedAt).toBeDefined();

      // Verify object is no longer in the list (listObjects filters deleted)
      const listRes = await app.request('/objects');
      const listBody = (await listRes.json()) as {
        data: Array<{ id: string }>;
      };
      const ids = listBody.data.map((o) => o.id);
      expect(ids).not.toContain(obj.id);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /objects/:id/duplicate', () => {
    it('duplicates an object', async () => {
      const obj = createObject(db, 'Page', 'Original');

      const res = await app.request(`/objects/${obj.id}/duplicate`, {
        method: 'POST',
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { object: { id: string; title: string }; blockCount: number };
      };
      expect(body.success).toBe(true);
      expect(body.data.object.title).toBe('Original (Copy)');
      expect(body.data.object.id).not.toBe(obj.id);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}/duplicate`, {
        method: 'POST',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /objects/:id/tags', () => {
    it('returns empty array when no tags assigned', async () => {
      const obj = createObject(db, 'Page', 'Test');

      const res = await app.request(`/objects/${obj.id}/tags`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns assigned tags', async () => {
      const obj = createObject(db, 'Page', 'Test');
      const tag = createTag(db, { name: 'Important', slug: 'important' });
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const res = await app.request(`/objects/${obj.id}/tags`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string; name: string }>;
      };
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.name).toBe('Important');
    });
  });

  describe('POST /objects/:id/tags', () => {
    it('assigns tags to object', async () => {
      const obj = createObject(db, 'Page', 'Test');
      const tag = createTag(db, { name: 'Work', slug: 'work' });

      const res = await app.request(`/objects/${obj.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagIds: [tag.id],
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { assignedTagIds: string[]; skippedTagIds: string[] };
      };
      expect(body.success).toBe(true);
      expect(body.data.assignedTagIds).toContain(tag.id);
    });

    it('is idempotent - skips already assigned tags', async () => {
      const obj = createObject(db, 'Page', 'Test');
      const tag = createTag(db, { name: 'Work', slug: 'work' });
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const res = await app.request(`/objects/${obj.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagIds: [tag.id],
        }),
      });

      const body = (await res.json()) as {
        success: boolean;
        data: { assignedTagIds: string[]; skippedTagIds: string[] };
      };
      expect(body.data.skippedTagIds).toContain(tag.id);
      expect(body.data.assignedTagIds).toHaveLength(0);
    });
  });

  describe('DELETE /objects/:id/tags', () => {
    it('removes tags from object', async () => {
      const obj = createObject(db, 'Page', 'Test');
      const tag = createTag(db, { name: 'Work', slug: 'work' });
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const res = await app.request(`/objects/${obj.id}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagIds: [tag.id],
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { removedTagIds: string[] };
      };
      expect(body.data.removedTagIds).toContain(tag.id);

      // Verify tag is removed
      const getRes = await app.request(`/objects/${obj.id}/tags`);
      const getBody = (await getRes.json()) as { data: unknown[] };
      expect(getBody.data).toHaveLength(0);
    });
  });

  describe('GET /objects/:id/backlinks', () => {
    it('returns empty array when no backlinks', async () => {
      const obj = createObject(db, 'Page', 'Test');

      const res = await app.request(`/objects/${obj.id}/backlinks`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}/backlinks`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /objects/:id/unlinked-mentions', () => {
    it('returns empty array when no mentions', async () => {
      const obj = createObject(db, 'Page', 'Test');

      const res = await app.request(`/objects/${obj.id}/unlinked-mentions`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/objects/${fakeId}/unlinked-mentions`);

      expect(res.status).toBe(404);
    });
  });
});
