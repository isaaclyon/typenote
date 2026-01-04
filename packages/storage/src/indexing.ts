/**
 * Indexing side effects for block mutations.
 *
 * These functions update the `refs` and `fts_blocks` tables
 * when block content changes. They should be called within the
 * same transaction as block mutations.
 */

import { eq, inArray } from 'drizzle-orm';
import { generateId } from '@typenote/core';
import type { BlockType } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { refs } from './schema.js';
import { extractReferences, extractPlainText } from './contentExtraction.js';

/**
 * Update refs table for a block.
 * Deletes any existing refs from this block, then inserts new ones.
 *
 * @param db - Database connection (should be within a transaction)
 * @param blockId - The block whose refs are being updated
 * @param objectId - The object containing the block
 * @param blockType - Block type for content extraction
 * @param content - Block content to extract refs from
 */
export function updateRefsForBlock(
  db: TypenoteDb,
  blockId: string,
  objectId: string,
  blockType: BlockType,
  content: unknown
): void {
  // Delete existing refs from this block
  db.delete(refs).where(eq(refs.sourceBlockId, blockId)).run();

  // Extract new refs from content
  const refTargets = extractReferences(blockType, content);

  if (refTargets.length === 0) {
    return;
  }

  // Insert new refs
  const now = new Date();
  const refRows = refTargets.map((target) => ({
    id: generateId(),
    sourceBlockId: blockId,
    sourceObjectId: objectId,
    targetObjectId: target.objectId,
    targetBlockId: target.kind === 'block' ? target.blockId : null,
    createdAt: now,
  }));

  db.insert(refs).values(refRows).run();
}

/**
 * Update FTS index for a block.
 * Deletes any existing FTS entry for this block, then inserts new one.
 *
 * @param db - Database connection (should be within a transaction)
 * @param blockId - The block whose FTS is being updated
 * @param objectId - The object containing the block
 * @param blockType - Block type for content extraction
 * @param content - Block content to extract text from
 */
export function updateFtsForBlock(
  db: TypenoteDb,
  blockId: string,
  objectId: string,
  blockType: BlockType,
  content: unknown
): void {
  // Delete existing FTS entry for this block
  db.run(`DELETE FROM fts_blocks WHERE block_id = ?`, [blockId]);

  // Extract plain text from content
  const plainText = extractPlainText(blockType, content);

  if (!plainText) {
    return;
  }

  // Insert new FTS entry
  db.run(`INSERT INTO fts_blocks (block_id, object_id, content_text) VALUES (?, ?, ?)`, [
    blockId,
    objectId,
    plainText,
  ]);
}

/**
 * Delete refs for multiple blocks.
 * Used when blocks are deleted.
 *
 * @param db - Database connection (should be within a transaction)
 * @param blockIds - Array of block IDs to delete refs for
 */
export function deleteRefsForBlocks(db: TypenoteDb, blockIds: string[]): void {
  if (blockIds.length === 0) {
    return;
  }

  db.delete(refs).where(inArray(refs.sourceBlockId, blockIds)).run();
}

/**
 * Delete FTS entries for multiple blocks.
 * Used when blocks are deleted.
 *
 * @param db - Database connection (should be within a transaction)
 * @param blockIds - Array of block IDs to delete FTS entries for
 */
export function deleteFtsForBlocks(db: TypenoteDb, blockIds: string[]): void {
  if (blockIds.length === 0) {
    return;
  }

  // Build placeholders for IN clause
  const placeholders = blockIds.map(() => '?').join(', ');
  db.run(`DELETE FROM fts_blocks WHERE block_id IN (${placeholders})`, blockIds);
}
