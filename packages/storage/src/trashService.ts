/**
 * Trash Service - Listing and restoring soft-deleted objects.
 *
 * Provides functionality to:
 * - List objects that have been soft-deleted (deletedAt IS NOT NULL)
 * - Restore soft-deleted objects and their blocks
 * - Re-index FTS and refs for restored content
 */

import { eq, isNotNull, desc } from 'drizzle-orm';
import type { BlockType } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objects, objectTypes, blocks } from './schema.js';
import { updateRefsForBlock, updateFtsForBlock } from './indexing.js';
import { createServiceError } from './errors.js';

// ============================================================================
// Error Types
// ============================================================================

export type TrashServiceErrorCode = 'OBJECT_NOT_FOUND';

export const TrashServiceError = createServiceError<TrashServiceErrorCode>('TrashServiceError');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- Intentional type/value namespace sharing
export type TrashServiceError = InstanceType<typeof TrashServiceError>;

// ============================================================================
// Result Types
// ============================================================================

export interface DeletedObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  deletedAt: Date;
  updatedAt: Date;
}

export interface RestoreObjectResult {
  id: string;
  title: string;
  typeKey: string;
  blocksRestored: number;
  blocksReindexed: number;
}

export interface ListDeletedObjectsOptions {
  limit?: number;
  typeKey?: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * List soft-deleted objects.
 *
 * @param db - Database connection
 * @param options - Optional filters (limit, typeKey)
 * @returns Array of deleted object summaries, ordered by deletedAt DESC
 */
export function listDeletedObjects(
  db: TypenoteDb,
  options?: ListDeletedObjectsOptions
): DeletedObjectSummary[] {
  const { limit = 100, typeKey } = options ?? {};

  // Query objects where deletedAt IS NOT NULL
  const rows = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      typeKey: objectTypes.key,
      deletedAt: objects.deletedAt,
      updatedAt: objects.updatedAt,
    })
    .from(objects)
    .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(isNotNull(objects.deletedAt))
    .orderBy(desc(objects.deletedAt))
    .limit(limit)
    .all();

  // Filter by typeKey in JavaScript if specified
  let results = rows.map((row) => ({
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: row.typeKey ?? 'Unknown',
    deletedAt: new Date(row.deletedAt as unknown as number),
    updatedAt: row.updatedAt,
  }));

  if (typeKey !== undefined) {
    results = results.filter((obj) => obj.typeKey === typeKey);
  }

  return results;
}

/**
 * Restore a soft-deleted object.
 *
 * @param db - Database connection
 * @param objectId - ID of the object to restore
 * @returns Restore result with counts
 * @throws TrashServiceError if object not found
 *
 * Behavior:
 * - Clears deletedAt on object
 * - Clears deletedAt on all blocks belonging to object
 * - Re-indexes FTS and refs for all blocks
 * - Returns no-op result if object is already active (not deleted)
 */
export function restoreObject(db: TypenoteDb, objectId: string): RestoreObjectResult {
  return db.atomic((): RestoreObjectResult => {
    // 1. Get object (including deleted ones - no deletedAt filter)
    const row = db
      .select({
        id: objects.id,
        title: objects.title,
        typeId: objects.typeId,
        typeKey: objectTypes.key,
        deletedAt: objects.deletedAt,
      })
      .from(objects)
      .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
      .where(eq(objects.id, objectId))
      .get();

    if (!row) {
      throw new TrashServiceError('OBJECT_NOT_FOUND', `Object not found: ${objectId}`, {
        objectId,
      });
    }

    // 2. If not deleted, return no-op result
    if (row.deletedAt === null) {
      return {
        id: row.id,
        title: row.title,
        typeKey: row.typeKey ?? 'Unknown',
        blocksRestored: 0,
        blocksReindexed: 0,
      };
    }

    // 3. Clear deletedAt on object
    db.update(objects).set({ deletedAt: null }).where(eq(objects.id, objectId)).run();

    // 4. Get all blocks for this object (including deleted ones)
    const allBlocks = db
      .select({
        id: blocks.id,
        blockType: blocks.blockType,
        content: blocks.content,
        deletedAt: blocks.deletedAt,
      })
      .from(blocks)
      .where(eq(blocks.objectId, objectId))
      .all();

    // 5. Count deleted blocks
    const deletedBlocks = allBlocks.filter((b) => b.deletedAt !== null);
    const blocksRestored = deletedBlocks.length;

    // 6. Clear deletedAt on all deleted blocks
    if (blocksRestored > 0) {
      db.update(blocks).set({ deletedAt: null }).where(eq(blocks.objectId, objectId)).run();
    }

    // 7. Re-index FTS and refs for ALL blocks (not just deleted ones)
    // This ensures the indexes are correct even if they were cleared during deletion
    for (const block of allBlocks) {
      let parsedContent: unknown;
      try {
        parsedContent = JSON.parse(block.content);
      } catch {
        parsedContent = {};
      }

      updateFtsForBlock(db, block.id, objectId, block.blockType as BlockType, parsedContent);
      updateRefsForBlock(db, block.id, objectId, block.blockType as BlockType, parsedContent);
    }

    const blocksReindexed = allBlocks.length;

    // 8. Return result
    return {
      id: row.id,
      title: row.title,
      typeKey: row.typeKey ?? 'Unknown',
      blocksRestored,
      blocksReindexed,
    };
  });
}
