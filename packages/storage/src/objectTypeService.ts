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
  PropertyDefinition,
} from '@typenote/api';
import { BUILT_IN_TYPE_KEYS } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objectTypes, objects } from './schema.js';
import { BUILT_IN_TYPES } from './builtInTypes.js';
import { createServiceError } from './errors.js';

// Re-export for backwards compatibility
export { BUILT_IN_TYPES } from './builtInTypes.js';

// ============================================================================
// Error Types
// ============================================================================

export type ObjectTypeErrorCode =
  | 'TYPE_NOT_FOUND'
  | 'TYPE_KEY_EXISTS'
  | 'TYPE_BUILT_IN'
  | 'TYPE_IN_USE'
  | 'TYPE_INHERITANCE_CYCLE'
  | 'TYPE_INHERITANCE_DEPTH'
  | 'TYPE_HAS_CHILDREN';

export const ObjectTypeError = createServiceError<ObjectTypeErrorCode>('ObjectTypeError');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Intentional type/value namespace sharing
export type ObjectTypeError = InstanceType<typeof ObjectTypeError>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate inheritance constraints for object types.
 * - Parent must exist
 * - Cannot set self as parent (cycle detection)
 * - Max 2 levels of inheritance (parent cannot have its own parent)
 *
 * @param db Database instance
 * @param parentTypeId The proposed parent type ID
 * @param excludeTypeId Optional type ID to exclude from cycle check (the type being updated)
 * @throws ObjectTypeError if validation fails
 */
function validateInheritance(
  db: TypenoteDb,
  parentTypeId: string | null | undefined,
  excludeTypeId?: string
): void {
  // Null/undefined parent is always valid (no inheritance)
  if (parentTypeId === null || parentTypeId === undefined) {
    return;
  }

  // Check for self-reference cycle
  if (excludeTypeId !== undefined && parentTypeId === excludeTypeId) {
    throw new ObjectTypeError('TYPE_INHERITANCE_CYCLE', 'Cannot set type as its own parent', {
      typeId: excludeTypeId,
      parentTypeId,
    });
  }

  // Query parent from DB
  const parent = db
    .select()
    .from(objectTypes)
    .where(eq(objectTypes.id, parentTypeId))
    .limit(1)
    .all()[0];

  if (!parent) {
    throw new ObjectTypeError('TYPE_NOT_FOUND', `Parent type not found: ${parentTypeId}`, {
      parentTypeId,
    });
  }

  // Check max depth (parent cannot have its own parent)
  if (parent.parentTypeId !== null) {
    throw new ObjectTypeError(
      'TYPE_INHERITANCE_DEPTH',
      'Maximum inheritance depth exceeded (2 levels max)',
      { parentTypeId, grandparentTypeId: parent.parentTypeId }
    );
  }
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Convert database row to ObjectType entity.
 */
function rowToObjectType(row: typeof objectTypes.$inferSelect): ObjectType {
  // Cast to access showInCalendar and calendarDateProperty fields
  // (Drizzle type inference may not include these if schema was updated)
  const rawRow = row as typeof row & {
    showInCalendar?: boolean | null;
    calendarDateProperty?: string | null;
  };

  return {
    id: row.id,
    key: row.key,
    name: row.name,
    icon: row.icon,
    schema: row.schema ? (JSON.parse(row.schema) as TypeSchema) : null,
    builtIn: row.builtIn,
    parentTypeId: row.parentTypeId,
    pluralName: row.pluralName,
    color: row.color,
    description: row.description,
    showInCalendar: rawRow.showInCalendar ?? false,
    calendarDateProperty: rawRow.calendarDateProperty ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Create a new object type.
 * @throws ObjectTypeError if key already exists or inheritance validation fails
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

  // Validate inheritance constraints
  validateInheritance(db, input.parentTypeId);

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
      parentTypeId: input.parentTypeId ?? null,
      pluralName: input.pluralName ?? null,
      color: input.color ?? null,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // Handle calendar fields separately using raw SQL
  // (Drizzle type inference may not include these columns added via migration)
  const showInCalendar = input.showInCalendar ?? false;
  const calendarDateProperty = input.calendarDateProperty ?? null;
  db.run(`UPDATE object_types SET show_in_calendar = ?, calendar_date_property = ? WHERE id = ?`, [
    showInCalendar ? 1 : 0,
    calendarDateProperty,
    id,
  ]);

  // Invalidate schema cache
  invalidateSchemaCache();

  return {
    id,
    key: input.key,
    name: input.name,
    icon: input.icon ?? null,
    schema: input.schema ?? null,
    builtIn: false,
    parentTypeId: input.parentTypeId ?? null,
    pluralName: input.pluralName ?? null,
    color: input.color ?? null,
    description: input.description ?? null,
    showInCalendar: input.showInCalendar ?? false,
    calendarDateProperty: input.calendarDateProperty ?? null,
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
 * @throws ObjectTypeError if type not found, is built-in, or inheritance validation fails
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

  // Validate inheritance constraints if parentTypeId is being updated
  if (input.parentTypeId !== undefined) {
    validateInheritance(db, input.parentTypeId, id);
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
  if (input.parentTypeId !== undefined) {
    updates.parentTypeId = input.parentTypeId;
  }
  if (input.pluralName !== undefined) {
    updates.pluralName = input.pluralName;
  }
  if (input.color !== undefined) {
    updates.color = input.color;
  }
  if (input.description !== undefined) {
    updates.description = input.description;
  }

  db.update(objectTypes).set(updates).where(eq(objectTypes.id, id)).run();

  // Handle calendar fields separately using raw SQL
  // (Drizzle type inference may not include these columns)
  if (input.showInCalendar !== undefined) {
    db.run(`UPDATE object_types SET show_in_calendar = ? WHERE id = ?`, [
      input.showInCalendar ? 1 : 0,
      id,
    ]);
  }
  if (input.calendarDateProperty !== undefined) {
    db.run(`UPDATE object_types SET calendar_date_property = ? WHERE id = ?`, [
      input.calendarDateProperty,
      id,
    ]);
  }

  // Return updated object type
  const updated = db.select().from(objectTypes).where(eq(objectTypes.id, id)).limit(1).all()[0];

  if (!updated) {
    // This should never happen since we just updated the row
    throw new ObjectTypeError('TYPE_NOT_FOUND', `Object type not found after update: ${id}`, {
      id,
    });
  }

  // Invalidate schema cache
  invalidateSchemaCache();

  return rowToObjectType(updated);
}

/**
 * Delete an object type.
 * @throws ObjectTypeError if type not found, is built-in, has objects, or has child types
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

  // Check if any child types exist
  const childTypes = db
    .select()
    .from(objectTypes)
    .where(eq(objectTypes.parentTypeId, id))
    .limit(1)
    .all();

  if (childTypes.length > 0) {
    throw new ObjectTypeError('TYPE_HAS_CHILDREN', 'Cannot delete type with child types', {
      id,
      key: existing.key,
    });
  }

  db.delete(objectTypes).where(eq(objectTypes.id, id)).run();

  // Invalidate schema cache
  invalidateSchemaCache();
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
        pluralName: config.pluralName,
        icon: config.icon,
        color: config.color,
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

// ============================================================================
// Schema Resolution
// ============================================================================

/**
 * Resolved type schema with inherited properties.
 */
export interface ResolvedTypeSchema {
  properties: PropertyDefinition[];
  inheritedFrom: string[];
}

/**
 * Module-level cache for resolved schemas.
 * Maps typeId -> ResolvedTypeSchema
 */
let schemaCache: Map<string, ResolvedTypeSchema> | null = null;

/**
 * Invalidate the schema cache.
 * Called when object types are created, updated, or deleted.
 */
export function invalidateSchemaCache(): void {
  schemaCache = null;
}

/**
 * Build the schema cache by loading all types and resolving their schemas.
 */
function buildSchemaCache(db: TypenoteDb): Map<string, ResolvedTypeSchema> {
  const cache = new Map<string, ResolvedTypeSchema>();

  // Get all object types
  const allTypes = db.select().from(objectTypes).all();

  // Create a map for quick lookup by ID
  const typeMap = new Map<string, (typeof allTypes)[number]>();
  for (const t of allTypes) {
    typeMap.set(t.id, t);
  }

  // Resolve schema for each type
  for (const type of allTypes) {
    const ownProperties: PropertyDefinition[] = type.schema
      ? (JSON.parse(type.schema) as TypeSchema).properties
      : [];

    if (type.parentTypeId === null) {
      // No parent, just own properties
      cache.set(type.id, {
        properties: ownProperties,
        inheritedFrom: [],
      });
    } else {
      // Has parent, merge parent properties first
      const parent = typeMap.get(type.parentTypeId);
      if (parent) {
        const parentProperties: PropertyDefinition[] = parent.schema
          ? (JSON.parse(parent.schema) as TypeSchema).properties
          : [];

        cache.set(type.id, {
          properties: [...parentProperties, ...ownProperties],
          inheritedFrom: [parent.key],
        });
      } else {
        // Parent not found (shouldn't happen with FK constraints)
        cache.set(type.id, {
          properties: ownProperties,
          inheritedFrom: [],
        });
      }
    }
  }

  return cache;
}

/**
 * Get the resolved schema for an object type, including inherited properties.
 *
 * @param db Database instance
 * @param typeId The object type ID
 * @returns Resolved schema with merged parent properties
 */
export function getResolvedSchema(db: TypenoteDb, typeId: string): ResolvedTypeSchema {
  // Build cache if not present
  if (schemaCache === null) {
    schemaCache = buildSchemaCache(db);
  }

  // Return cached value or default empty schema
  return schemaCache.get(typeId) ?? { properties: [], inheritedFrom: [] };
}
