import { Hono } from 'hono';
import { objects } from './routes/objects.js';
import { documents } from './routes/documents.js';
import { search } from './routes/search.js';
import { recent } from './routes/recent.js';
import { health } from './routes/health.js';
import type { ServerContext } from './types.js';

/**
 * Creates the main API router with all routes mounted.
 * Mount this at /api/v1 in the server.
 */
export function createRouter() {
  const router = new Hono<ServerContext>();

  router.route('/health', health);
  router.route('/objects', objects);
  router.route('/objects', documents); // Document routes are under /objects/:id/document
  router.route('/search', search);
  router.route('/recent', recent);

  return router;
}
