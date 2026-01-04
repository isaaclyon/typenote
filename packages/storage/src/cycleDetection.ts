/**
 * Cycle detection for block move operations.
 *
 * A cycle occurs when trying to move a block under one of its descendants.
 * This would create an infinite parent chain.
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { blocks } from './schema.js';

/**
 * Get the ancestors of a block (parent chain from immediate parent to root).
 *
 * @param db - Database connection
 * @param blockId - Block to get ancestors for
 * @param objectId - Object the block belongs to
 * @returns Array of ancestor block IDs, from immediate parent to root
 */
export function getAncestors(db: TypenoteDb, blockId: string, objectId: string): string[] {
  const ancestors: string[] = [];

  // Get the block's parent
  const block = db
    .select({ parentBlockId: blocks.parentBlockId })
    .from(blocks)
    .where(and(eq(blocks.id, blockId), eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
    .limit(1)
    .all()[0];

  if (!block || block.parentBlockId === null) {
    return ancestors;
  }

  // Walk up the parent chain
  let currentParentId: string | null = block.parentBlockId;

  while (currentParentId !== null) {
    ancestors.push(currentParentId);

    const parent: { parentBlockId: string | null } | undefined = db
      .select({ parentBlockId: blocks.parentBlockId })
      .from(blocks)
      .where(
        and(eq(blocks.id, currentParentId), eq(blocks.objectId, objectId), isNull(blocks.deletedAt))
      )
      .limit(1)
      .all()[0];

    currentParentId = parent?.parentBlockId ?? null;
  }

  return ancestors;
}

/**
 * Check if moving a block under a new parent would create a cycle.
 *
 * A cycle would occur if newParentBlockId is the block itself or
 * any of its descendants.
 *
 * @param db - Database connection
 * @param blockId - Block being moved
 * @param newParentBlockId - Target parent (null = move to root)
 * @param objectId - Object the blocks belong to
 * @returns true if the move would create a cycle
 */
export function wouldCreateCycle(
  db: TypenoteDb,
  blockId: string,
  newParentBlockId: string | null,
  objectId: string
): boolean {
  // Moving to root never creates a cycle
  if (newParentBlockId === null) {
    return false;
  }

  // Moving under self is always a cycle
  if (newParentBlockId === blockId) {
    return true;
  }

  // Check if newParentBlockId is a descendant of blockId
  // by walking up from newParentBlockId to see if we hit blockId
  const ancestors = getAncestorsOfBlock(db, newParentBlockId, objectId);

  return ancestors.includes(blockId);
}

/**
 * Get all ancestors of a block (internal helper that starts from the block itself).
 */
function getAncestorsOfBlock(db: TypenoteDb, blockId: string, objectId: string): string[] {
  const ancestors: string[] = [];
  let currentId: string | null = blockId;

  while (currentId !== null) {
    const block: { parentBlockId: string | null } | undefined = db
      .select({ parentBlockId: blocks.parentBlockId })
      .from(blocks)
      .where(and(eq(blocks.id, currentId), eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
      .limit(1)
      .all()[0];

    if (!block) {
      break;
    }

    currentId = block.parentBlockId;
    if (currentId !== null) {
      ancestors.push(currentId);
    }
  }

  return ancestors;
}
