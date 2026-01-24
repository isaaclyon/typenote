import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObject,
  InMemoryFileService,
  objects,
  type TypenoteDb,
} from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

function getDateKey(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toDatetime(dateKey: string, time = '12:00:00.000Z'): string {
  return `${dateKey}T${time}`;
}

describe('Tasks Routes', () => {
  let db: TypenoteDb;
  let app: Hono<ServerContext>;
  let fileService: InMemoryFileService;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
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

  it('GET /tasks excludes completed tasks by default', async () => {
    createObject(db, 'Task', 'Open task', { status: 'Todo' });
    createObject(db, 'Task', 'Done task', { status: 'Done' });

    const res = await app.request('/api/v1/tasks');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Open task');
  });

  it('GET /tasks/inbox returns tasks with no due date', async () => {
    createObject(db, 'Task', 'No due date', { status: 'Todo' });
    createObject(db, 'Task', 'Has due date', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(0)),
    });

    const res = await app.request('/api/v1/tasks/inbox');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('No due date');
  });

  it('GET /tasks/today returns tasks due today', async () => {
    const today = getDateKey(0);
    createObject(db, 'Task', 'Due today', { status: 'Todo', due_date: toDatetime(today) });
    createObject(db, 'Task', 'Due tomorrow', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(1)),
    });

    const res = await app.request('/api/v1/tasks/today');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Due today');
  });

  it('GET /tasks/overdue returns tasks past due date', async () => {
    createObject(db, 'Task', 'Overdue', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(-1)),
    });
    createObject(db, 'Task', 'Due today', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(0)),
    });

    const res = await app.request('/api/v1/tasks/overdue');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Overdue');
  });

  it('GET /tasks/upcoming returns tasks due within range', async () => {
    createObject(db, 'Task', 'Upcoming', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(3)),
    });
    createObject(db, 'Task', 'Overdue', {
      status: 'Todo',
      due_date: toDatetime(getDateKey(-2)),
    });

    const res = await app.request('/api/v1/tasks/upcoming?days=7');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Upcoming');
  });

  it('GET /tasks/completed filters by updatedAt range', async () => {
    const doneInRange = createObject(db, 'Task', 'Done in range', { status: 'Done' });
    const doneOutside = createObject(db, 'Task', 'Done outside range', { status: 'Done' });

    db.update(objects)
      .set({ updatedAt: new Date('2026-01-10T12:00:00.000Z') })
      .where(eq(objects.id, doneInRange.id))
      .run();

    db.update(objects)
      .set({ updatedAt: new Date('2026-01-20T12:00:00.000Z') })
      .where(eq(objects.id, doneOutside.id))
      .run();

    const res = await app.request(
      '/api/v1/tasks/completed?from=2026-01-05T00:00:00.000Z&to=2026-01-15T23:59:59.000Z'
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Done in range');
  });

  it('returns 400 for invalid query params', async () => {
    const res = await app.request('/api/v1/tasks?limit=not-a-number');
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('POST /tasks/:id/complete marks task as done and returns summary', async () => {
    const task = createObject(db, 'Task', 'To complete', { status: 'Todo' });

    const res = await app.request(`/api/v1/tasks/${task.id}/complete`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { id: string; properties: { status: string } };
    };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(task.id);
    expect(body.data.properties.status).toBe('Done');
  });

  it('POST /tasks/:id/reopen marks task as todo and returns summary', async () => {
    const task = createObject(db, 'Task', 'To reopen', { status: 'Done' });

    const res = await app.request(`/api/v1/tasks/${task.id}/reopen`, { method: 'POST' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { id: string; properties: { status: string } };
    };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(task.id);
    expect(body.data.properties.status).toBe('Todo');
  });

  it('returns 404 when completing a missing task', async () => {
    const res = await app.request('/api/v1/tasks/01HZX1X5E1G8G5Q2B2V9XG4M2F/complete', {
      method: 'POST',
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_OBJECT');
  });

  it('supports pagination and ordering for /tasks', async () => {
    const first = createObject(db, 'Task', 'First', { status: 'Todo' });
    const second = createObject(db, 'Task', 'Second', { status: 'Todo' });
    const third = createObject(db, 'Task', 'Third', { status: 'Todo' });

    db.update(objects)
      .set({ updatedAt: new Date('2026-01-01T12:00:00.000Z') })
      .where(eq(objects.id, first.id))
      .run();
    db.update(objects)
      .set({ updatedAt: new Date('2026-01-02T12:00:00.000Z') })
      .where(eq(objects.id, second.id))
      .run();
    db.update(objects)
      .set({ updatedAt: new Date('2026-01-03T12:00:00.000Z') })
      .where(eq(objects.id, third.id))
      .run();

    const res = await app.request('/api/v1/tasks?limit=1&offset=1');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Second');
  });

  it('supports pagination and ordering for /tasks/completed', async () => {
    const first = createObject(db, 'Task', 'First done', { status: 'Done' });
    const second = createObject(db, 'Task', 'Second done', { status: 'Done' });
    const third = createObject(db, 'Task', 'Third done', { status: 'Done' });

    db.update(objects)
      .set({ updatedAt: new Date('2026-01-01T12:00:00.000Z') })
      .where(eq(objects.id, first.id))
      .run();
    db.update(objects)
      .set({ updatedAt: new Date('2026-01-02T12:00:00.000Z') })
      .where(eq(objects.id, second.id))
      .run();
    db.update(objects)
      .set({ updatedAt: new Date('2026-01-03T12:00:00.000Z') })
      .where(eq(objects.id, third.id))
      .run();

    const res = await app.request(
      '/api/v1/tasks/completed?from=2025-12-31T00:00:00.000Z&to=2026-01-31T23:59:59.000Z&limit=1&offset=1'
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ title: string }> };
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]?.title).toBe('Second done');
  });
});
