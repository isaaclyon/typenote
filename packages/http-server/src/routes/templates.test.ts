import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createTemplate,
  deleteTemplate,
  type TypenoteDb,
} from '@typenote/storage';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import { templates as templatesRoute } from './templates.js';
import type { ServerContext } from '../types.js';

describe('Templates Routes', () => {
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
    app.route('/templates', templatesRoute);
  });

  afterEach(() => {
    closeDb(db);
  });

  it('GET /templates returns list', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Template 1',
      content: { blocks: [] },
      isDefault: true,
    });

    const res = await app.request('/templates');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { templates: { name: string }[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.templates).toHaveLength(1);
  });

  it('GET /templates filters by objectTypeId and includeDeleted', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    const pageTypeId = getTypeId(db, 'Page');
    const dailyTemplate = createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Daily Template',
      content: { blocks: [] },
      isDefault: true,
    });
    createTemplate(db, {
      objectTypeId: pageTypeId,
      name: 'Page Template',
      content: { blocks: [] },
      isDefault: true,
    });

    deleteTemplate(db, dailyTemplate.id);

    const res = await app.request(`/templates?objectTypeId=${dailyNoteTypeId}`);
    const body = (await res.json()) as {
      success: boolean;
      data: { templates: { name: string }[] };
    };
    expect(body.success).toBe(true);
    expect(body.data.templates).toHaveLength(0);

    const includeDeleted = await app.request(
      `/templates?objectTypeId=${dailyNoteTypeId}&includeDeleted=true`
    );
    const includeBody = (await includeDeleted.json()) as {
      success: boolean;
      data: { templates: { name: string }[] };
    };
    expect(includeBody.data.templates).toHaveLength(1);
  });

  it('GET /templates/:id returns template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    const created = createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Template',
      content: { blocks: [] },
      isDefault: true,
    });

    const res = await app.request(`/templates/${created.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { template: { id: string } };
    };
    expect(body.success).toBe(true);
    expect(body.data.template.id).toBe(created.id);
  });

  it('POST /templates creates template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    const res = await app.request('/templates', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        objectTypeId: dailyNoteTypeId,
        name: 'Created Template',
        content: { blocks: [] },
        isDefault: true,
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as {
      success: boolean;
      data: { template: { name: string } };
    };
    expect(body.success).toBe(true);
    expect(body.data.template.name).toBe('Created Template');
  });

  it('PATCH /templates/:id updates template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    const created = createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Original',
      content: { blocks: [] },
      isDefault: true,
    });

    const res = await app.request(`/templates/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { template: { name: string } };
    };
    expect(body.data.template.name).toBe('Updated');
  });

  it('DELETE /templates/:id soft-deletes template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    const created = createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Delete Me',
      content: { blocks: [] },
      isDefault: true,
    });

    const res = await app.request(`/templates/${created.id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { deleted: boolean };
    };
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });

  it('GET /templates/default returns default template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Default Template',
      content: { blocks: [] },
      isDefault: true,
    });

    const res = await app.request(`/templates/default?objectTypeId=${dailyNoteTypeId}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { template: { name: string } };
    };
    expect(body.data.template.name).toBe('Default Template');
  });

  it('POST /templates/default sets default template', async () => {
    const dailyNoteTypeId = getTypeId(db, 'DailyNote');
    createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'First',
      content: { blocks: [] },
      isDefault: true,
    });
    const second = createTemplate(db, {
      objectTypeId: dailyNoteTypeId,
      name: 'Second',
      content: { blocks: [] },
      isDefault: false,
    });

    const res = await app.request('/templates/default', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ templateId: second.id }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: { template: { id: string; isDefault: boolean } };
    };
    expect(body.success).toBe(true);
    expect(body.data.template.id).toBe(second.id);
    expect(body.data.template.isDefault).toBe(true);
  });
});

function getTypeId(db: TypenoteDb, key: string): string {
  const rows = db.all<{ id: string }>(`SELECT id FROM object_types WHERE key = '${key}'`);
  const first = rows[0];
  if (!first) throw new Error(`${key} type not found`);
  return first.id;
}
