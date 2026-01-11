/**
 * Recent Objects Service
 *
 * Tracks recently viewed objects with LRU eviction (100-entry limit).
 * Silent failure pattern: logs errors but never throws.
 */

import { eq, desc, asc, isNull, sql } from 'drizzle-orm';
import { recentObjects, objects, objectTypes } from './schema.js';
import type { TypenoteDb } from './db.js';

// ============================================================================
// Constants
// ============================================================================

const MAX_RECENT_OBJECTS = 100;

// ============================================================================
// Types
// ============================================================================

export interface RecentObjectSummary {
  id: string;
  title: string;
  typeId: string;
  typeKey: string;
  updatedAt: Date;
  viewedAt: Date;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Record a view of an object.
 * Updates timestamp if already present, inserts if new.
 * Silently fails on errors (logs but doesn't throw).
 *
 * @param db - Database connection
 * @param objectId - The object that was viewed
 */
export function recordView(db: TypenoteDb, objectId: string): void {
  try {
    const now = new Date();

    // UPSERT: Insert or update viewedAt timestamp
    db.insert(recentObjects)
      .values({ objectId, viewedAt: now })
      .onConflictDoUpdate({
        target: recentObjects.objectId,
        set: { viewedAt: now },
      })
      .run();

    // Cleanup: Remove oldest entries if over limit
    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(recentObjects)
      .get();

    const count = countResult?.count ?? 0;

    if (count > MAX_RECENT_OBJECTS) {
      const toDelete = count - MAX_RECENT_OBJECTS;

      // Delete oldest N entries (LRU eviction)
      // SQLite doesn't support DELETE with ORDER BY + LIMIT directly,
      // so we use a subquery to get IDs to delete
      const oldestIds = db
        .select({ objectId: recentObjects.objectId })
        .from(recentObjects)
        .orderBy(asc(recentObjects.viewedAt))
        .limit(toDelete)
        .all();

      if (oldestIds.length > 0) {
        const idsToDelete = oldestIds.map((r) => r.objectId);
        db.delete(recentObjects)
          .where(
            sql`${recentObjects.objectId} IN (${sql.join(
              idsToDelete.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
          .run();
      }
    }
  } catch (error) {
    // Silent failure: log but don't throw
    console.error('[RecentObjects] Failed to record view:', error);
  }
}

/**
 * Get recent objects ordered by most recent first.
 * Returns up to `limit` entries (default 10).
 * Filters out soft-deleted objects.
 *
 * @param db - Database connection
 * @param limit - Maximum number of entries to return (default 10)
 * @returns Array of recent objects with metadata
 */
export function getRecentObjects(db: TypenoteDb, limit = 10): RecentObjectSummary[] {
  try {
    const rows = db
      .select({
        id: objects.id,
        title: objects.title,
        typeId: objects.typeId,
        typeKey: objectTypes.key,
        updatedAt: objects.updatedAt,
        viewedAt: recentObjects.viewedAt,
      })
      .from(recentObjects)
      .innerJoin(objects, eq(recentObjects.objectId, objects.id))
      .leftJoin(objectTypes, eq(objects.typeId, objectTypes.id))
      .where(isNull(objects.deletedAt))
      .orderBy(desc(recentObjects.viewedAt))
      .limit(limit)
      .all();

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      typeId: row.typeId,
      typeKey: row.typeKey ?? 'Unknown',
      updatedAt: row.updatedAt,
      viewedAt: row.viewedAt,
    }));
  } catch (error) {
    console.error('[RecentObjects] Failed to get recent objects:', error);
    return []; // Return empty array on failure
  }
}

/**
 * Clear all recent object entries.
 * Used for testing or user-initiated reset.
 *
 * @param db - Database connection
 */
export function clearRecentObjects(db: TypenoteDb): void {
  try {
    db.delete(recentObjects).run();
  } catch (error) {
    console.error('[RecentObjects] Failed to clear recent objects:', error);
  }
}
