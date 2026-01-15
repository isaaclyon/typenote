/**
 * Object API contracts.
 *
 * Objects are the main entities in TypeNote (notes, pages, people, etc.).
 * This module defines the API contracts for object operations.
 */

import { z } from 'zod';

// ============================================================================
// Duplicate Object Operation
// ============================================================================

/**
 * Request to duplicate an object (deep clone with all blocks).
 */
export const DuplicateObjectRequestSchema = z.object({
  objectId: z.string().length(26), // ULID
});

export type DuplicateObjectRequest = z.infer<typeof DuplicateObjectRequestSchema>;

/**
 * Object metadata returned in duplicate response.
 */
const DuplicatedObjectSchema = z.object({
  id: z.string().length(26), // ULID of new object
  typeId: z.string().length(26), // ULID
  title: z.string(),
  properties: z.record(z.unknown()), // JSON properties per type schema
  docVersion: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Response from duplicating an object.
 * Contains the newly created object metadata and count of duplicated blocks.
 */
export const DuplicateObjectResponseSchema = z.object({
  object: DuplicatedObjectSchema,
  blockCount: z.number().int().nonnegative(), // Number of blocks duplicated
});

export type DuplicateObjectResponse = z.infer<typeof DuplicateObjectResponseSchema>;

// ============================================================================
// Update Object Operation
// ============================================================================

/**
 * Request to update an object's metadata (title, properties, type).
 *
 * Supports:
 * - Title update: Change the object's display name
 * - Properties update: Partial merge with existing properties
 * - Type change: Change object type with property migration
 *   - Auto-mapping: Properties with same key name transfer automatically
 *   - Explicit mapping: Use propertyMapping to map { oldKey: newKey }
 *   - Type-compatible: Only compatible types can be mapped (text↔text, date↔datetime)
 *   - Dropped properties: Unmapped properties returned in response
 */
export const UpdateObjectRequestSchema = z.object({
  objectId: z.string().length(26), // ULID

  /** Optional optimistic concurrency check */
  baseDocVersion: z.number().int().nonnegative().optional(),

  /** Partial updates - only provided fields are changed */
  patch: z.object({
    title: z.string().min(1).optional(),
    typeKey: z.string().optional(), // Change object type
    properties: z.record(z.unknown()).optional(), // Partial property updates
  }),

  /**
   * Property mapping for type changes.
   * Maps old property keys to new property keys.
   * Example: { "email": "contact_email" }
   */
  propertyMapping: z.record(z.string()).optional(),
});

export type UpdateObjectRequest = z.infer<typeof UpdateObjectRequestSchema>;

/**
 * Updated object metadata in response.
 */
const UpdatedObjectSchema = z.object({
  id: z.string().length(26), // ULID
  typeId: z.string().length(26), // ULID
  typeKey: z.string(),
  title: z.string(),
  properties: z.record(z.unknown()),
  docVersion: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

/**
 * Response from updating an object.
 * Contains the updated object metadata and list of dropped properties (if type changed).
 */
export const UpdateObjectResponseSchema = z.object({
  object: UpdatedObjectSchema,
  /** Properties that were dropped during type change (informational) */
  droppedProperties: z.array(z.string()).optional(),
});

export type UpdateObjectResponse = z.infer<typeof UpdateObjectResponseSchema>;
