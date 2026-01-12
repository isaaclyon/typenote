import { Hono } from 'hono';
import { getObject } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const objects = new Hono<ServerContext>();

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

export { objects };
