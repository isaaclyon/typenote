import { Hono } from 'hono';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  ExportAllInputSchema,
  ExportObjectInputSchema,
  ExportTypeInputSchema,
} from '@typenote/api';
import {
  deterministicStringify,
  exportObject,
  exportObjectsByType,
  exportToFolder,
  getObjectTypeByKey,
} from '@typenote/storage';
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

/**
 * POST /export/object - Export a single object to a folder.
 */
exportRoutes.post('/object', async (c) => {
  const body = await c.req.json();
  const parsed = ExportObjectInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid export request',
      details: parsed.error.flatten(),
    };
  }

  const exported = exportObject(c.var.db, parsed.data.objectId);
  if (!exported) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: 'Object not found',
      details: { objectId: parsed.data.objectId },
    };
  }

  const outputDir = parsed.data.outputDir;
  const objectsDir = path.join(outputDir, 'objects', exported.typeKey);
  await mkdir(objectsDir, { recursive: true });

  const objectPath = path.join(objectsDir, `${exported.id}.json`);
  await writeFile(objectPath, deterministicStringify(exported), 'utf8');

  const objectType = getObjectTypeByKey(c.var.db, exported.typeKey);
  if (objectType && !objectType.builtIn) {
    const typesDir = path.join(outputDir, 'types');
    await mkdir(typesDir, { recursive: true });
    const typePath = path.join(typesDir, `${objectType.key}.json`);
    const exportedType = {
      $schema: 'typenote/type/v1' as const,
      key: objectType.key,
      name: objectType.name,
      icon: objectType.icon,
      builtIn: objectType.builtIn,
      schema: objectType.schema,
    };
    await writeFile(typePath, deterministicStringify(exportedType), 'utf8');
  }

  return c.json({
    success: true,
    data: {
      path: objectPath,
    },
  });
});

/**
 * POST /export/type - Export a type and its objects to a folder.
 */
exportRoutes.post('/type', async (c) => {
  const body = await c.req.json();
  const parsed = ExportTypeInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid export request',
      details: parsed.error.flatten(),
    };
  }

  const objectType = getObjectTypeByKey(c.var.db, parsed.data.typeKey);
  if (!objectType) {
    throw {
      code: 'TYPE_NOT_FOUND',
      message: 'Object type not found',
      details: { typeKey: parsed.data.typeKey },
    };
  }

  const outputDir = parsed.data.outputDir;
  const typesDir = path.join(outputDir, 'types');
  const objectsDir = path.join(outputDir, 'objects', objectType.key);
  await mkdir(typesDir, { recursive: true });
  await mkdir(objectsDir, { recursive: true });

  const exportedType = {
    $schema: 'typenote/type/v1' as const,
    key: objectType.key,
    name: objectType.name,
    icon: objectType.icon,
    builtIn: objectType.builtIn,
    schema: objectType.schema,
  };
  const typePath = path.join(typesDir, `${objectType.key}.json`);
  await writeFile(typePath, deterministicStringify(exportedType), 'utf8');

  const exportedObjects = exportObjectsByType(c.var.db, objectType.key);
  for (const exported of exportedObjects) {
    const objectPath = path.join(objectsDir, `${exported.id}.json`);
    await writeFile(objectPath, deterministicStringify(exported), 'utf8');
  }

  return c.json({
    success: true,
    data: {
      path: typePath,
    },
  });
});

export { exportRoutes };
