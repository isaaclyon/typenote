import { Hono } from 'hono';
import { ImportFolderInputSchema } from '@typenote/api';
import { importFromFolder } from '@typenote/storage';
import type { ServerContext } from '../types.js';

const imports = new Hono<ServerContext>();

/**
 * POST /import/folder - Import objects and types from a folder.
 */
imports.post('/folder', async (c) => {
  const body = await c.req.json();
  const parsed = ImportFolderInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid import request',
      details: parsed.error.flatten(),
    };
  }

  const result = importFromFolder(c.var.db, parsed.data.inputDir, {
    mode: parsed.data.mode,
  });

  return c.json({
    success: true,
    data: result,
  });
});

export { imports };
