/**
 * Full-text search for blocks.
 */

import type { TypenoteDb } from './db.js';

/**
 * Result of a search query.
 */
export type SearchResult = {
  /** The matching block ID */
  blockId: string;
  /** The object containing the block */
  objectId: string;
  /** The title of the object (for display in UI) */
  objectTitle: string;
  /** The type key of the object (e.g., "Page", "DailyNote") */
  typeKey: string;
  /** The icon name for the object's type (e.g., "calendar", "file-text") */
  typeIcon: string | null;
  /** The color hex for the object's type (e.g., "#F59E0B") */
  typeColor: string | null;
};

/**
 * Search filters.
 */
export type SearchFilters = {
  /** Limit results to a specific object */
  objectId?: string;
  /** Maximum number of results (default 50) */
  limit?: number;
};

/**
 * Search blocks by text content using FTS5.
 * Excludes deleted blocks.
 *
 * @param db - Database connection
 * @param query - The search query (FTS5 syntax)
 * @param filters - Optional filters
 * @returns Array of search results
 */
export function searchBlocks(
  db: TypenoteDb,
  query: string,
  filters?: SearchFilters
): SearchResult[] {
  // Empty or whitespace-only queries return empty results
  // FTS5 MATCH doesn't accept empty strings
  if (!query.trim()) {
    return [];
  }

  const limit = filters?.limit ?? 50;

  // Build the query with optional object filter
  // Join with blocks table to exclude deleted blocks
  let sql: string;
  const params: unknown[] = [];

  if (filters?.objectId) {
    sql = `
      SELECT
        fts.block_id,
        fts.object_id,
        o.title as object_title,
        ot.key as type_key,
        ot.icon as type_icon,
        ot.color as type_color
      FROM fts_blocks fts
      INNER JOIN blocks b ON fts.block_id = b.id
      INNER JOIN objects o ON fts.object_id = o.id
      INNER JOIN object_types ot ON o.type_id = ot.id
      WHERE fts_blocks MATCH ?
        AND fts.object_id = ?
        AND b.deleted_at IS NULL
      LIMIT ?
    `;
    params.push(query, filters.objectId, limit);
  } else {
    sql = `
      SELECT
        fts.block_id,
        fts.object_id,
        o.title as object_title,
        ot.key as type_key,
        ot.icon as type_icon,
        ot.color as type_color
      FROM fts_blocks fts
      INNER JOIN blocks b ON fts.block_id = b.id
      INNER JOIN objects o ON fts.object_id = o.id
      INNER JOIN object_types ot ON o.type_id = ot.id
      WHERE fts_blocks MATCH ?
        AND b.deleted_at IS NULL
      LIMIT ?
    `;
    params.push(query, limit);
  }

  const results = db.all<{
    block_id: string;
    object_id: string;
    object_title: string;
    type_key: string;
    type_icon: string | null;
    type_color: string | null;
  }>(sql, params);

  return results.map((row) => ({
    blockId: row.block_id,
    objectId: row.object_id,
    objectTitle: row.object_title,
    typeKey: row.type_key,
    typeIcon: row.type_icon,
    typeColor: row.type_color,
  }));
}
