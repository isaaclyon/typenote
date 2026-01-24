import { Hono } from 'hono';
import {
  createObjectType,
  deleteObjectType,
  getObjectType,
  getObjectTypeByKey,
  listObjectTypes,
  updateObjectType,
} from '@typenote/storage';
import {
  CreateObjectTypeInputSchema,
  ListObjectTypesOptionsSchema,
  UpdateObjectTypeInputSchema,
} from '@typenote/api';
import type { ServerContext } from '../types.js';

const objectTypes = new Hono<ServerContext>();

function parseBooleanParam(value: string | undefined, name: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw {
    code: 'VALIDATION',
    message: `Query parameter "${name}" must be a boolean`,
    details: { name, value },
  };
}

/**
 * GET /object-types - List object types.
 *
 * Query params:
 * - builtInOnly?: boolean
 * - customOnly?: boolean
 */
objectTypes.get('/', (c) => {
  const builtInOnly = parseBooleanParam(c.req.query('builtInOnly'), 'builtInOnly');
  const customOnly = parseBooleanParam(c.req.query('customOnly'), 'customOnly');

  if (builtInOnly && customOnly) {
    throw {
      code: 'VALIDATION',
      message: 'Query parameters "builtInOnly" and "customOnly" cannot both be true',
      details: { builtInOnly, customOnly },
    };
  }

  const parsed = ListObjectTypesOptionsSchema.safeParse({
    builtInOnly,
    customOnly,
  });

  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid object type list options',
      details: parsed.error.flatten(),
    };
  }

  const results = listObjectTypes(c.var.db, parsed.data);

  return c.json({
    success: true,
    data: results,
  });
});

/**
 * POST /object-types - Create a new object type.
 */
objectTypes.post('/', async (c) => {
  const body: unknown = await c.req.json();
  const parsed = CreateObjectTypeInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid object type input',
      details: parsed.error.flatten(),
    };
  }

  const created = createObjectType(c.var.db, parsed.data);

  return c.json(
    {
      success: true,
      data: created,
    },
    201
  );
});

/**
 * GET /object-types/key/:key - Get object type by key.
 */
objectTypes.get('/key/:key', (c) => {
  const key = c.req.param('key');
  const found = getObjectTypeByKey(c.var.db, key);

  if (!found) {
    throw {
      code: 'NOT_FOUND_OBJECT_TYPE',
      message: `Object type not found: ${key}`,
      details: { typeKey: key },
    };
  }

  return c.json({
    success: true,
    data: found,
  });
});

/**
 * GET /object-types/:id - Get object type by id.
 */
objectTypes.get('/:id', (c) => {
  const id = c.req.param('id');
  const found = getObjectType(c.var.db, id);

  if (!found) {
    throw {
      code: 'NOT_FOUND_OBJECT_TYPE',
      message: `Object type not found: ${id}`,
      details: { typeId: id },
    };
  }

  return c.json({
    success: true,
    data: found,
  });
});

/**
 * PATCH /object-types/:id - Update an object type.
 */
objectTypes.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body: unknown = await c.req.json();
  const parsed = UpdateObjectTypeInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid object type update input',
      details: parsed.error.flatten(),
    };
  }

  const updated = updateObjectType(c.var.db, id, parsed.data);

  return c.json({
    success: true,
    data: updated,
  });
});

/**
 * DELETE /object-types/:id - Delete an object type.
 */
objectTypes.delete('/:id', (c) => {
  const id = c.req.param('id');
  deleteObjectType(c.var.db, id);
  return c.body(null, 204);
});

export { objectTypes };
