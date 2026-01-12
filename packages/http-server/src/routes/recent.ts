import { Hono } from 'hono';
import { getRecentObjects, recordView } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const recent = new Hono<ServerContext>();

/**
 * GET /recent - Get recently viewed objects
 */
recent.get('/', (c) => {
  const db = c.var.db;
  const limitParam = c.req.query('limit');

  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  const results = getRecentObjects(db, limit);

  return c.json({
    success: true,
    data: results,
  });
});

/**
 * POST /recent/:id - Record a view of an object
 */
recent.post('/:id', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  recordView(db, id);

  return c.json({
    success: true,
  });
});

export { recent };
