/**
 * Pinning API contracts.
 *
 * Pinning (favorites) allows users to mark important objects for quick access.
 * Pinned objects appear at the top of lists with user-defined ordering.
 */

import { z } from 'zod';

// ============================================================================
// Pinned Object Summary
// ============================================================================

/**
 * Summary of a pinned object for display in pinned lists.
 * Includes essential object metadata plus pinning-specific fields.
 */
export const PinnedObjectSummarySchema = z.object({
  id: z.string().length(26), // ULID
  title: z.string(),
  typeId: z.string().length(26),
  typeKey: z.string(),
  updatedAt: z.date(),
  pinnedAt: z.date(),
  order: z.number().int().nonnegative(),
});

export type PinnedObjectSummary = z.infer<typeof PinnedObjectSummarySchema>;

// ============================================================================
// API Operations - Pinning
// ============================================================================

/**
 * Input for pinning an object.
 * Idempotent: pinning an already-pinned object is a no-op.
 */
export const PinObjectInputSchema = z.object({
  objectId: z.string().length(26),
});

export type PinObjectInput = z.infer<typeof PinObjectInputSchema>;

/**
 * Input for unpinning an object.
 * Idempotent: unpinning an already-unpinned object is a no-op.
 */
export const UnpinObjectInputSchema = z.object({
  objectId: z.string().length(26),
});

export type UnpinObjectInput = z.infer<typeof UnpinObjectInputSchema>;

/**
 * Input for reordering pinned objects.
 * Provides new order values for all affected objects.
 */
export const ReorderPinnedObjectsInputSchema = z.object({
  objectIds: z.array(z.string().length(26)).min(1),
});

export type ReorderPinnedObjectsInput = z.infer<typeof ReorderPinnedObjectsInputSchema>;

// ============================================================================
// Query Results
// ============================================================================

/**
 * Result for pin operation.
 */
export const PinObjectResultSchema = z.object({
  objectId: z.string(),
  pinned: z.boolean(), // true if newly pinned, false if already pinned
  pinnedAt: z.date(),
  order: z.number().int().nonnegative(),
});

export type PinObjectResult = z.infer<typeof PinObjectResultSchema>;

/**
 * Result for unpin operation.
 */
export const UnpinObjectResultSchema = z.object({
  objectId: z.string(),
  unpinned: z.boolean(), // true if newly unpinned, false if already unpinned
});

export type UnpinObjectResult = z.infer<typeof UnpinObjectResultSchema>;

/**
 * Result for reorder operation.
 */
export const ReorderPinnedObjectsResultSchema = z.object({
  updatedObjectIds: z.array(z.string()), // Objects with updated order
});

export type ReorderPinnedObjectsResult = z.infer<typeof ReorderPinnedObjectsResultSchema>;

// ============================================================================
// Error Codes (specific to Pinning operations)
// ============================================================================

/**
 * Pinning-specific error codes.
 */
export const PinningErrorCodeSchema = z.enum([
  'PINNING_NOT_FOUND', // Object is not pinned
  'PINNING_ALREADY_PINNED', // Object is already pinned (if strict mode)
]);

export type PinningErrorCode = z.infer<typeof PinningErrorCodeSchema>;
