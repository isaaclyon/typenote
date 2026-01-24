import { Hono } from 'hono';
import {
  PinObjectInputSchema,
  UnpinObjectInputSchema,
  ReorderPinnedObjectsInputSchema,
} from '@typenote/api';
import {
  getPinnedObjects,
  pinObject,
  unpinObject,
  isPinned,
  getObject,
  reorderPinnedObjects,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const pinned = new Hono<ServerContext>();

/**
 * GET /pinned - List pinned objects.
 */
pinned.get('/', (c) => {
  const pinnedObjects = getPinnedObjects(c.var.db);
  return c.json({
    success: true,
    data: { pinnedObjects },
  });
});

/**
 * POST /pinned - Pin an object.
 */
pinned.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = PinObjectInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid pin payload',
      details: parsed.error.flatten(),
    };
  }

  const { objectId } = parsed.data;
  const object = getObject(c.var.db, objectId);
  if (!object) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: 'Object not found',
      details: { objectId },
    };
  }

  const wasPinned = isPinned(c.var.db, objectId);
  pinObject(c.var.db, objectId);

  const pinnedObjects = getPinnedObjects(c.var.db);
  const pinnedObject = pinnedObjects.find((item) => item.id === objectId);
  if (!pinnedObject) {
    throw {
      code: 'INTERNAL',
      message: 'Pinned object not found after pinning',
      details: { objectId },
    };
  }

  return c.json({
    success: true,
    data: {
      objectId,
      pinned: !wasPinned,
      pinnedAt: pinnedObject.pinnedAt,
      order: pinnedObject.order,
    },
  });
});

/**
 * DELETE /pinned/:objectId - Unpin an object.
 */
pinned.delete('/:objectId', (c) => {
  const objectId = c.req.param('objectId');
  const parsed = UnpinObjectInputSchema.safeParse({ objectId });
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid objectId',
      details: parsed.error.flatten(),
    };
  }

  const wasPinned = isPinned(c.var.db, objectId);
  unpinObject(c.var.db, objectId);

  return c.json({
    success: true,
    data: {
      objectId,
      unpinned: wasPinned,
    },
  });
});

/**
 * PATCH /pinned/reorder - Reorder pinned objects.
 */
pinned.patch('/reorder', async (c) => {
  const body = await c.req.json();
  const parsed = ReorderPinnedObjectsInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid reorder payload',
      details: parsed.error.flatten(),
    };
  }

  reorderPinnedObjects(c.var.db, parsed.data.objectIds);

  return c.json({
    success: true,
    data: {
      updatedObjectIds: parsed.data.objectIds,
    },
  });
});

export { pinned };
