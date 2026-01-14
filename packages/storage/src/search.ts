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
      SELECT fts.block_id, fts.object_id
      FROM fts_blocks fts
      INNER JOIN blocks b ON fts.block_id = b.id
      WHERE fts_blocks MATCH ?
        AND fts.object_id = ?
        AND b.deleted_at IS NULL
      LIMIT ?
    `;
    params.push(query, filters.objectId, limit);
  } else {
    sql = `
      SELECT fts.block_id, fts.object_id
      FROM fts_blocks fts
      INNER JOIN blocks b ON fts.block_id = b.id
      WHERE fts_blocks MATCH ?
        AND b.deleted_at IS NULL
      LIMIT ?
    `;
    params.push(query, limit);
  }

  const results = db.all<{ block_id: string; object_id: string }>(sql, params);

  return results.map((row) => ({
    blockId: row.block_id,
    objectId: row.object_id,
  }));
}
