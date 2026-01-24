import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  InMemoryFileService,
  type TypenoteDb,
} from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

function dateKeyFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('Calendar Routes', () => {
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
      c.set('fileService', new InMemoryFileService());
      await next();
    });
    app.route('/api/v1', createRouter());
  });

  afterEach(() => {
    closeDb(db);
  });

  it('GET /calendar supports typeKeys[] filtering', async () => {
    createObject(db, 'Event', 'Team Meeting', {
      start_date: '2026-01-15T09:00:00.000Z',
      end_date: '2026-01-15T10:00:00.000Z',
    });
    createObject(db, 'Task', 'Pay rent', {
      status: 'Todo',
      due_date: '2026-01-15T12:00:00.000Z',
    });
    createObject(db, 'DailyNote', '2026-01-15', { date_key: '2026-01-15' });

    const res = await app.request(
      '/api/v1/calendar?startDate=2026-01-10&endDate=2026-01-20&typeKeys[]=Task&typeKeys[]=Event'
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ title: string; typeKey: string }>;
    };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
    expect(body.data.map((item) => item.typeKey).sort()).toEqual(['Event', 'Task']);
  });

  it('GET /calendar normalizes datetime query inputs', async () => {
    createObject(db, 'Task', 'Same day task', {
      status: 'Todo',
      due_date: '2026-01-10T12:00:00.000Z',
    });

    const res = await app.request(
      '/api/v1/calendar?startDate=2026-01-10T00:00:00.000Z&endDate=2026-01-10T23:59:59.999Z'
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Same day task');
  });

  it('GET /calendar/day/:dateKey returns items on that date', async () => {
    createObject(db, 'DailyNote', '2026-01-12', { date_key: '2026-01-12' });

    const res = await app.request('/api/v1/calendar/day/2026-01-12');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('2026-01-12');
  });

  it('GET /calendar/upcoming rejects negative days', async () => {
    const res = await app.request('/api/v1/calendar/upcoming?days=-1');
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('GET /calendar/upcoming includes items within range', async () => {
    const dueDate = dateKeyFromToday(3);
    createObject(db, 'Task', 'Upcoming task', {
      status: 'Todo',
      due_date: `${dueDate}T09:00:00.000Z`,
    });

    const res = await app.request('/api/v1/calendar/upcoming?days=7');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data.some((item) => item.title === 'Upcoming task')).toBe(true);
  });

  it('GET /calendar/types returns built-in types', async () => {
    const res = await app.request('/api/v1/calendar/types');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ typeKey: string }> };
    expect(body.success).toBe(true);
    const keys = body.data.map((item) => item.typeKey);
    expect(keys).toContain('Event');
    expect(keys).toContain('Task');
    expect(keys).toContain('DailyNote');
  });
});
