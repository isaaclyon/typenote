/**
 * Pinned Objects Service
 *
 * Manages user-pinned objects for quick access with manual ordering.
 * Silent failure pattern: logs errors but never throws.
 */

import { eq, isNull, sql } from 'drizzle-orm';
import { pinnedObjects, objects, objectTypes } from './schema.js';
import type { TypenoteDb } from './db.js';

// ============================================================================
// Types
// ============================================================================

export interface PinnedObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  updatedAt: Date;
  pinnedAt: Date;
  order: number;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Pin an object for quick access.
 * Updates timestamp if already pinned, inserts if new.
 * Silently fails on errors (logs but doesn't throw).
 *
 * @param db - Database connection
 * @param objectId - The object to pin
 */
export function pinObject(db: TypenoteDb, objectId: string): void {
  try {
    const now = new Date();

    // Check if already pinned
    const existing = db
      .select({ objectId: pinnedObjects.objectId, order: pinnedObjects.order })
      .from(pinnedObjects)
      .where(eq(pinnedObjects.objectId, objectId))
      .get();

    if (existing) {
      // Already pinned: just update timestamp
      db.update(pinnedObjects)
        .set({ pinnedAt: now })
        .where(eq(pinnedObjects.objectId, objectId))
        .run();
    } else {
      // New pin: get max order and add at end
      const maxOrderResult = db
        .select({ maxOrder: sql<number>`COALESCE(MAX(${pinnedObjects.order}), -1)` })
        .from(pinnedObjects)
        .get();

      const maxOrder = maxOrderResult?.maxOrder ?? -1;
      const newOrder = maxOrder + 1;

      db.insert(pinnedObjects).values({ objectId, pinnedAt: now, order: newOrder }).run();
    }
  } catch (error) {
    // Silent failure: log but don't throw
    console.error('[PinnedObjects] Failed to pin object:', error);
  }
}

/**
 * Unpin an object.
 * Idempotent: no error if object is not pinned.
 * Silently fails on errors (logs but doesn't throw).
 *
 * @param db - Database connection
 * @param objectId - The object to unpin
 */
export function unpinObject(db: TypenoteDb, objectId: string): void {
  try {
    db.delete(pinnedObjects).where(eq(pinnedObjects.objectId, objectId)).run();
  } catch (error) {
    // Silent failure: log but don't throw
    console.error('[PinnedObjects] Failed to unpin object:', error);
  }
}

/**
 * Check if an object is pinned.
 * Returns false on error.
 *
 * @param db - Database connection
 * @param objectId - The object to check
 * @returns true if pinned, false otherwise
 */
export function isPinned(db: TypenoteDb, objectId: string): boolean {
  try {
    const result = db
      .select({ objectId: pinnedObjects.objectId })
      .from(pinnedObjects)
      .where(eq(pinnedObjects.objectId, objectId))
      .get();

    return result !== undefined;
  } catch (error) {
    console.error('[PinnedObjects] Failed to check if pinned:', error);
    return false;
  }
}

/**
 * Get all pinned objects ordered by user-defined order.
 * Filters out soft-deleted objects.
 *
 * @param db - Database connection
 * @returns Array of pinned objects with metadata
 */
export function getPinnedObjects(db: TypenoteDb): PinnedObjectSummary[] {
  try {
    const rows = db
      .select({
        id: objects.id,
        title: objects.title,
        typeId: objects.typeId,
        typeKey: objectTypes.key,
        updatedAt: objects.updatedAt,
        pinnedAt: pinnedObjects.pinnedAt,
        order: pinnedObjects.order,
      })
      .from(pinnedObjects)
      .innerJoin(objects, eq(pinnedObjects.objectId, objects.id))
      .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
      .where(isNull(objects.deletedAt))
      .orderBy(pinnedObjects.order)
      .all();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      typeId: row.typeId,
      typeKey: row.typeKey ?? 'Unknown',
      updatedAt: row.updatedAt,
      pinnedAt: row.pinnedAt,
      order: row.order,
    }));
  } catch (error) {
    console.error('[PinnedObjects] Failed to get pinned objects:', error);
    return []; // Return empty array on failure
  }
}

/**
 * Reorder pinned objects by providing the full ordered list of IDs.
 * Updates the order column for each ID based on its position in the array.
 * Silently fails on errors (logs but doesn't throw).
 *
 * @param db - Database connection
 * @param orderedIds - Array of object IDs in the desired order
 */
export function reorderPinnedObjects(db: TypenoteDb, orderedIds: string[]): void {
  try {
    // Update order for each ID based on its position in the array
    db.transaction(() => {
      orderedIds.forEach((objectId, index) => {
        db.update(pinnedObjects)
          .set({ order: index })
          .where(eq(pinnedObjects.objectId, objectId))
          .run();
      });
    });
  } catch (error) {
    // Silent failure: log but don't throw
    console.error('[PinnedObjects] Failed to reorder pinned objects:', error);
  }
}

/**
 * Clear all pinned object entries.
 * Used for testing or user-initiated reset.
 *
 * @param db - Database connection
 */
export function clearPinnedObjects(db: TypenoteDb): void {
  try {
    db.delete(pinnedObjects).run();
  } catch (error) {
    console.error('[PinnedObjects] Failed to clear pinned objects:', error);
  }
}
