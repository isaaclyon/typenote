import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  pinObject,
  type TypenoteDb,
} from '@typenote/storage';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import { pinned as pinnedRoute } from './pinned.js';
import type { ServerContext } from '../types.js';

describe('Pinned Routes', () => {
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
    app.route('/pinned', pinnedRoute);
  });

  afterEach(() => {
    closeDb(db);
  });

  it('GET /pinned returns pinned objects', async () => {
    const first = createObject(db, 'Page', 'First', {}, { applyDefaultTemplate: false });
    const second = createObject(db, 'Page', 'Second', {}, { applyDefaultTemplate: false });
    pinObject(db, first.id);
    pinObject(db, second.id);

    const res = await app.request('/pinned');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { pinnedObjects: { id: string; order: number }[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.pinnedObjects).toHaveLength(2);
    expect(body.data.pinnedObjects[0]?.id).toBe(first.id);
    expect(body.data.pinnedObjects[0]?.order).toBe(0);
  });

  it('POST /pinned pins object and is idempotent', async () => {
    const object = createObject(db, 'Page', 'Pinned', {}, { applyDefaultTemplate: false });

    const first = await app.request('/pinned', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ objectId: object.id }),
    });
    expect(first.status).toBe(200);
    const firstBody = (await first.json()) as {
      success: boolean;
      data: { pinned: boolean };
    };
    expect(firstBody.success).toBe(true);
    expect(firstBody.data.pinned).toBe(true);

    const second = await app.request('/pinned', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ objectId: object.id }),
    });
    expect(second.status).toBe(200);
    const secondBody = (await second.json()) as {
      success: boolean;
      data: { pinned: boolean };
    };
    expect(secondBody.success).toBe(true);
    expect(secondBody.data.pinned).toBe(false);
  });

  it('DELETE /pinned/:objectId unpins object', async () => {
    const object = createObject(db, 'Page', 'Pinned', {}, { applyDefaultTemplate: false });
    pinObject(db, object.id);

    const res = await app.request(`/pinned/${object.id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { unpinned: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.data.unpinned).toBe(true);

    const second = await app.request(`/pinned/${object.id}`, { method: 'DELETE' });
    const secondBody = (await second.json()) as {
      success: boolean;
      data: { unpinned: boolean };
    };
    expect(secondBody.success).toBe(true);
    expect(secondBody.data.unpinned).toBe(false);
  });

  it('returns validation error for invalid payload', async () => {
    const res = await app.request('/pinned', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ objectId: 'invalid' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });
});
