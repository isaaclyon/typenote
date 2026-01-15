import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import {
  createTestDb,
  closeDb,
  type TypenoteDb,
  seedBuiltInTypes,
  createObject,
  objects as objectsTable,
} from '@typenote/storage';
import { trash } from './trash.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Trash Routes', () => {
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
    app.route('/trash', trash);
  });

  afterEach(() => {
    closeDb(db);
  });

  /**
   * Helper to soft-delete an object directly in DB
   */
  function softDelete(objectId: string): void {
    db.update(objectsTable)
      .set({ deletedAt: new Date() })
      .where(eq(objectsTable.id, objectId))
      .run();
  }

  describe('GET /trash', () => {
    it('returns empty array when no deleted objects', async () => {
      const res = await app.request('/trash');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it('returns list of deleted objects', async () => {
      // Create and soft-delete objects
      const obj1 = createObject(db, 'Page', 'Deleted Page 1');
      const obj2 = createObject(db, 'Page', 'Deleted Page 2');
      softDelete(obj1.id);
      softDelete(obj2.id);

      const res = await app.request('/trash');

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string; title: string }>;
      };
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(2);

      const ids = body.data.map((o) => o.id);
      expect(ids).toContain(obj1.id);
      expect(ids).toContain(obj2.id);
    });

    it('does not return active (non-deleted) objects', async () => {
      // Create objects - one deleted, one active
      const deleted = createObject(db, 'Page', 'Deleted Page');
      createObject(db, 'Page', 'Active Page'); // Not deleted
      softDelete(deleted.id);

      const res = await app.request('/trash');

      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string }>;
      };
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.id).toBe(deleted.id);
    });

    it('respects limit parameter', async () => {
      // Create and delete 3 objects
      for (let i = 0; i < 3; i++) {
        const obj = createObject(db, 'Page', `Deleted ${i}`);
        softDelete(obj.id);
      }

      const res = await app.request('/trash?limit=2');

      const body = (await res.json()) as {
        success: boolean;
        data: unknown[];
      };
      expect(body.data).toHaveLength(2);
    });

    it('filters by typeKey', async () => {
      // Create different types
      const page = createObject(db, 'Page', 'Deleted Page');
      const person = createObject(db, 'Person', 'Deleted Person');
      softDelete(page.id);
      softDelete(person.id);

      const res = await app.request('/trash?typeKey=Page');

      const body = (await res.json()) as {
        success: boolean;
        data: Array<{ id: string; typeKey: string }>;
      };
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.typeKey).toBe('Page');
    });
  });

  describe('POST /trash/:id/restore', () => {
    it('restores a deleted object', async () => {
      const obj = createObject(db, 'Page', 'To Restore');
      softDelete(obj.id);

      // Verify it's in trash
      let trashRes = await app.request('/trash');
      let trashBody = (await trashRes.json()) as { data: Array<{ id: string }> };
      expect(trashBody.data.map((o) => o.id)).toContain(obj.id);

      // Restore it
      const res = await app.request(`/trash/${obj.id}/restore`, {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { id: string; title: string; blocksRestored: number };
      };
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(obj.id);
      expect(body.data.title).toBe('To Restore');

      // Verify it's no longer in trash
      trashRes = await app.request('/trash');
      trashBody = (await trashRes.json()) as { data: Array<{ id: string }> };
      expect(trashBody.data.map((o) => o.id)).not.toContain(obj.id);
    });

    it('returns 404 for non-existent object', async () => {
      const fakeId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

      const res = await app.request(`/trash/${fakeId}/restore`, {
        method: 'POST',
      });

      expect(res.status).toBe(404);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('OBJECT_NOT_FOUND');
    });

    it('returns no-op result for active (non-deleted) object', async () => {
      // Create but don't delete
      const obj = createObject(db, 'Page', 'Active Page');

      const res = await app.request(`/trash/${obj.id}/restore`, {
        method: 'POST',
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as {
        success: boolean;
        data: { blocksRestored: number };
      };
      expect(body.success).toBe(true);
      expect(body.data.blocksRestored).toBe(0); // No-op
    });
  });
});
