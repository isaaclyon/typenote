import { Hono } from 'hono';
import { objects } from './routes/objects.js';
import { documents } from './routes/documents.js';
import { exports as exportsRoute } from './routes/exports.js';
import { exportRoutes } from './routes/export.js';
import { imports } from './routes/imports.js';
import { search } from './routes/search.js';
import { recent } from './routes/recent.js';
import { health } from './routes/health.js';
import { dailyNotes } from './routes/daily-notes.js';
import { tags } from './routes/tags.js';
import { trash } from './routes/trash.js';
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
  router.route('/objects', exportsRoute);
  router.route('/export', exportRoutes);
  router.route('/import', imports);
  router.route('/search', search);
  router.route('/recent', recent);
  router.route('/daily-notes', dailyNotes);
  router.route('/tags', tags);
  router.route('/trash', trash);

  return router;
}
