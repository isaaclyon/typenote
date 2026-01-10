/**
 * Unlinked mentions detection.
 *
 * Finds blocks that contain plain text matching an object's title,
 * but don't have an explicit reference to that object.
 */

import { eq, and, isNull, inArray } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { blocks, objects, refs } from './schema.js';
import { searchBlocks } from './search.js';
import { getObject } from './objectService.js';

/**
 * Result of an unlinked mention query.
 */
export type UnlinkedMentionResult = {
  /** The block containing the unlinked mention */
  sourceBlockId: string;
  /** The object containing the source block */
  sourceObjectId: string;
  /** The title of the source object (for display in UI) */
  sourceObjectTitle: string;
};

/**
 * Find blocks that mention an object's title without linking to it.
 *
 * Uses FTS5 for initial candidate matching, then post-filters:
 * - Excludes self-references (blocks in the target object itself)
 * - Excludes already-linked blocks (blocks with refs to target object)
 * - Excludes soft-deleted blocks and objects
 *
 * @param db - Database connection
 * @param objectId - The object to find unlinked mentions of
 * @returns Array of unlinked mention results (deduplicated by block)
 */
export function getUnlinkedMentionsTo(db: TypenoteDb, objectId: string): UnlinkedMentionResult[] {
  // Step 1: Get target object and verify it's not soft-deleted
  const targetObject = getObject(db, objectId);
  if (!targetObject || !targetObject.title.trim()) {
    return [];
  }

  // Step 1a: Verify target object is not soft-deleted
  // Note: getObject() doesn't filter by deletedAt, so we check explicitly
  const isDeleted = db
    .select({ deletedAt: objects.deletedAt })
    .from(objects)
    .where(eq(objects.id, objectId))
    .get();

  if (isDeleted?.deletedAt !== null) {
    return [];
  }

  // Step 2: Build FTS5 query for the title
  const ftsQuery = buildFtsQuery(targetObject.title);

  // Step 3: Search FTS5 for candidate blocks (limit to avoid excessive results)
  const candidates = searchBlocks(db, ftsQuery, { limit: 200 });

  if (candidates.length === 0) {
    return [];
  }

  // Step 4: Get blocks that already link to this object
  const linkedBlockIds = getLinkedBlockIds(db, objectId);

  // Step 5: Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    // Exclude self-references (blocks in the target object itself)
    if (candidate.objectId === objectId) {
      return false;
    }

    // Exclude blocks that already have explicit references
    if (linkedBlockIds.has(candidate.blockId)) {
      return false;
    }

    return true;
  });

  if (filteredCandidates.length === 0) {
    return [];
  }

  // Step 6: Deduplicate by block (already done by FTS5, but belt-and-suspenders)
  const deduplicatedBlockIds = Array.from(new Set(filteredCandidates.map((c) => c.blockId)));

  // Step 7: Enrich with source object titles
  const results = db
    .select({
      sourceBlockId: blocks.id,
      sourceObjectId: blocks.objectId,
      sourceObjectTitle: objects.title,
    })
    .from(blocks)
    .innerJoin(objects, eq(blocks.objectId, objects.id))
    .where(
      and(
        inArray(blocks.id, deduplicatedBlockIds),
        isNull(objects.deletedAt) // Exclude soft-deleted source objects
      )
    )
    .all();

  return results;
}

/**
 * Build FTS5 query string for matching an object title.
 *
 * Always uses phrase matching (quoted) to:
 * - Ensure exact phrase matches ("Meeting Notes" as a phrase, not separate words)
 * - Safely handle FTS5 special characters (*, ^, -, OR, AND, NOT, etc.)
 * - Escapes double quotes (FTS5 phrase delimiter)
 *
 * @internal
 */
function buildFtsQuery(title: string): string {
  // Escape double quotes (FTS5 phrase delimiter)
  const escaped = title.replace(/"/g, '""');

  // Always use phrase matching for safety and correct semantics
  // This treats all titles as literal phrases, avoiding FTS5 syntax issues
  return `"${escaped}"`;
}

/**
 * Get set of block IDs that already reference the target object.
 *
 * @internal
 */
function getLinkedBlockIds(db: TypenoteDb, targetObjectId: string): Set<string> {
  const linkedBlocks = db
    .select({ sourceBlockId: refs.sourceBlockId })
    .from(refs)
    .where(eq(refs.targetObjectId, targetObjectId))
    .all();

  return new Set(linkedBlocks.map((row) => row.sourceBlockId));
}
