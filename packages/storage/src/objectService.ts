import { desc, eq, isNull } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type { ObjectSummary } from '@typenote/api';
import { objects, objectTypes } from './schema.js';
import type { TypenoteDb } from './db.js';
import { getObjectTypeByKey } from './objectTypeService.js';
import { validateProperties, mergeWithDefaults } from './propertyValidation.js';
import { getDefaultTemplateForType } from './templateService.js';
import { applyTemplateToObject } from './applyTemplateToObject.js';

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
}

// ============================================================================
// Error Types
// ============================================================================

export class CreateObjectError extends Error {
  constructor(
    public readonly code: 'TYPE_NOT_FOUND' | 'VALIDATION_FAILED',
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CreateObjectError';
  }
}

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

  return {
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: row.typeKey ?? 'Unknown',
    properties: parsedProperties,
    docVersion: row.docVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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
