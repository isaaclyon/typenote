/**
 * Tag Service.
 *
 * Provides CRUD operations for global tags and tag-object assignments.
 */

import { eq, sql, and, asc, desc } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type {
  Tag,
  TagWithUsage,
  CreateTagInput,
  UpdateTagInput,
  ListTagsOptions,
  AssignTagsInput,
  AssignTagsResult,
  RemoveTagsInput,
  RemoveTagsResult,
} from '@typenote/api';
import { tags, objectTags, objects } from './schema.js';
import type { TypenoteDb } from './db.js';
import { createServiceError } from './errors.js';

// ============================================================================
// Error Types
// ============================================================================

export type TagServiceErrorCode =
  | 'TAG_NOT_FOUND'
  | 'TAG_SLUG_EXISTS'
  | 'TAG_IN_USE'
  | 'NOT_FOUND_OBJECT'
  | 'NOT_FOUND_TAG';

export const TagServiceError = createServiceError<TagServiceErrorCode>('TagServiceError');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Intentional type/value namespace sharing
export type TagServiceError = InstanceType<typeof TagServiceError>;

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Create a new tag.
 *
 * @throws TagServiceError with code TAG_SLUG_EXISTS if slug already taken
 */
export function createTag(db: TypenoteDb, input: CreateTagInput): Tag {
  // Check if slug already exists
  const existing = getTagBySlug(db, input.slug);
  if (existing) {
    throw new TagServiceError('TAG_SLUG_EXISTS', `Tag with slug '${input.slug}' already exists`, {
      slug: input.slug,
      existingTagId: existing.id,
    });
  }

  const id = generateId();
  const now = new Date();

  db.insert(tags)
    .values({
      id,
      name: input.name,
      slug: input.slug,
      color: input.color ?? null,
      icon: input.icon ?? null,
      description: input.description ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // Read back from DB to ensure consistent timestamp precision
  const created = getTag(db, id);
  if (!created) {
    throw new TagServiceError('TAG_NOT_FOUND', `Tag not found after create: ${id}`, { id });
  }
  return created;
}

/**
 * Get a tag by its ID.
 *
 * @returns The tag or null if not found
 */
export function getTag(db: TypenoteDb, tagId: string): Tag | null {
  const row = db.select().from(tags).where(eq(tags.id, tagId)).get();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    icon: row.icon,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Get a tag by its slug.
 *
 * @returns The tag or null if not found
 */
export function getTagBySlug(db: TypenoteDb, slug: string): Tag | null {
  const row = db.select().from(tags).where(eq(tags.slug, slug)).get();

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    icon: row.icon,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Update a tag.
 *
 * @throws TagServiceError with code TAG_NOT_FOUND if tag doesn't exist
 * @throws TagServiceError with code TAG_SLUG_EXISTS if new slug already taken
 */
export function updateTag(db: TypenoteDb, tagId: string, input: UpdateTagInput): Tag {
  // Check tag exists
  const existing = getTag(db, tagId);
  if (!existing) {
    throw new TagServiceError('TAG_NOT_FOUND', `Tag not found: ${tagId}`, { tagId });
  }

  // If changing slug, check uniqueness
  if (input.slug !== undefined && input.slug !== existing.slug) {
    const conflicting = getTagBySlug(db, input.slug);
    if (conflicting) {
      throw new TagServiceError('TAG_SLUG_EXISTS', `Tag with slug '${input.slug}' already exists`, {
        slug: input.slug,
        existingTagId: conflicting.id,
      });
    }
  }

  const now = new Date();

  // Build update object, only including defined fields
  const updates: Record<string, unknown> = { updatedAt: now };

  if (input.name !== undefined) updates['name'] = input.name;
  if (input.slug !== undefined) updates['slug'] = input.slug;
  if (input.color !== undefined) updates['color'] = input.color;
  if (input.icon !== undefined) updates['icon'] = input.icon;
  if (input.description !== undefined) updates['description'] = input.description;

  db.update(tags).set(updates).where(eq(tags.id, tagId)).run();

  // Return updated tag - we know it exists because we just updated it
  const updated = getTag(db, tagId);
  if (!updated) {
    throw new TagServiceError('TAG_NOT_FOUND', `Tag not found after update: ${tagId}`, { tagId });
  }
  return updated;
}

/**
 * Delete a tag.
 *
 * @throws TagServiceError with code TAG_NOT_FOUND if tag doesn't exist
 * @throws TagServiceError with code TAG_IN_USE if tag is assigned to objects
 */
export function deleteTag(db: TypenoteDb, tagId: string): void {
  // Check tag exists
  const existing = getTag(db, tagId);
  if (!existing) {
    throw new TagServiceError('TAG_NOT_FOUND', `Tag not found: ${tagId}`, { tagId });
  }

  // Check if tag is in use
  const usageCount = db
    .select({ count: sql<number>`count(*)` })
    .from(objectTags)
    .where(eq(objectTags.tagId, tagId))
    .get();

  if (usageCount && usageCount.count > 0) {
    throw new TagServiceError(
      'TAG_IN_USE',
      `Cannot delete tag: assigned to ${usageCount.count} objects`,
      {
        tagId,
        usageCount: usageCount.count,
      }
    );
  }

  db.delete(tags).where(eq(tags.id, tagId)).run();
}

// ============================================================================
// List Operations
// ============================================================================

/**
 * List all tags with optional filtering and sorting.
 *
 * When `includeUsageCount` is true, returns TagWithUsage[] with usageCount field.
 * Otherwise returns Tag[] (callers should use type assertion if they need usageCount).
 */
export function listTags(db: TypenoteDb, options?: ListTagsOptions): TagWithUsage[] {
  const { includeUsageCount = false, sortBy = 'name', sortOrder = 'asc' } = options ?? {};

  if (includeUsageCount) {
    // Join with object_tags to get usage count
    const rows = db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        color: tags.color,
        icon: tags.icon,
        description: tags.description,
        createdAt: tags.createdAt,
        updatedAt: tags.updatedAt,
        usageCount: sql<number>`count(${objectTags.objectId})`.as('usage_count'),
      })
      .from(tags)
      .leftJoin(objectTags, eq(tags.id, objectTags.tagId))
      .groupBy(tags.id)
      .orderBy(
        sortBy === 'usageCount'
          ? sortOrder === 'desc'
            ? desc(sql`usage_count`)
            : asc(sql`usage_count`)
          : sortBy === 'createdAt'
            ? sortOrder === 'desc'
              ? desc(tags.createdAt)
              : asc(tags.createdAt)
            : sortOrder === 'desc'
              ? desc(tags.name)
              : asc(tags.name)
      )
      .all();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      color: row.color,
      icon: row.icon,
      description: row.description,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      usageCount: row.usageCount,
    }));
  }

  // Simple query without usage count
  const rows = db
    .select()
    .from(tags)
    .orderBy(
      sortBy === 'createdAt'
        ? sortOrder === 'desc'
          ? desc(tags.createdAt)
          : asc(tags.createdAt)
        : sortOrder === 'desc'
          ? desc(tags.name)
          : asc(tags.name)
    )
    .all();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    color: row.color,
    icon: row.icon,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    usageCount: 0, // Not computed when includeUsageCount is false
  }));
}

// ============================================================================
// Assignment Operations
// ============================================================================

/**
 * Assign tags to an object.
 *
 * Idempotent: assigning an already-assigned tag is a no-op.
 *
 * @throws TagServiceError with code NOT_FOUND_OBJECT if object doesn't exist
 * @throws TagServiceError with code NOT_FOUND_TAG if any tag doesn't exist
 */
export function assignTags(db: TypenoteDb, input: AssignTagsInput): AssignTagsResult {
  const { objectId, tagIds } = input;

  // Verify object exists
  const obj = db.select().from(objects).where(eq(objects.id, objectId)).get();
  if (!obj) {
    throw new TagServiceError('NOT_FOUND_OBJECT', `Object not found: ${objectId}`, { objectId });
  }

  // Verify all tags exist
  for (const tagId of tagIds) {
    const tag = getTag(db, tagId);
    if (!tag) {
      throw new TagServiceError('NOT_FOUND_TAG', `Tag not found: ${tagId}`, { tagId });
    }
  }

  // Get currently assigned tag IDs for this object
  const currentAssignments = db
    .select({ tagId: objectTags.tagId })
    .from(objectTags)
    .where(eq(objectTags.objectId, objectId))
    .all();

  const currentTagIds = new Set(currentAssignments.map((a) => a.tagId));

  const assignedTagIds: string[] = [];
  const skippedTagIds: string[] = [];
  const now = new Date();

  for (const tagId of tagIds) {
    if (currentTagIds.has(tagId)) {
      // Already assigned
      skippedTagIds.push(tagId);
    } else {
      // Insert new assignment
      db.insert(objectTags)
        .values({
          objectId,
          tagId,
          createdAt: now,
        })
        .run();
      assignedTagIds.push(tagId);
    }
  }

  return {
    objectId,
    assignedTagIds,
    skippedTagIds,
  };
}

/**
 * Remove tags from an object.
 *
 * Idempotent: removing an unassigned tag is a no-op.
 *
 * @throws TagServiceError with code NOT_FOUND_OBJECT if object doesn't exist
 */
export function removeTags(db: TypenoteDb, input: RemoveTagsInput): RemoveTagsResult {
  const { objectId, tagIds } = input;

  // Verify object exists
  const obj = db.select().from(objects).where(eq(objects.id, objectId)).get();
  if (!obj) {
    throw new TagServiceError('NOT_FOUND_OBJECT', `Object not found: ${objectId}`, { objectId });
  }

  // Get currently assigned tag IDs for this object
  const currentAssignments = db
    .select({ tagId: objectTags.tagId })
    .from(objectTags)
    .where(eq(objectTags.objectId, objectId))
    .all();

  const currentTagIds = new Set(currentAssignments.map((a) => a.tagId));

  const removedTagIds: string[] = [];
  const skippedTagIds: string[] = [];

  for (const tagId of tagIds) {
    if (currentTagIds.has(tagId)) {
      // Delete assignment
      db.delete(objectTags)
        .where(and(eq(objectTags.objectId, objectId), eq(objectTags.tagId, tagId)))
        .run();
      removedTagIds.push(tagId);
    } else {
      // Not assigned
      skippedTagIds.push(tagId);
    }
  }

  return {
    objectId,
    removedTagIds,
    skippedTagIds,
  };
}

/**
 * Get all tags assigned to an object.
 *
 * @returns Array of tags (empty if object not found or has no tags)
 */
export function getObjectTags(db: TypenoteDb, objectId: string): Tag[] {
  const rows = db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      color: tags.color,
      icon: tags.icon,
      description: tags.description,
      createdAt: tags.createdAt,
      updatedAt: tags.updatedAt,
    })
    .from(objectTags)
    .innerJoin(tags, eq(objectTags.tagId, tags.id))
    .where(eq(objectTags.objectId, objectId))
    .all();

  return rows;
}

// ============================================================================
// Convenience Operations
// ============================================================================

/**
 * Find a tag by slug, or create it if it doesn't exist.
 *
 * @param db - Database connection
 * @param slug - The tag slug to find or create
 * @param options - Optional tag properties for creation (ignored if tag exists)
 */
export function findOrCreateTag(
  db: TypenoteDb,
  slug: string,
  options?: Omit<CreateTagInput, 'slug'>
): Tag {
  const existing = getTagBySlug(db, slug);
  if (existing) {
    return existing;
  }

  return createTag(db, {
    name: options?.['name'] ?? slug,
    slug,
    color: options?.['color'],
    icon: options?.['icon'],
    description: options?.['description'],
  });
}
