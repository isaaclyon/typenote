import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { createTestDb, closeDb, seedBuiltInTypes, type TypenoteDb } from '@typenote/storage';
import { dailyNotes } from './daily-notes.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Daily Notes Routes', () => {
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
    app.route('/daily-notes', dailyNotes);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('POST /daily-notes/today', () => {
    it("creates and returns today's daily note", async () => {
      const res = await app.request('/daily-notes/today', { method: 'POST' });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { created: boolean; dailyNote: { title: string } };
      };
      expect(body.success).toBe(true);
      expect(body.data.created).toBe(true);
      expect(body.data.dailyNote).toBeDefined();
      expect(body.data.dailyNote.title).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns existing daily note on second call with created: false', async () => {
      // First call creates
      const res1 = await app.request('/daily-notes/today', { method: 'POST' });
      expect(res1.status).toBe(201);
      const body1 = (await res1.json()) as {
        data: { dailyNote: { id: string } };
      };
      const noteId = body1.data.dailyNote.id;

      // Second call returns existing
      const res2 = await app.request('/daily-notes/today', { method: 'POST' });
      expect(res2.status).toBe(200);
      const body2 = (await res2.json()) as {
        data: { created: boolean; dailyNote: { id: string } };
      };
      expect(body2.data.created).toBe(false);
      expect(body2.data.dailyNote.id).toBe(noteId);
    });
  });

  describe('POST /daily-notes/:dateKey', () => {
    it('creates daily note for valid date', async () => {
      const res = await app.request('/daily-notes/2026-01-15', { method: 'POST' });

      expect(res.status).toBe(201);
      const body = (await res.json()) as {
        success: boolean;
        data: { created: boolean; dailyNote: { title: string } };
      };
      expect(body.success).toBe(true);
      expect(body.data.created).toBe(true);
      expect(body.data.dailyNote.title).toBe('2026-01-15');
    });

    it('returns 400 for invalid date format', async () => {
      const res = await app.request('/daily-notes/not-a-date', { method: 'POST' });

      expect(res.status).toBe(400);
      const body = (await res.json()) as {
        success: boolean;
        error: { code: string };
      };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_DATE_FORMAT');
    });
  });
});
