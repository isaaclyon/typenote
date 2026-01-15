import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createTag,
  createObject,
  assignTags,
} from '@typenote/storage';
import { tags } from './tags.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Tags Routes', () => {
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
    app.route('/tags', tags);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('GET /tags', () => {
    it('returns empty array when no tags exist', async () => {
      const res = await app.request('/tags');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns list of tags', async () => {
      // Create tags directly via service
      createTag(db, { name: 'Work', slug: 'work' });
      createTag(db, { name: 'Personal', slug: 'personal' });

      const res = await app.request('/tags');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ name: string; slug: string }>;
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);
    });

    it('includes usage count when requested', async () => {
      const tag = createTag(db, { name: 'Important', slug: 'important' });
      const obj = createObject(db, 'Page', 'Test Page');
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const res = await app.request('/tags?includeUsageCount=true');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ name: string; usageCount: number }>;
      };
      expect(body.success).toBe(true);
      const importantTag = body.data.find((t) => t.name === 'Important');
      expect(importantTag?.usageCount).toBe(1);
    });

    it('sorts by name ascending by default', async () => {
      createTag(db, { name: 'Zebra', slug: 'zebra' });
      createTag(db, { name: 'Alpha', slug: 'alpha' });

      const res = await app.request('/tags');

      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ name: string }>;
      };
      expect(body.data[0]?.name).toBe('Alpha');
      expect(body.data[1]?.name).toBe('Zebra');
    });

    it('respects sort parameters', async () => {
      createTag(db, { name: 'Alpha', slug: 'alpha' });
      createTag(db, { name: 'Zebra', slug: 'zebra' });

      const res = await app.request('/tags?sortBy=name&sortOrder=desc');

      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ name: string }>;
      };
      expect(body.data[0]?.name).toBe('Zebra');
      expect(body.data[1]?.name).toBe('Alpha');
    });
  });

  describe('POST /tags', () => {
    it('creates tag with valid input', async () => {
      const res = await app.request('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Tag',
          slug: 'new-tag',
          color: '#ff0000',
        }),
      });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; name: string; slug: string; color: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('New Tag');
      expect(body.data.slug).toBe('new-tag');
      expect(body.data.color).toBe('#ff0000');
      expect(body.data.id).toHaveLength(26); // ULID
    });

    it('returns 409 when slug already exists', async () => {
      createTag(db, { name: 'Existing', slug: 'existing-slug' });

      const res = await app.request('/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another Tag',
          slug: 'existing-slug',
        }),
      });

      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TAG_SLUG_EXISTS');
    });
  });

  describe('GET /tags/:id', () => {
    it('returns tag for valid ID', async () => {
      const tag = createTag(db, { name: 'Test Tag', slug: 'test-tag' });

      const res = await app.request(`/tags/${tag.id}`);

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; name: string; slug: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(tag.id);
      expect(body.data.name).toBe('Test Tag');
    });

    it('returns 404 for non-existent tag', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/tags/${fakeId}`);

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND_TAG');
    });
  });

  describe('GET /tags/by-slug/:slug', () => {
    it('returns tag for valid slug', async () => {
      const tag = createTag(db, { name: 'Test Tag', slug: 'test-tag' });

      const res = await app.request('/tags/by-slug/test-tag');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; name: string; slug: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(tag.id);
      expect(body.data.slug).toBe('test-tag');
    });

    it('returns 404 for non-existent slug', async () => {
      const res = await app.request('/tags/by-slug/non-existent');

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND_TAG');
    });
  });

  describe('PATCH /tags/:id', () => {
    it('updates tag fields', async () => {
      const tag = createTag(db, { name: 'Original', slug: 'original' });

      const res = await app.request(`/tags/${tag.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Name',
          color: '#00ff00',
        }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { name: string; slug: string; color: string };
      };
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Updated Name');
      expect(body.data.slug).toBe('original'); // Unchanged
      expect(body.data.color).toBe('#00ff00');
    });

    it('returns 404 for non-existent tag', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/tags/${fakeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('returns 409 when changing to existing slug', async () => {
      createTag(db, { name: 'Tag One', slug: 'tag-one' });
      const tagTwo = createTag(db, { name: 'Tag Two', slug: 'tag-two' });

      const res = await app.request(`/tags/${tagTwo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'tag-one' }),
      });

      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TAG_SLUG_EXISTS');
    });
  });

  describe('DELETE /tags/:id', () => {
    it('deletes unused tag', async () => {
      const tag = createTag(db, { name: 'To Delete', slug: 'to-delete' });

      const res = await app.request(`/tags/${tag.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(204);

      // Verify tag is gone
      const getRes = await app.request(`/tags/${tag.id}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent tag', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/tags/${fakeId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TAG_NOT_FOUND');
    });

    it('returns 409 when tag is in use', async () => {
      const tag = createTag(db, { name: 'In Use', slug: 'in-use' });
      const obj = createObject(db, 'Page', 'Test Page');
      assignTags(db, { objectId: obj.id, tagIds: [tag.id] });

      const res = await app.request(`/tags/${tag.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(409);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TAG_IN_USE');
    });
  });
});
