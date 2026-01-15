import { desc, eq, isNull } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type { ObjectSummary, Tag } from '@typenote/api';
import { objects, objectTypes } from './schema.js';
import type { TypenoteDb } from './db.js';
import { getObjectTypeByKey } from './objectTypeService.js';
import { validateProperties, mergeWithDefaults } from './propertyValidation.js';
import { getDefaultTemplateForType } from './templateService.js';
import { applyTemplateToObject } from './applyTemplateToObject.js';
import { getObjectTags } from './tagService.js';
import { createServiceError } from './errors.js';

// Re-export from API for convenience
export type { ObjectSummary };

export interface ObjectDetails {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  properties: Record<string, unknown>;
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
  /** Tags assigned to this object (derived from object_tags junction table) */
  tags: Tag[];
}

// ============================================================================
// Error Types
// ============================================================================

export type CreateObjectErrorCode = 'TYPE_NOT_FOUND' | 'VALIDATION_FAILED';

export const CreateObjectError = createServiceError<CreateObjectErrorCode>('CreateObjectError');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Intentional type/value namespace sharing
export type CreateObjectError = InstanceType<typeof CreateObjectError>;

// ============================================================================
// Result Types
// ============================================================================

export interface CreatedObject {
  id: string;
  typeId: string;
  typeKey: string;
  title: string;
  properties: Record<string, unknown>;
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Service Functions
// ============================================================================

export function listObjects(db: TypenoteDb): ObjectSummary[] {
  const rows = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      typeKey: objectTypes.key,
      updatedAt: objects.updatedAt,
    })
    .from(objects)
    .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(isNull(objects.deletedAt))
    .orderBy(desc(objects.updatedAt))
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: row.typeKey ?? 'Unknown',
    updatedAt: row.updatedAt,
  }));
}

/**
 * Get a single object by ID with its type information.
 *
 * @param db - Database connection
 * @param objectId - The object ID to look up
 * @returns The object details or null if not found
 */
export function getObject(db: TypenoteDb, objectId: string): ObjectDetails | null {
  const row = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      typeKey: objectTypes.key,
      properties: objects.properties,
      docVersion: objects.docVersion,
      createdAt: objects.createdAt,
      updatedAt: objects.updatedAt,
    })
    .from(objects)
    .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(eq(objects.id, objectId))
    .get();

  if (!row) {
    return null;
  }

  // Parse properties from JSON string
  let parsedProperties: Record<string, unknown> = {};
  if (row.properties) {
    try {
      parsedProperties = JSON.parse(row.properties) as Record<string, unknown>;
    } catch {
      // If parsing fails, use empty object
    }
  }

  // Fetch tags for this object
  const tags = getObjectTags(db, row.id);

  return {
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: row.typeKey ?? 'Unknown',
    properties: parsedProperties,
    docVersion: row.docVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    tags,
  };
}

/**
 * Options for createObject.
 */
export interface CreateObjectOptions {
  /**
   * Whether to auto-apply the default template for this object type.
   * Default: true
   */
  applyDefaultTemplate?: boolean;
}

/**
 * Create a new object of the given type.
 *
 * @param db - Database connection
 * @param typeKey - The type key (e.g., 'Page', 'Person', or custom type)
 * @param title - The object title
 * @param properties - Optional properties (validated against type schema)
 * @param options - Optional creation options
 * @returns The created object
 * @throws CreateObjectError if type not found or validation fails
 */
export function createObject(
  db: TypenoteDb,
  typeKey: string,
  title: string,
  properties?: Record<string, unknown>,
  options?: CreateObjectOptions
): CreatedObject {
  const { applyDefaultTemplate = true } = options ?? {};

  // 1. Look up the object type by key
  const objectType = getObjectTypeByKey(db, typeKey);
  if (!objectType) {
    throw new CreateObjectError('TYPE_NOT_FOUND', `Object type not found: ${typeKey}`, {
      typeKey,
    });
  }

  // 2. Merge with defaults
  const mergedProperties = mergeWithDefaults(properties, objectType.schema);

  // 3. Validate properties against schema
  const validationResult = validateProperties(mergedProperties, objectType.schema);
  if (!validationResult.valid) {
    throw new CreateObjectError(
      'VALIDATION_FAILED',
      `Property validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
      { errors: validationResult.errors }
    );
  }

  // 4. Insert into objects table
  const id = generateId();
  const now = new Date();

  db.insert(objects)
    .values({
      id,
      typeId: objectType.id,
      title,
      properties: JSON.stringify(mergedProperties),
      docVersion: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // 5. Apply default template if enabled and one exists
  let finalDocVersion = 0;

  if (applyDefaultTemplate) {
    const defaultTemplate = getDefaultTemplateForType(db, objectType.id);
    if (defaultTemplate) {
      // Build context for placeholder substitution
      const dateKey =
        typeof mergedProperties['date_key'] === 'string' ? mergedProperties['date_key'] : undefined;

      const templateResult = applyTemplateToObject(db, id, defaultTemplate, {
        title,
        createdDate: now,
        dateKey,
      });

      if (templateResult.success) {
        finalDocVersion = templateResult.result.newDocVersion;
      }
      // If template application fails, we still have a valid object (just empty)
    }
  }

  // 6. Return the created object
  return {
    id,
    typeId: objectType.id,
    typeKey: objectType.key,
    title,
    properties: mergedProperties,
    docVersion: finalDocVersion,
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================================================
// Update Object
// ============================================================================

export type UpdateObjectErrorCode =
  | 'NOT_FOUND'
  | 'TYPE_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'CONFLICT_VERSION'
  | 'PROPERTY_TYPE_MISMATCH';

export const UpdateObjectError = createServiceError<UpdateObjectErrorCode>('UpdateObjectError');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Intentional type/value namespace sharing
export type UpdateObjectError = InstanceType<typeof UpdateObjectError>;

export interface UpdateObjectOptions {
  objectId: string;
  baseDocVersion?: number | undefined;
  patch: {
    title?: string | undefined;
    typeKey?: string | undefined;
    properties?: Record<string, unknown> | undefined;
  };
  propertyMapping?: Record<string, string> | undefined;
}

export interface UpdateObjectResult {
  id: string;
  typeId: string;
  typeKey: string;
  title: string;
  properties: Record<string, unknown>;
  docVersion: number;
  updatedAt: Date;
  droppedProperties?: string[];
}

/**
 * Check if two property types are compatible for migration.
 * Compatible means the value can be transferred without loss.
 */
function areTypesCompatible(sourceType: string, targetType: string): boolean {
  if (sourceType === targetType) return true;

  // text and richtext are compatible
  if (
    (sourceType === 'text' && targetType === 'richtext') ||
    (sourceType === 'richtext' && targetType === 'text')
  ) {
    return true;
  }

  // date and datetime are compatible
  if (
    (sourceType === 'date' && targetType === 'datetime') ||
    (sourceType === 'datetime' && targetType === 'date')
  ) {
    return true;
  }

  return false;
}

/**
 * Migrate properties from old type to new type.
 *
 * @param oldProperties - Existing property values
 * @param oldSchema - Old type's property definitions (keyed by property key)
 * @param newSchema - New type's property definitions
 * @param propertyMapping - Explicit mapping from old keys to new keys
 * @returns Migrated properties and list of dropped property keys
 */
function migrateProperties(
  oldProperties: Record<string, unknown>,
  oldSchema: Map<string, { type: string }>,
  newSchema: Map<string, { type: string }>,
  propertyMapping?: Record<string, string>
): { properties: Record<string, unknown>; droppedProperties: string[]; typeMismatch?: string } {
  const newProperties: Record<string, unknown> = {};
  const usedOldKeys = new Set<string>();

  // For each property in new schema, try to find a source value
  for (const [newKey, newDef] of newSchema) {
    let sourceKey: string | undefined;
    let sourceValue: unknown;

    // Check explicit mapping first
    if (propertyMapping) {
      const mappedOldKey = Object.entries(propertyMapping).find(([, v]) => v === newKey)?.[0];
      if (mappedOldKey && mappedOldKey in oldProperties) {
        sourceKey = mappedOldKey;
        sourceValue = oldProperties[mappedOldKey];
      }
    }

    // Then check auto-mapping (same key name)
    if (sourceKey === undefined && newKey in oldProperties) {
      sourceKey = newKey;
      sourceValue = oldProperties[newKey];
    }

    // If we found a source, check type compatibility
    if (sourceKey !== undefined && sourceValue !== undefined) {
      const sourceDef = oldSchema.get(sourceKey);
      if (sourceDef) {
        if (!areTypesCompatible(sourceDef.type, newDef.type)) {
          return {
            properties: {},
            droppedProperties: [],
            typeMismatch: `Cannot map '${sourceKey}' (${sourceDef.type}) to '${newKey}' (${newDef.type})`,
          };
        }
        newProperties[newKey] = sourceValue;
        usedOldKeys.add(sourceKey);
      }
    }
  }

  // Find dropped properties (old properties not used)
  const droppedProperties = Object.keys(oldProperties).filter((key) => !usedOldKeys.has(key));

  return { properties: newProperties, droppedProperties };
}

/**
 * Update an existing object's metadata (title, properties, type).
 *
 * @param db - Database connection
 * @param options - Update options including objectId, patch, and optional mapping
 * @returns The updated object
 * @throws UpdateObjectError if object not found or validation fails
 */
export function updateObject(db: TypenoteDb, options: UpdateObjectOptions): UpdateObjectResult {
  const { objectId, baseDocVersion, patch, propertyMapping } = options;

  // 1. Fetch existing object
  const existing = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      properties: objects.properties,
      docVersion: objects.docVersion,
      deletedAt: objects.deletedAt,
    })
    .from(objects)
    .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(eq(objects.id, objectId))
    .get();

  if (!existing || existing.deletedAt !== null) {
    throw new UpdateObjectError('NOT_FOUND', `Object not found: ${objectId}`, { objectId });
  }

  // 2. Check version conflict (optimistic concurrency)
  if (baseDocVersion !== undefined && baseDocVersion !== existing.docVersion) {
    throw new UpdateObjectError(
      'CONFLICT_VERSION',
      `Version conflict: expected ${baseDocVersion}, got ${existing.docVersion}`,
      { expected: baseDocVersion, actual: existing.docVersion }
    );
  }

  // 3. Parse existing properties
  let existingProperties: Record<string, unknown> = {};
  if (existing.properties) {
    try {
      existingProperties = JSON.parse(existing.properties) as Record<string, unknown>;
    } catch {
      // If parsing fails, use empty object
    }
  }

  // 4. Get current type info
  const currentTypeRow = db
    .select({ id: objectTypes.id, key: objectTypes.key, schema: objectTypes.schema })
    .from(objectTypes)
    .where(eq(objectTypes.id, existing.typeId))
    .get();

  let finalTypeId = existing.typeId;
  let finalTypeKey = currentTypeRow?.key ?? 'Unknown';
  let finalProperties = existingProperties;
  let droppedProperties: string[] | undefined;

  // 5. Handle type change if requested
  if (patch.typeKey !== undefined) {
    const newType = getObjectTypeByKey(db, patch.typeKey);
    if (!newType) {
      throw new UpdateObjectError('TYPE_NOT_FOUND', `Object type not found: ${patch.typeKey}`, {
        typeKey: patch.typeKey,
      });
    }

    // Build schema maps for old and new types
    const oldSchemaMap = new Map<string, { type: string }>();
    if (currentTypeRow?.schema) {
      try {
        const parsed = JSON.parse(currentTypeRow.schema) as {
          properties?: Array<{ key: string; type: string }>;
        };
        for (const prop of parsed.properties ?? []) {
          oldSchemaMap.set(prop.key, { type: prop.type });
        }
      } catch {
        // Invalid schema, use empty
      }
    }

    const newSchemaMap = new Map<string, { type: string }>();
    if (newType.schema?.properties) {
      for (const prop of newType.schema.properties) {
        newSchemaMap.set(prop.key, { type: prop.type });
      }
    }

    // Migrate properties
    const migration = migrateProperties(
      existingProperties,
      oldSchemaMap,
      newSchemaMap,
      propertyMapping
    );

    if (migration.typeMismatch) {
      throw new UpdateObjectError('PROPERTY_TYPE_MISMATCH', migration.typeMismatch, {
        mapping: propertyMapping,
      });
    }

    finalTypeId = newType.id;
    finalTypeKey = newType.key;
    finalProperties = migration.properties;
    droppedProperties =
      migration.droppedProperties.length > 0 ? migration.droppedProperties : undefined;

    // Apply any additional property updates from patch (allows type change + property update in one call)
    if (patch.properties !== undefined) {
      finalProperties = { ...finalProperties, ...patch.properties };
    }

    // Merge with new type's defaults and validate
    const mergedProperties = mergeWithDefaults(finalProperties, newType.schema);
    const validationResult = validateProperties(mergedProperties, newType.schema);
    if (!validationResult.valid) {
      throw new UpdateObjectError(
        'VALIDATION_FAILED',
        `Property validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
        { errors: validationResult.errors }
      );
    }
    finalProperties = mergedProperties;
  }

  // 6. Merge property updates (if not changing type)
  if (patch.typeKey === undefined && patch.properties !== undefined) {
    finalProperties = { ...existingProperties, ...patch.properties };
  }

  // 7. Apply updates
  const newTitle = patch.title ?? existing.title;
  const newDocVersion = existing.docVersion + 1;
  const now = new Date();

  // 8. Update database
  db.update(objects)
    .set({
      title: newTitle,
      typeId: finalTypeId,
      properties: JSON.stringify(finalProperties),
      docVersion: newDocVersion,
      updatedAt: now,
    })
    .where(eq(objects.id, objectId))
    .run();

  const result: UpdateObjectResult = {
    id: existing.id,
    typeId: finalTypeId,
    typeKey: finalTypeKey,
    title: newTitle,
    properties: finalProperties,
    docVersion: newDocVersion,
    updatedAt: now,
  };

  if (droppedProperties !== undefined) {
    result.droppedProperties = droppedProperties;
  }

  return result;
}
