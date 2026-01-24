import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  updateSettings,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Settings Routes', () => {
  let db: TypenoteDb;
  let app: Hono<ServerContext>;
  let fileService: InMemoryFileService;

  beforeEach(() => {
    db = createTestDb();
    fileService = new InMemoryFileService();

    app = new Hono<ServerContext>();
    app.use('*', errorHandler());
    app.onError(errorOnError);
    app.use('*', async (c, next) => {
      c.set('db', db);
      c.set('fileService', fileService);
      await next();
    });
    app.route('/api/v1', createRouter());
  });

  afterEach(() => {
    closeDb(db);
  });

  it('GET /settings returns defaults', async () => {
    const res = await app.request('/api/v1/settings');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { colorMode: string; weekStartDay: string; spellcheck: boolean; dateFormat: string };
    };
    expect(body.success).toBe(true);
    expect(body.data.colorMode).toBe('system');
    expect(body.data.weekStartDay).toBe('sunday');
    expect(body.data.spellcheck).toBe(true);
    expect(body.data.dateFormat).toBe('iso');
  });

  it('PATCH /settings updates settings and returns full payload', async () => {
    const res = await app.request('/api/v1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colorMode: 'dark', spellcheck: false }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { colorMode: string; spellcheck: boolean; weekStartDay: string; timeFormat: string };
    };
    expect(body.success).toBe(true);
    expect(body.data.colorMode).toBe('dark');
    expect(body.data.spellcheck).toBe(false);
    expect(body.data.weekStartDay).toBe('sunday');
    expect(body.data.timeFormat).toBe('12h');
  });

  it('PATCH /settings rejects empty payload', async () => {
    const res = await app.request('/api/v1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('PATCH /settings rejects unknown keys', async () => {
    const res = await app.request('/api/v1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unknown: 'value' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('GET /settings/:key returns default when unset', async () => {
    const res = await app.request('/api/v1/settings/colorMode');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { key: string; value: string } };
    expect(body.success).toBe(true);
    expect(body.data.key).toBe('colorMode');
    expect(body.data.value).toBe('system');
  });

  it('PATCH /settings/:key updates a single setting', async () => {
    const res = await app.request('/api/v1/settings/colorMode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'dark' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { key: string; value: string } };
    expect(body.success).toBe(true);
    expect(body.data.key).toBe('colorMode');
    expect(body.data.value).toBe('dark');
  });

  it('PATCH /settings/:key rejects invalid keys', async () => {
    const res = await app.request('/api/v1/settings/invalidKey', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'dark' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('PATCH /settings/:key rejects invalid values', async () => {
    const res = await app.request('/api/v1/settings/colorMode', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'invalid' }),
    });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('POST /settings/reset resets settings to defaults', async () => {
    updateSettings(db, { colorMode: 'dark', spellcheck: false });

    const res = await app.request('/api/v1/settings/reset', {
      method: 'POST',
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { colorMode: string } };
    expect(body.success).toBe(true);
    expect(body.data.colorMode).toBe('system');
  });
});
