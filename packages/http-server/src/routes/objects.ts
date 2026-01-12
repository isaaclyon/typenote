import { Hono } from 'hono';
import { getObject, listObjects, createObject } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const objects = new Hono<ServerContext>();

/**
 * GET /objects - List all objects
 */
objects.get('/', (c) => {
  const db = c.var.db;
  const objectList = listObjects(db);

  return c.json({
    success: true,
    data: objectList,
  });
});

/**
 * GET /objects/:id - Get object details by ID
 */
objects.get('/:id', (c) => {
  const id = c.req.param('id');
  const db = c.var.db;

  const object = getObject(db, id);

  if (!object) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  return c.json({
    success: true,
    data: object,
  });
});

/**
 * POST /objects - Create a new object
 */
objects.post('/', async (c) => {
  const db = c.var.db;
  const body = (await c.req.json()) as {
    typeKey: string;
    title: string;
    properties?: Record<string, unknown>;
  };

  const created = createObject(db, body.typeKey, body.title, body.properties);

  return c.json(
    {
      success: true,
      data: created,
    },
    201
  );
});

export { objects };
