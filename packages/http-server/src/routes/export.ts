import { Hono } from 'hono';
import { ExportAllInputSchema } from '@typenote/api';
import { exportToFolder } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const exportRoutes = new Hono<ServerContext>();

/**
 * POST /export/all - Export all objects and types to a folder.
 */
exportRoutes.post('/all', async (c) => {
  const body = await c.req.json();
  const parsed = ExportAllInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid export request',
      details: parsed.error.flatten(),
    };
  }

  const manifest = exportToFolder(c.var.db, parsed.data.outputDir);

  return c.json({
    success: true,
    data: {
      path: parsed.data.outputDir,
      manifest,
    },
  });
});

export { exportRoutes };
