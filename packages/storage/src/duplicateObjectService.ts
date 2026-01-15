/**
 * Object duplication service.
 *
 * Phase 3: Core Service - Happy Path (TDD)
 * - Clones object with new ID
 * - Clones all blocks with new IDs
 * - Preserves block tree structure
 * - Preserves content as-is (no ref remapping yet)
 */

import { generateId } from '@typenote/core';
import type { DuplicateObjectResponse } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objects, blocks } from './schema.js';
import { eq } from 'drizzle-orm';

/**
 * Duplicate an object and all its blocks.
 *
 * Phase 3: Happy path implementation
 * - Creates new object with " (Copy)" suffix
 * - Clones all blocks with new IDs
 * - Preserves block tree structure via parentBlockId remapping
 * - Content is copied as-is (no ref remapping in Phase 3)
 *
 * @param db - Database connection
 * @param objectId - Source object ID to duplicate
 * @returns Response with new object metadata and block count
 */
export function duplicateObject(db: TypenoteDb, objectId: string): DuplicateObjectResponse {
  // 1. Fetch source object
  const sourceObject = db
    .select({
      id: objects.id,
      typeId: objects.typeId,
      title: objects.title,
      properties: objects.properties,
    })
    .from(objects)
    .where(eq(objects.id, objectId))
    .limit(1)
    .all()[0];

  if (!sourceObject) {
    throw new Error(`Object not found: ${objectId}`);
  }

  // 2. Generate new object ID
  const newObjectId = generateId();

  // 3. Clone object with new title
  const newTitle = `${sourceObject.title} (Copy)`;
  const now = new Date();

  // 4. Fetch all blocks for source object
  const sourceBlocks = db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();

  // 5. Build ID mapping: oldBlockId -> newBlockId
  const idMap = new Map<string, string>();
  for (const block of sourceBlocks) {
    idMap.set(block.id, generateId());
  }

  // 6. Clone each block with remapped IDs
  const duplicatedBlocks = sourceBlocks.map((block) => {
    const newBlockId = idMap.get(block.id);
    if (!newBlockId) {
      throw new Error(`No ID mapping for block ${block.id}`);
    }

    // Remap parentBlockId if it exists
    let newParentBlockId: string | null = null;
    if (block.parentBlockId !== null) {
      newParentBlockId = idMap.get(block.parentBlockId) ?? null;
      if (newParentBlockId === null) {
        throw new Error(`Parent block ${block.parentBlockId} not found in ID map`);
      }
    }

    return {
      id: newBlockId,
      objectId: newObjectId,
      parentBlockId: newParentBlockId,
      orderKey: block.orderKey, // Preserve order
      blockType: block.blockType,
      content: block.content, // Copy as-is (no ref remapping in Phase 3)
      meta: block.meta,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  });

  // 7. Single atomic transaction: insert object + all blocks
  db.atomic(() => {
    // Insert new object
    db.insert(objects)
      .values({
        id: newObjectId,
        typeId: sourceObject.typeId,
        title: newTitle,
        properties: sourceObject.properties,
        docVersion: 0, // Reset to 0
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      .run();

    // Insert all cloned blocks
    if (duplicatedBlocks.length > 0) {
      db.insert(blocks).values(duplicatedBlocks).run();
    }
  });

  // 8. Return response
  return {
    object: {
      id: newObjectId,
      typeId: sourceObject.typeId,
      title: newTitle,
      properties: JSON.parse(sourceObject.properties) as Record<string, unknown>,
      docVersion: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    blockCount: duplicatedBlocks.length,
  };
}
