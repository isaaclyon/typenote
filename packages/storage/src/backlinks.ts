/**
 * Backlinks query - find blocks that reference an object.
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { refs, blocks, objects, objectTypes } from './schema.js';

/**
 * Result of a backlinks query.
 */
export type BacklinkResult = {
  /** The block containing the reference */
  sourceBlockId: string;
  /** The object containing the source block */
  sourceObjectId: string;
  /** The title of the source object (for display in UI) */
  sourceObjectTitle: string;
  /** The specific block being referenced (null if object-level reference) */
  targetBlockId: string | null;
  /** The type ID of the source object */
  sourceTypeId: string;
  /** The type key of the source object (e.g., "Page", "DailyNote") */
  sourceTypeKey: string;
  /** The icon name for the source object's type (e.g., "calendar", "file-text") */
  sourceTypeIcon: string | null;
  /** The color hex for the source object's type (e.g., "#F59E0B") */
  sourceTypeColor: string | null;
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
  // Join with objects to get the source object title
  // Join with objectTypes to get type metadata (icon, color)
  const results = db
    .select({
      sourceBlockId: refs.sourceBlockId,
      sourceObjectId: refs.sourceObjectId,
      sourceObjectTitle: objects.title,
      targetBlockId: refs.targetBlockId,
      sourceTypeId: objects.typeId,
      sourceTypeKey: objectTypes.key,
      sourceTypeIcon: objectTypes.icon,
      sourceTypeColor: objectTypes.color,
    })
    .from(refs)
    .innerJoin(blocks, eq(refs.sourceBlockId, blocks.id))
    .innerJoin(objects, eq(refs.sourceObjectId, objects.id))
    .innerJoin(objectTypes, eq(objects.typeId, objectTypes.id))
    .where(and(eq(refs.targetObjectId, objectId), isNull(blocks.deletedAt)))
    .all();

  return results;
}
