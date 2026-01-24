import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  createObjectType,
  getObjectTypeByKey,
  createObject,
  InMemoryFileService,
} from '@typenote/storage';
import type { TypenoteDb } from '@typenote/storage';
import { createRouter } from '../router.js';
import { errorHandler, errorOnError } from '../middleware/errorHandler.js';
import type { ServerContext } from '../types.js';

describe('Object Types Routes', () => {
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

  it('GET /object-types lists built-in and custom types', async () => {
    createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request('/api/v1/object-types');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: Array<{ key: string }> };
    expect(body.success).toBe(true);
    expect(body.data.some((type) => type.key === 'Project')).toBe(true);
  });

  it('GET /object-types?builtInOnly=true filters to built-in types', async () => {
    createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request('/api/v1/object-types?builtInOnly=true');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ key: string; builtIn: boolean }>;
    };
    expect(body.success).toBe(true);
    expect(body.data.every((type) => type.builtIn)).toBe(true);
    expect(body.data.some((type) => type.key === 'Project')).toBe(false);
  });

  it('GET /object-types?customOnly=true filters to custom types', async () => {
    createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request('/api/v1/object-types?customOnly=true');
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      success: boolean;
      data: Array<{ key: string; builtIn: boolean }>;
    };
    expect(body.success).toBe(true);
    expect(body.data.every((type) => !type.builtIn)).toBe(true);
    expect(body.data.some((type) => type.key === 'Project')).toBe(true);
  });

  it('GET /object-types rejects conflicting filters', async () => {
    const res = await app.request('/api/v1/object-types?builtInOnly=true&customOnly=true');
    expect(res.status).toBe(400);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION');
  });

  it('GET /object-types/:id returns a type by id', async () => {
    const created = createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request(`/api/v1/object-types/${created.id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { id: string; key: string } };
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(created.id);
    expect(body.data.key).toBe('Project');
  });

  it('GET /object-types/:id returns 404 for missing type', async () => {
    const res = await app.request('/api/v1/object-types/01ARZ3NDEKTSV4RRFFQ69G5FAV');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_OBJECT_TYPE');
  });

  it('GET /object-types/key/:key returns a type by key', async () => {
    createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request('/api/v1/object-types/key/Project');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { key: string } };
    expect(body.success).toBe(true);
    expect(body.data.key).toBe('Project');
  });

  it('GET /object-types/key/:key returns 404 for missing key', async () => {
    const res = await app.request('/api/v1/object-types/key/Nope');
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND_OBJECT_TYPE');
  });

  it('POST /object-types creates a new type', async () => {
    const res = await app.request('/api/v1/object-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'Project', name: 'Project' }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: { id: string; key: string } };
    expect(body.success).toBe(true);
    expect(body.data.key).toBe('Project');
    expect(body.data.id).toHaveLength(26);
  });

  it('POST /object-types returns 409 for duplicate key', async () => {
    createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request('/api/v1/object-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'Project', name: 'Project Again' }),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('TYPE_KEY_EXISTS');
  });

  it('PATCH /object-types/:id updates a custom type', async () => {
    const created = createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request(`/api/v1/object-types/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Project' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { name: string } };
    expect(body.success).toBe(true);
    expect(body.data.name).toBe('Updated Project');
  });

  it('PATCH /object-types/:id returns 409 for built-in type name change', async () => {
    const builtIn = getObjectTypeByKey(db, 'Page');
    if (!builtIn) {
      throw new Error('Built-in type not seeded');
    }

    const res = await app.request(`/api/v1/object-types/${builtIn.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Renamed Page' }),
    });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('TYPE_BUILT_IN');
  });

  it('DELETE /object-types/:id removes a custom type', async () => {
    const created = createObjectType(db, { key: 'Project', name: 'Project' });

    const res = await app.request(`/api/v1/object-types/${created.id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);
  });

  it('DELETE /object-types/:id rejects deleting parent types', async () => {
    const parent = createObjectType(db, { key: 'Project', name: 'Project' });
    createObjectType(db, {
      key: 'Subproject',
      name: 'Subproject',
      parentTypeId: parent.id,
    });

    const res = await app.request(`/api/v1/object-types/${parent.id}`, { method: 'DELETE' });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('TYPE_HAS_CHILDREN');
  });

  it('DELETE /object-types/:id rejects types in use', async () => {
    const type = createObjectType(db, { key: 'Project', name: 'Project' });
    createObject(db, 'Project', 'Alpha');

    const res = await app.request(`/api/v1/object-types/${type.id}`, { method: 'DELETE' });
    expect(res.status).toBe(409);
    const body = (await res.json()) as { success: boolean; error: { code: string } };
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('TYPE_IN_USE');
  });
});
