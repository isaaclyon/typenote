import { Hono } from 'hono';
import { listDeletedObjects, restoreObject } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const trash = new Hono<ServerContext>();

/**
 * GET /trash - List soft-deleted objects
 *
 * Query params:
 * - limit?: number (default 100)
 * - typeKey?: string (filter by type)
 */
trash.get('/', (c) => {
  const db = c.var.db;

  const limit = c.req.query('limit');
  const typeKey = c.req.query('typeKey');

  // Build options object conditionally to satisfy exactOptionalPropertyTypes
  const options: Parameters<typeof listDeletedObjects>[1] = {};
  if (limit) {
    options.limit = parseInt(limit, 10);
  }
  if (typeKey) {
    options.typeKey = typeKey;
  }

  const deletedObjects = listDeletedObjects(db, options);

  return c.json({
    success: true,
    data: deletedObjects,
  });
});

/**
 * POST /trash/:id/restore - Restore a soft-deleted object
 *
 * Restores the object and all its blocks, re-indexing FTS and refs.
 */
trash.post('/:id/restore', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  const result = restoreObject(db, id);

  return c.json({
    success: true,
    data: result,
  });
});

export { trash };
