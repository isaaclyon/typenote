import { z } from 'zod';

/**
 * All possible API error codes.
 */
export const ApiErrorCodeSchema = z.enum([
  'NOT_FOUND_OBJECT',
  'NOT_FOUND_BLOCK',
  'NOT_FOUND_TAG',
  'VALIDATION',
  'CONFLICT_VERSION',
  'CONFLICT_ORDERING',
  'CONFLICT_TAG_SLUG',
  'INVARIANT_CYCLE',
  'INVARIANT_CROSS_OBJECT',
  'INVARIANT_PARENT_DELETED',
  'INVARIANT_TAG_IN_USE',
  'IDEMPOTENCY_CONFLICT',
  'INTERNAL',
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

/**
 * Canonical API error shape.
 */
export const ApiErrorSchema = z.object({
  apiVersion: z.literal('v1'),
  code: ApiErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Error Factory Functions
// ─────────────────────────────────────────────────────────────────────────────

export function notFoundObject(objectId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'NOT_FOUND_OBJECT',
    message: `Object not found: ${objectId}`,
    details: { objectId },
  };
}

export function notFoundBlock(blockId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'NOT_FOUND_BLOCK',
    message: `Block not found: ${blockId}`,
    details: { blockId },
  };
}

export function validationError(field: string, reason: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'VALIDATION',
    message: `Validation failed: ${reason}`,
    details: { field, reason },
  };
}

export function versionConflict(expected: number, actual: number): ApiError {
  return {
    apiVersion: 'v1',
    code: 'CONFLICT_VERSION',
    message: `Version conflict: expected ${expected}, got ${actual}`,
    details: { expected, actual },
  };
}

export function cycleError(blockId: string, wouldBeUnder: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INVARIANT_CYCLE',
    message: 'Move would create a cycle in the block tree',
    details: { blockId, wouldBeUnder },
  };
}

export function crossObjectError(blockObjectId: string, parentObjectId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INVARIANT_CROSS_OBJECT',
    message: 'Parent block belongs to a different object',
    details: { blockObjectId, parentObjectId },
  };
}

export function parentDeletedError(parentBlockId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INVARIANT_PARENT_DELETED',
    message: 'Parent block is deleted',
    details: { parentBlockId },
  };
}

export function idempotencyConflict(idempotencyKey: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'IDEMPOTENCY_CONFLICT',
    message: 'Idempotency key already used with different operations',
    details: { idempotencyKey },
  };
}

export function internalError(requestId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INTERNAL',
    message: 'An internal error occurred',
    details: { requestId },
  };
}

export function orderingConflict(orderKey: string, parentBlockId: string | null): ApiError {
  return {
    apiVersion: 'v1',
    code: 'CONFLICT_ORDERING',
    message: 'Order key conflict among siblings',
    details: { orderKey, parentBlockId },
  };
}

export function notFoundTag(tagId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'NOT_FOUND_TAG',
    message: `Tag not found: ${tagId}`,
    details: { tagId },
  };
}

export function tagSlugConflict(slug: string, existingTagId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'CONFLICT_TAG_SLUG',
    message: `Tag with slug '${slug}' already exists`,
    details: { slug, existingTagId },
  };
}

export function tagInUse(tagId: string, usageCount: number): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INVARIANT_TAG_IN_USE',
    message: `Cannot delete tag: assigned to ${usageCount} objects`,
    details: { tagId, usageCount },
  };
}
