/**
 * Tag API contracts.
 *
 * Tags are global entities that can be assigned to any object.
 * They provide rich metadata (color, icon, description) and are
 * independent of object type schemas.
 */

import { z } from 'zod';

// ============================================================================
// Tag Field Schemas
// ============================================================================

/**
 * Color value for tags.
 * Supports hex codes (#RRGGBB) and CSS color names.
 */
export const TagColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$|^[a-z]+$/, {
    message: 'Color must be hex code (#RRGGBB) or CSS color name',
  })
  .nullable();

export type TagColor = z.infer<typeof TagColorSchema>;

/**
 * Icon identifier for tags.
 * Expected to be emoji or icon library reference (e.g., lucide:tag).
 */
export const TagIconSchema = z.string().max(64).nullable();

export type TagIcon = z.infer<typeof TagIconSchema>;

/**
 * Slug format for tags.
 * Must be lowercase alphanumeric with hyphens only.
 */
export const TagSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  });

export type TagSlug = z.infer<typeof TagSlugSchema>;

// ============================================================================
// Tag Entity
// ============================================================================

/**
 * Full Tag entity as stored in the database.
 */
export const TagSchema = z.object({
  id: z.string().length(26), // ULID
  name: z.string().min(1).max(64), // Display name
  slug: TagSlugSchema, // URL-safe unique identifier
  color: TagColorSchema,
  icon: TagIconSchema,
  description: z.string().max(512).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Tag = z.infer<typeof TagSchema>;

/**
 * Tag with optional usage count.
 */
export const TagWithUsageSchema = TagSchema.extend({
  usageCount: z.number().int().nonnegative(),
});

export type TagWithUsage = z.infer<typeof TagWithUsageSchema>;

// ============================================================================
// API Operations - Tag CRUD
// ============================================================================

/**
 * Input for creating a new tag.
 */
export const CreateTagInputSchema = z.object({
  name: z.string().min(1).max(64),
  slug: TagSlugSchema,
  color: TagColorSchema.optional(),
  icon: TagIconSchema.optional(),
  description: z.string().max(512).optional(),
});

export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;

/**
 * Input for updating an existing tag.
 */
export const UpdateTagInputSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  slug: TagSlugSchema.optional(),
  color: TagColorSchema.optional(),
  icon: TagIconSchema.optional(),
  description: z.string().max(512).nullable().optional(),
});

export type UpdateTagInput = z.infer<typeof UpdateTagInputSchema>;

/**
 * Options for listing tags.
 */
export const ListTagsOptionsSchema = z.object({
  /** Filter by object ID (returns tags assigned to this object) */
  objectId: z.string().length(26).optional(),
  /** Include usage count (number of objects with this tag) */
  includeUsageCount: z.boolean().optional(),
  /** Sort order */
  sortBy: z.enum(['name', 'createdAt', 'usageCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type ListTagsOptions = z.infer<typeof ListTagsOptionsSchema>;

// ============================================================================
// Tag Assignment Operations
// ============================================================================

/**
 * Assign tags to an object.
 * Idempotent: assigning an already-assigned tag is a no-op.
 */
export const AssignTagsInputSchema = z.object({
  objectId: z.string().length(26),
  tagIds: z.array(z.string().length(26)).min(1),
});

export type AssignTagsInput = z.infer<typeof AssignTagsInputSchema>;

/**
 * Remove tags from an object.
 * Idempotent: removing an unassigned tag is a no-op.
 */
export const RemoveTagsInputSchema = z.object({
  objectId: z.string().length(26),
  tagIds: z.array(z.string().length(26)).min(1),
});

export type RemoveTagsInput = z.infer<typeof RemoveTagsInputSchema>;

// ============================================================================
// Query Results
// ============================================================================

/**
 * Result for tag assignment operation.
 */
export const AssignTagsResultSchema = z.object({
  objectId: z.string(),
  assignedTagIds: z.array(z.string()), // Successfully assigned
  skippedTagIds: z.array(z.string()), // Already assigned (no-op)
});

export type AssignTagsResult = z.infer<typeof AssignTagsResultSchema>;

/**
 * Result for tag removal operation.
 */
export const RemoveTagsResultSchema = z.object({
  objectId: z.string(),
  removedTagIds: z.array(z.string()), // Successfully removed
  skippedTagIds: z.array(z.string()), // Not assigned (no-op)
});

export type RemoveTagsResult = z.infer<typeof RemoveTagsResultSchema>;

// ============================================================================
// Error Codes (specific to Tag operations)
// ============================================================================

/**
 * Tag-specific error codes.
 */
export const TagErrorCodeSchema = z.enum([
  'TAG_NOT_FOUND', // Tag does not exist
  'TAG_SLUG_EXISTS', // Tag with this slug already exists
  'TAG_IN_USE', // Cannot delete tag that is assigned to objects
]);

export type TagErrorCode = z.infer<typeof TagErrorCodeSchema>;
