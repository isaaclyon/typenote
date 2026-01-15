/**
 * Object duplication service.
 *
 * Phase 4: Internal Ref Remapping (TDD)
 * - Clones object with new ID
 * - Clones all blocks with new IDs
 * - Preserves block tree structure
 * - Remaps internal refs to new IDs (Phase 4)
 */

import { generateId } from '@typenote/core';
import type { DuplicateObjectResponse } from '@typenote/api';
import { notFoundObject, dailyNoteNotDuplicable } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objects, blocks } from './schema.js';
import { eq } from 'drizzle-orm';
import { getObjectType } from './objectTypeService.js';

/**
 * Type guard to check if a value is an object (and not null).
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if a value is an array of inline nodes.
 */
function isInlineNodeArray(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every((item) => isObject(item) && 't' in item);
}

/**
 * Recursively remap internal refs in inline nodes.
 *
 * @param inlineNodes - Array of inline nodes to process
 * @param sourceObjectId - The original object ID being duplicated
 * @param newObjectId - The new object ID for the duplicate
 * @param idMap - Map of old block IDs to new block IDs
 * @returns Array of inline nodes with remapped refs
 */
function remapInlineRefs(
  inlineNodes: Array<Record<string, unknown>>,
  sourceObjectId: string,
  newObjectId: string,
  idMap: Map<string, string>
): Array<Record<string, unknown>> {
  return inlineNodes.map((node) => {
    // Handle ref nodes
    if (node['t'] === 'ref' && isObject(node['target'])) {
      const target = node['target'];

      // Check if this is an internal ref (target.objectId === sourceObjectId)
      if (target['objectId'] === sourceObjectId) {
        // Clone the node and target to avoid mutation
        const newTarget: Record<string, unknown> = { ...target, objectId: newObjectId };

        // If it's a block ref, also remap the blockId
        if (target['kind'] === 'block' && typeof target['blockId'] === 'string') {
          const newBlockId = idMap.get(target['blockId'] as string);
          if (newBlockId) {
            newTarget['blockId'] = newBlockId;
          }
        }

        return { ...node, target: newTarget };
      }

      // External ref - return unchanged
      return node;
    }

    // Handle link nodes (they have children that might contain refs)
    if (node['t'] === 'link' && isInlineNodeArray(node['children'])) {
      return {
        ...node,
        children: remapInlineRefs(
          node['children'] as Array<Record<string, unknown>>,
          sourceObjectId,
          newObjectId,
          idMap
        ),
      };
    }

    // All other nodes - return unchanged
    return node;
  });
}

/**
 * Remap internal refs in block content.
 *
 * Parses content JSON, walks inline nodes recursively, and remaps any refs
 * where target.objectId matches the source object being duplicated.
 *
 * @param contentJson - The block content as a JSON string
 * @param blockType - The block type (determines content structure)
 * @param sourceObjectId - The original object ID being duplicated
 * @param newObjectId - The new object ID for the duplicate
 * @param idMap - Map of old block IDs to new block IDs
 * @returns Transformed content JSON string with remapped refs
 */
function remapContentRefs(
  contentJson: string,
  blockType: string,
  sourceObjectId: string,
  newObjectId: string,
  idMap: Map<string, string>
): string {
  // Parse content
  const content = JSON.parse(contentJson) as unknown;

  if (!isObject(content)) {
    return contentJson;
  }

  // Check if this block type can contain inline content with refs
  const hasInlineContent =
    blockType === 'paragraph' ||
    blockType === 'heading' ||
    blockType === 'list_item' ||
    blockType === 'footnote_def';

  if (hasInlineContent && isInlineNodeArray(content['inline'])) {
    const remappedInline = remapInlineRefs(
      content['inline'] as Array<Record<string, unknown>>,
      sourceObjectId,
      newObjectId,
      idMap
    );
    return JSON.stringify({ ...content, inline: remappedInline });
  }

  // Handle table content (cells contain inline nodes)
  if (blockType === 'table' && Array.isArray(content['rows'])) {
    const remappedRows = (content['rows'] as unknown[]).map((row) => {
      if (!isObject(row) || !Array.isArray(row['cells'])) {
        return row;
      }

      const remappedCells = (row['cells'] as unknown[]).map((cell) => {
        if (isInlineNodeArray(cell)) {
          return remapInlineRefs(cell, sourceObjectId, newObjectId, idMap);
        }
        return cell;
      });

      return { ...row, cells: remappedCells };
    });

    return JSON.stringify({ ...content, rows: remappedRows });
  }

  // No refs to remap - return unchanged
  return contentJson;
}

/**
 * Duplicate an object and all its blocks.
 *
 * Phase 5: Error handling
 * - Validates object exists and is not deleted
 * - Prevents duplication of DailyNote objects
 * - Creates new object with " (Copy)" suffix
 * - Clones all blocks with new IDs
 * - Preserves block tree structure via parentBlockId remapping
 * - Remaps internal refs to new IDs (Phase 4)
 *
 * @param db - Database connection
 * @param objectId - Source object ID to duplicate
 * @returns Response with new object metadata and block count
 * @throws {ApiError} NOT_FOUND_OBJECT if object doesn't exist or is deleted
 * @throws {ApiError} INVARIANT_DAILY_NOTE_NOT_DUPLICABLE if object is a DailyNote
 */
export function duplicateObject(db: TypenoteDb, objectId: string): DuplicateObjectResponse {
  // ─────────────────────────────────────────────────────────────────────────────
  // Phase 5: Validation Checks
  // ─────────────────────────────────────────────────────────────────────────────

  // 1. Fetch source object (including deletedAt for soft delete check)
  const sourceObject = db
    .select({
      id: objects.id,
      typeId: objects.typeId,
      title: objects.title,
      properties: objects.properties,
      deletedAt: objects.deletedAt,
    })
    .from(objects)
    .where(eq(objects.id, objectId))
    .limit(1)
    .all()[0];

  // Check object exists
  if (!sourceObject) {
    throw notFoundObject(objectId);
  }

  // Check object is not soft-deleted
  if (sourceObject.deletedAt !== null) {
    throw notFoundObject(objectId);
  }

  // 2. Check if object type is DailyNote (cannot be duplicated)
  const objectType = getObjectType(db, sourceObject.typeId);
  if (!objectType) {
    throw new Error(`Object type not found: ${sourceObject.typeId}`);
  }

  if (objectType.key === 'DailyNote') {
    throw dailyNoteNotDuplicable(objectId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Happy Path: Clone Object and Blocks
  // ─────────────────────────────────────────────────────────────────────────────

  // 3. Generate new object ID
  const newObjectId = generateId();

  // 4. Clone object with new title
  const newTitle = `${sourceObject.title} (Copy)`;
  const now = new Date();

  // 5. Fetch all blocks for source object
  const sourceBlocks = db.select().from(blocks).where(eq(blocks.objectId, objectId)).all();

  // 6. Build ID mapping: oldBlockId -> newBlockId
  const idMap = new Map<string, string>();
  for (const block of sourceBlocks) {
    idMap.set(block.id, generateId());
  }

  // 7. Clone each block with remapped IDs and transformed content
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

    // Remap internal refs in content (Phase 4)
    const transformedContent = remapContentRefs(
      block.content,
      block.blockType,
      objectId,
      newObjectId,
      idMap
    );

    return {
      id: newBlockId,
      objectId: newObjectId,
      parentBlockId: newParentBlockId,
      orderKey: block.orderKey, // Preserve order
      blockType: block.blockType,
      content: transformedContent, // Phase 4: Remapped refs
      meta: block.meta,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  });

  // 8. Single atomic transaction: insert object + all blocks
  db.atomic(() => {
    // Insert new object
    db.insert(objects)
      .values({
        id: newObjectId,
        typeId: sourceObject.typeId,
        title: newTitle,
        properties: sourceObject.properties ?? '{}',
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

  // 9. Return response
  return {
    object: {
      id: newObjectId,
      typeId: sourceObject.typeId,
      title: newTitle,
      properties: sourceObject.properties ? JSON.parse(sourceObject.properties) : {},
      docVersion: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    blockCount: duplicatedBlocks.length,
  };
}
