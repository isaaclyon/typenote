/**
 * Backlinks query - find blocks that reference an object.
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { refs, blocks } from './schema.js';

/**
 * Result of a backlinks query.
 */
export type BacklinkResult = {
  /** The block containing the reference */
  sourceBlockId: string;
  /** The object containing the source block */
  sourceObjectId: string;
  /** The specific block being referenced (null if object-level reference) */
  targetBlockId: string | null;
};

/**
 * Get all blocks that reference a given object.
 * Excludes references from deleted blocks.
 *
 * @param db - Database connection
 * @param objectId - The object to find references to
 * @returns Array of backlink results
 */
export function getBacklinks(db: TypenoteDb, objectId: string): BacklinkResult[] {
  // Join refs with blocks to exclude deleted source blocks
  const results = db
    .select({
      sourceBlockId: refs.sourceBlockId,
      sourceObjectId: refs.sourceObjectId,
      targetBlockId: refs.targetBlockId,
    })
    .from(refs)
    .innerJoin(blocks, eq(refs.sourceBlockId, blocks.id))
    .where(and(eq(refs.targetObjectId, objectId), isNull(blocks.deletedAt)))
    .all();

  return results;
}
