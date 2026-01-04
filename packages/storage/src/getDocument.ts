/**
 * Document reading functions.
 *
 * Retrieves the ordered block tree for an object.
 */

import { eq, and, isNull } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { objects, blocks } from './schema.js';

/**
 * Block in document tree.
 */
export interface DocumentBlock {
  id: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: unknown;
  meta: { collapsed?: boolean } | null;
  children: DocumentBlock[];
}

/**
 * Result of getDocument.
 */
export interface GetDocumentResult {
  objectId: string;
  docVersion: number;
  blocks: DocumentBlock[];
}

/**
 * Options for getDocument.
 */
export interface GetDocumentOptions {
  /** Include soft-deleted blocks. Default: false */
  includeDeleted?: boolean;
}

/**
 * Error thrown when object is not found.
 */
export class DocumentNotFoundError extends Error {
  constructor(objectId: string) {
    super(`NOT_FOUND_OBJECT: ${objectId}`);
    this.name = 'DocumentNotFoundError';
  }
}

/**
 * Get the document for an object as an ordered block tree.
 *
 * @param db - Database connection
 * @param objectId - Object ID to get document for
 * @param options - Options
 * @returns Document with ordered block tree
 * @throws DocumentNotFoundError if object doesn't exist or is deleted
 */
export function getDocument(
  db: TypenoteDb,
  objectId: string,
  options: GetDocumentOptions = {}
): GetDocumentResult {
  const { includeDeleted = false } = options;

  // Get the object
  const obj = db
    .select({ id: objects.id, docVersion: objects.docVersion })
    .from(objects)
    .where(and(eq(objects.id, objectId), isNull(objects.deletedAt)))
    .limit(1)
    .all()[0];

  if (!obj) {
    throw new DocumentNotFoundError(objectId);
  }

  // Get all blocks for this object
  const blockRows = includeDeleted
    ? db.select().from(blocks).where(eq(blocks.objectId, objectId)).all()
    : db
        .select()
        .from(blocks)
        .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
        .all();

  // Build lookup map by ID
  const blockMap = new Map<
    string,
    {
      id: string;
      parentBlockId: string | null;
      orderKey: string;
      blockType: string;
      content: string;
      meta: string | null;
    }
  >();

  for (const row of blockRows) {
    blockMap.set(row.id, row);
  }

  // Build parent -> children map
  const childrenMap = new Map<string | null, string[]>();

  for (const row of blockRows) {
    const parentId = row.parentBlockId;
    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }
    childrenMap.get(parentId)?.push(row.id);
  }

  // Sort children by orderKey within each parent
  for (const [, children] of childrenMap) {
    children.sort((a, b) => {
      const aKey = blockMap.get(a)?.orderKey ?? '';
      const bKey = blockMap.get(b)?.orderKey ?? '';
      return aKey.localeCompare(bKey);
    });
  }

  // Recursively build tree
  function buildSubtree(blockId: string): DocumentBlock | null {
    const row = blockMap.get(blockId);
    if (!row) return null;

    const childIds = childrenMap.get(blockId) ?? [];
    const children: DocumentBlock[] = [];

    for (const childId of childIds) {
      const child = buildSubtree(childId);
      if (child) {
        children.push(child);
      }
    }

    return {
      id: row.id,
      parentBlockId: row.parentBlockId,
      orderKey: row.orderKey,
      blockType: row.blockType,
      content: JSON.parse(row.content),
      meta: row.meta ? JSON.parse(row.meta) : null,
      children,
    };
  }

  // Get root block IDs (parentBlockId is null)
  const rootIds = childrenMap.get(null) ?? [];
  const rootBlocks: DocumentBlock[] = [];

  for (const rootId of rootIds) {
    const block = buildSubtree(rootId);
    if (block) {
      rootBlocks.push(block);
    }
  }

  return {
    objectId,
    docVersion: obj.docVersion,
    blocks: rootBlocks,
  };
}
