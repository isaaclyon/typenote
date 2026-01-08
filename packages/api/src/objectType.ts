/**
 * ObjectType API contracts.
 *
 * Object types define the schema for objects in the system.
 * Built-in types (DailyNote, Page, Person, Event, Place) are seeded
 * on database creation and cannot be deleted.
 */

import { z } from 'zod';

// ============================================================================
// Built-in Type Keys
// ============================================================================

/**
 * Keys for built-in object types that ship with TypeNote.
 * These types are seeded automatically and cannot be deleted.
 */
export const BuiltInTypeKeySchema = z.enum([
  'DailyNote',
  'Page',
  'Person',
  'Event',
  'Place',
  'Task',
]);

export type BuiltInTypeKey = z.infer<typeof BuiltInTypeKeySchema>;

/**
 * All built-in type keys as an array for iteration.
 */
export const BUILT_IN_TYPE_KEYS: readonly BuiltInTypeKey[] = BuiltInTypeKeySchema.options;

// ============================================================================
// Property Schema Definition
// ============================================================================

/**
 * Property types supported in object type schemas.
 */
export const PropertyTypeSchema = z.enum([
  'text', // Single-line text
  'richtext', // Multi-line rich text
  'number', // Numeric value
  'boolean', // True/false
  'date', // Date without time
  'datetime', // Date with time
  'select', // Single selection from options
  'multiselect', // Multiple selections from options
  'ref', // Reference to another object
  'refs', // Multiple references to objects
]);

export type PropertyType = z.infer<typeof PropertyTypeSchema>;

/**
 * Individual property definition within a type schema.
 */
export const PropertyDefinitionSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/, {
      message:
        'Property key must be lowercase, start with a letter, and contain only letters, numbers, and underscores',
    }),
  name: z.string().min(1).max(128), // Display name
  type: PropertyTypeSchema,
  required: z.boolean().default(false),
  /** For select/multiselect: available options */
  options: z.array(z.string()).optional(),
  /** For ref/refs: restrict to specific object type keys */
  refTypeKeys: z.array(z.string()).optional(),
  /** Default value (must match type) */
  defaultValue: z.unknown().optional(),
});

export type PropertyDefinition = z.infer<typeof PropertyDefinitionSchema>;

/**
 * Complete type schema defining the properties of an object type.
 */
export const TypeSchemaSchema = z.object({
  properties: z.array(PropertyDefinitionSchema),
});

export type TypeSchema = z.infer<typeof TypeSchemaSchema>;

// ============================================================================
// ObjectType Entity
// ============================================================================

/**
 * Hex color format validation (e.g., #3B82F6).
 */
const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'Color must be a valid 6-digit hex color (e.g., #3B82F6)',
});

/**
 * Full ObjectType entity as stored in the database.
 */
export const ObjectTypeSchema = z.object({
  id: z.string().length(26), // ULID
  key: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  icon: z.string().max(64).nullable(),
  schema: TypeSchemaSchema.nullable(),
  builtIn: z.boolean(),
  /** Parent type ID for inheritance (null if no parent) */
  parentTypeId: z.string().length(26).nullable(),
  /** Plural display name (e.g., "Books" for "Book") */
  pluralName: z.string().max(128).nullable(),
  /** UI color for the type (hex format) */
  color: HexColorSchema.nullable(),
  /** Description of the type */
  description: z.string().max(1024).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ObjectType = z.infer<typeof ObjectTypeSchema>;

// ============================================================================
// API Operations
// ============================================================================

/**
 * Input for creating a new object type.
 */
export const CreateObjectTypeInputSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[A-Z][a-zA-Z0-9]*$/, {
      message: 'Type key must be PascalCase (start with uppercase letter)',
    }),
  name: z.string().min(1).max(128),
  icon: z.string().max(64).optional(),
  schema: TypeSchemaSchema.optional(),
  /** Parent type ID for inheritance */
  parentTypeId: z.string().length(26).optional(),
  /** Plural display name (e.g., "Books" for "Book") */
  pluralName: z.string().max(128).optional(),
  /** UI color for the type (hex format) */
  color: HexColorSchema.optional(),
  /** Description of the type */
  description: z.string().max(1024).optional(),
});

export type CreateObjectTypeInput = z.infer<typeof CreateObjectTypeInputSchema>;

/**
 * Input for updating an existing object type.
 * Key cannot be changed after creation.
 */
export const UpdateObjectTypeInputSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  icon: z.string().max(64).nullable().optional(),
  schema: TypeSchemaSchema.nullable().optional(),
  /** Parent type ID for inheritance (null to remove parent) */
  parentTypeId: z.string().length(26).nullable().optional(),
  /** Plural display name (null to remove) */
  pluralName: z.string().max(128).nullable().optional(),
  /** UI color for the type (null to remove) */
  color: HexColorSchema.nullable().optional(),
  /** Description of the type (null to remove) */
  description: z.string().max(1024).nullable().optional(),
});

export type UpdateObjectTypeInput = z.infer<typeof UpdateObjectTypeInputSchema>;

/**
 * Options for listing object types.
 */
export const ListObjectTypesOptionsSchema = z.object({
  /** Include only built-in types */
  builtInOnly: z.boolean().optional(),
  /** Include only custom (non-built-in) types */
  customOnly: z.boolean().optional(),
});

export type ListObjectTypesOptions = z.infer<typeof ListObjectTypesOptionsSchema>;

// ============================================================================
// Error Codes (specific to ObjectType operations)
// ============================================================================

/**
 * ObjectType-specific error codes.
 */
export const ObjectTypeErrorCodeSchema = z.enum([
  'TYPE_NOT_FOUND', // Object type does not exist
  'TYPE_KEY_EXISTS', // Type with this key already exists
  'TYPE_BUILT_IN', // Cannot modify/delete built-in type
  'TYPE_IN_USE', // Cannot delete type with existing objects
  'TYPE_INHERITANCE_CYCLE', // Would create a cycle in type hierarchy
  'TYPE_INHERITANCE_DEPTH', // Exceeds max inheritance depth (2 levels)
  'TYPE_HAS_CHILDREN', // Cannot delete type that has child types
]);

export type ObjectTypeErrorCode = z.infer<typeof ObjectTypeErrorCodeSchema>;
