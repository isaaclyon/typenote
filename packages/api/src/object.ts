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
