import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import {
  getObject,
  listObjects,
  createObject,
  updateObject,
  duplicateObject,
  getBacklinks,
  getUnlinkedMentionsTo,
  getObjectTags,
  assignTags,
  removeTags,
  objects as objectsTable,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const objects = new Hono<ServerContext>();

/**
 * GET /objects - List all objects
 *
 * Query params:
 * - typeKey?: string - Filter by object type
 * - includeProperties?: boolean - Include object properties
 * - createdOnDate?: string - Filter by creation date (YYYY-MM-DD)
 * - sortBy?: string - Column to sort by
 * - sortDirection?: 'asc' | 'desc' - Sort direction
 */
objects.get('/', (c) => {
  const db = c.var.db;
  const query = c.req.query();

  const options: {
    typeKey?: string;
    includeProperties?: boolean;
    createdOnDate?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {};

  if (query['typeKey']) options.typeKey = query['typeKey'];
  if (query['includeProperties'] === 'true') options.includeProperties = true;
  if (query['createdOnDate']) options.createdOnDate = query['createdOnDate'];
  if (query['sortBy']) options.sortBy = query['sortBy'];
  if (query['sortDirection'] === 'asc' || query['sortDirection'] === 'desc') {
    options.sortDirection = query['sortDirection'];
  }

  const objectList = listObjects(db, options);

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

/**
 * PATCH /objects/:id - Update an object
 *
 * Request body:
 * - baseDocVersion?: number (for optimistic concurrency)
 * - patch: { title?: string, typeKey?: string, properties?: object }
 * - propertyMapping?: object (for type migration)
 */
objects.patch('/:id', async (c) => {
  const db = c.var.db;
  const id = c.req.param('id');
  const body = (await c.req.json()) as {
    baseDocVersion?: number;
    patch: {
      title?: string;
      typeKey?: string;
      properties?: Record<string, unknown>;
    };
    propertyMapping?: Record<string, string>;
  };

  const result = updateObject(db, {
    objectId: id,
    baseDocVersion: body.baseDocVersion,
    patch: body.patch,
    propertyMapping: body.propertyMapping,
  });

  return c.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /objects/:id - Soft-delete an object
 *
 * Sets deletedAt timestamp. Object can be restored via /trash/:id/restore.
 */
objects.delete('/:id', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  // Check object exists and is not already deleted
  const existing = getObject(db, id);
  if (!existing) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  // Soft-delete by setting deletedAt
  const now = new Date();
  db.update(objectsTable).set({ deletedAt: now }).where(eq(objectsTable.id, id)).run();

  return c.json({
    success: true,
    data: {
      id,
      deletedAt: now.toISOString(),
    },
  });
});

/**
 * POST /objects/:id/duplicate - Duplicate an object with all its blocks
 */
objects.post('/:id/duplicate', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  const result = duplicateObject(db, id);

  return c.json(
    {
      success: true,
      data: result,
    },
    201
  );
});

// ============================================================================
// Tag Assignment Endpoints
// ============================================================================

/**
 * GET /objects/:id/tags - Get tags assigned to an object
 */
objects.get('/:id/tags', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  // Verify object exists
  const existing = getObject(db, id);
  if (!existing) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  const tags = getObjectTags(db, id);

  return c.json({
    success: true,
    data: tags,
  });
});

/**
 * POST /objects/:id/tags - Assign tags to an object
 *
 * Request body:
 * - tagIds: string[]
 *
 * Idempotent: assigning already-assigned tags is a no-op.
 */
objects.post('/:id/tags', async (c) => {
  const db = c.var.db;
  const id = c.req.param('id');
  const body = (await c.req.json()) as {
    tagIds: string[];
  };

  const result = assignTags(db, {
    objectId: id,
    tagIds: body.tagIds,
  });

  return c.json({
    success: true,
    data: result,
  });
});

/**
 * DELETE /objects/:id/tags - Remove tags from an object
 *
 * Request body:
 * - tagIds: string[]
 *
 * Idempotent: removing unassigned tags is a no-op.
 */
objects.delete('/:id/tags', async (c) => {
  const db = c.var.db;
  const id = c.req.param('id');
  const body = (await c.req.json()) as {
    tagIds: string[];
  };

  const result = removeTags(db, {
    objectId: id,
    tagIds: body.tagIds,
  });

  return c.json({
    success: true,
    data: result,
  });
});

// ============================================================================
// Backlinks Endpoints
// ============================================================================

/**
 * GET /objects/:id/backlinks - Get inbound references to an object
 */
objects.get('/:id/backlinks', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  // Verify object exists
  const existing = getObject(db, id);
  if (!existing) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  const backlinks = getBacklinks(db, id);

  return c.json({
    success: true,
    data: backlinks,
  });
});

/**
 * GET /objects/:id/unlinked-mentions - Get text mentions not yet linked
 */
objects.get('/:id/unlinked-mentions', (c) => {
  const db = c.var.db;
  const id = c.req.param('id');

  // Verify object exists
  const existing = getObject(db, id);
  if (!existing) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  const unlinkedMentions = getUnlinkedMentionsTo(db, id);

  return c.json({
    success: true,
    data: unlinkedMentions,
  });
});

export { objects };
