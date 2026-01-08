/**
 * ObjectTypeService — CRUD operations for object types.
 *
 * Object types define the schema for objects in the system.
 * Built-in types are seeded on database initialization.
 */

import { eq } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type {
  CreateObjectTypeInput,
  UpdateObjectTypeInput,
  ListObjectTypesOptions,
  ObjectType,
  TypeSchema,
  BuiltInTypeKey,
} from '@typenote/api';
import { BUILT_IN_TYPE_KEYS } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objectTypes, objects } from './schema.js';

// ============================================================================
// Error Types
// ============================================================================

export class ObjectTypeError extends Error {
  constructor(
    public readonly code: 'TYPE_NOT_FOUND' | 'TYPE_KEY_EXISTS' | 'TYPE_BUILT_IN' | 'TYPE_IN_USE',
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ObjectTypeError';
  }
}

// ============================================================================
// Built-in Type Definitions
// ============================================================================

/**
 * Built-in type configurations.
 * These define the name, icon, and property schema for each built-in type.
 */
export const BUILT_IN_TYPES: Record<
  BuiltInTypeKey,
  {
    name: string;
    icon: string | null;
    schema: TypeSchema | null;
  }
> = {
  DailyNote: {
    name: 'Daily Note',
    icon: 'calendar',
    schema: {
      properties: [
        {
          key: 'date_key',
          name: 'Date',
          type: 'date',
          required: true,
        },
      ],
    },
  },
  Page: {
    name: 'Page',
    icon: 'file-text',
    schema: null, // No required properties
  },
  Person: {
    name: 'Person',
    icon: 'user',
    schema: {
      properties: [
        {
          key: 'email',
          name: 'Email',
          type: 'text',
          required: false,
        },
      ],
    },
  },
  Event: {
    name: 'Event',
    icon: 'calendar-clock',
    schema: {
      properties: [
        {
          key: 'start_date',
          name: 'Start Date',
          type: 'datetime',
          required: false,
        },
        {
          key: 'end_date',
          name: 'End Date',
          type: 'datetime',
          required: false,
        },
      ],
    },
  },
  Place: {
    name: 'Place',
    icon: 'map-pin',
    schema: {
      properties: [
        {
          key: 'address',
          name: 'Address',
          type: 'text',
          required: false,
        },
      ],
    },
  },
  Task: {
    name: 'Task',
    icon: 'check-square',
    schema: {
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: true,
          options: ['Backlog', 'Todo', 'InProgress', 'Done'],
          defaultValue: 'Todo',
        },
        {
          key: 'due_date',
          name: 'Due Date',
          type: 'datetime',
          required: false,
        },
        {
          key: 'priority',
          name: 'Priority',
          type: 'select',
          required: false,
          options: ['Low', 'Medium', 'High'],
        },
      ],
    },
  },
};

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Convert database row to ObjectType entity.
 */
function rowToObjectType(row: typeof objectTypes.$inferSelect): ObjectType {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    icon: row.icon,
    schema: row.schema ? (JSON.parse(row.schema) as TypeSchema) : null,
    builtIn: row.builtIn,
    // These fields are defined in the API but not yet in the DB schema
    // TODO: Add migration to add these columns to object_types table
    parentTypeId: null,
    pluralName: null,
    color: null,
    description: null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Create a new object type.
 * @throws ObjectTypeError if key already exists
 */
export function createObjectType(db: TypenoteDb, input: CreateObjectTypeInput): ObjectType {
  // Check if key already exists
  const existing = db
    .select()
    .from(objectTypes)
    .where(eq(objectTypes.key, input.key))
    .limit(1)
    .all()[0];

  if (existing) {
    throw new ObjectTypeError(
      'TYPE_KEY_EXISTS',
      `Object type with key '${input.key}' already exists`,
      {
        key: input.key,
      }
    );
  }

  const id = generateId();
  const now = new Date();

  db.insert(objectTypes)
    .values({
      id,
      key: input.key,
      name: input.name,
      icon: input.icon ?? null,
      schema: input.schema ? JSON.stringify(input.schema) : null,
      builtIn: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return {
    id,
    key: input.key,
    name: input.name,
    icon: input.icon ?? null,
    schema: input.schema ?? null,
    builtIn: false,
    // These fields are defined in the API but not yet in the DB schema
    parentTypeId: null,
    pluralName: null,
    color: null,
    description: null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get an object type by ID.
 * @returns ObjectType or null if not found
 */
export function getObjectType(db: TypenoteDb, id: string): ObjectType | null {
  const row = db.select().from(objectTypes).where(eq(objectTypes.id, id)).limit(1).all()[0];

  return row ? rowToObjectType(row) : null;
}

/**
 * Get an object type by key.
 * @returns ObjectType or null if not found
 */
export function getObjectTypeByKey(db: TypenoteDb, key: string): ObjectType | null {
  const row = db.select().from(objectTypes).where(eq(objectTypes.key, key)).limit(1).all()[0];

  return row ? rowToObjectType(row) : null;
}

/**
 * List all object types.
 */
export function listObjectTypes(db: TypenoteDb, options?: ListObjectTypesOptions): ObjectType[] {
  let query = db.select().from(objectTypes);

  if (options?.builtInOnly) {
    query = query.where(eq(objectTypes.builtIn, true)) as typeof query;
  } else if (options?.customOnly) {
    query = query.where(eq(objectTypes.builtIn, false)) as typeof query;
  }

  const rows = query.all();
  return rows.map(rowToObjectType);
}

/**
 * Update an object type.
 * @throws ObjectTypeError if type not found or is built-in
 */
export function updateObjectType(
  db: TypenoteDb,
  id: string,
  input: UpdateObjectTypeInput
): ObjectType {
  const existing = db.select().from(objectTypes).where(eq(objectTypes.id, id)).limit(1).all()[0];

  if (!existing) {
    throw new ObjectTypeError('TYPE_NOT_FOUND', `Object type not found: ${id}`, { id });
  }

  // Built-in types can only have their icon and schema updated, not name
  if (existing.builtIn && input.name !== undefined) {
    throw new ObjectTypeError('TYPE_BUILT_IN', 'Cannot change name of built-in type', {
      id,
      key: existing.key,
    });
  }

  const now = new Date();
  const updates: Partial<typeof objectTypes.$inferInsert> = {
    updatedAt: now,
  };

  if (input.name !== undefined) {
    updates.name = input.name;
  }
  if (input.icon !== undefined) {
    updates.icon = input.icon;
  }
  if (input.schema !== undefined) {
    updates.schema = input.schema ? JSON.stringify(input.schema) : null;
  }

  db.update(objectTypes).set(updates).where(eq(objectTypes.id, id)).run();

  // Return updated object type
  const updated = db.select().from(objectTypes).where(eq(objectTypes.id, id)).limit(1).all()[0];

  if (!updated) {
    // This should never happen since we just updated the row
    throw new ObjectTypeError('TYPE_NOT_FOUND', `Object type not found after update: ${id}`, {
      id,
    });
  }

  return rowToObjectType(updated);
}

/**
 * Delete an object type.
 * @throws ObjectTypeError if type not found, is built-in, or has objects
 */
export function deleteObjectType(db: TypenoteDb, id: string): void {
  const existing = db.select().from(objectTypes).where(eq(objectTypes.id, id)).limit(1).all()[0];

  if (!existing) {
    throw new ObjectTypeError('TYPE_NOT_FOUND', `Object type not found: ${id}`, { id });
  }

  if (existing.builtIn) {
    throw new ObjectTypeError('TYPE_BUILT_IN', 'Cannot delete built-in type', {
      id,
      key: existing.key,
    });
  }

  // Check if any objects use this type (including soft-deleted)
  const objectCount = db.select().from(objects).where(eq(objects.typeId, id)).limit(1).all();

  if (objectCount.length > 0) {
    throw new ObjectTypeError('TYPE_IN_USE', 'Cannot delete type with existing objects', {
      id,
      key: existing.key,
    });
  }

  db.delete(objectTypes).where(eq(objectTypes.id, id)).run();
}

/**
 * Seed built-in object types.
 * This is idempotent — existing types are not modified.
 * Call this on database initialization.
 */
export function seedBuiltInTypes(db: TypenoteDb): void {
  const now = new Date();

  for (const key of BUILT_IN_TYPE_KEYS) {
    const config = BUILT_IN_TYPES[key];

    // Guard: should never happen since we iterate over valid keys
    if (!config) {
      continue;
    }

    // Check if already exists
    const existing = db
      .select()
      .from(objectTypes)
      .where(eq(objectTypes.key, key))
      .limit(1)
      .all()[0];

    if (existing) {
      continue; // Already seeded
    }

    const id = generateId();

    db.insert(objectTypes)
      .values({
        id,
        key,
        name: config.name,
        icon: config.icon,
        schema: config.schema ? JSON.stringify(config.schema) : null,
        builtIn: true,
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
}

/**
 * Check if a type key is a built-in type.
 */
export function isBuiltInTypeKey(key: string): key is BuiltInTypeKey {
  return BUILT_IN_TYPE_KEYS.includes(key as BuiltInTypeKey);
}
