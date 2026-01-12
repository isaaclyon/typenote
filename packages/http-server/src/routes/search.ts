import { Hono } from 'hono';
import { searchBlocks } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const search = new Hono<ServerContext>();

/**
 * GET /search - Full-text search across blocks
 */
search.get('/', (c) => {
  const db = c.var.db;
  const query = c.req.query('q');
  const limitParam = c.req.query('limit');
  const objectId = c.req.query('objectId');

  if (!query) {
    throw {
      code: 'VALIDATION',
      message: 'Query parameter "q" is required',
    };
  }

  const filters = {
    ...(limitParam && { limit: parseInt(limitParam, 10) }),
    ...(objectId && { objectId }),
  };

  const results = searchBlocks(db, query, filters);

  return c.json({
    success: true,
    data: results,
  });
});

export { search };
