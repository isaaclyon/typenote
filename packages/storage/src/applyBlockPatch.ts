/**
 * Block patch application.
 *
 * Implements the core write pathway for document editing.
 */

import { eq, and, isNull } from 'drizzle-orm';
import type {
  ApplyBlockPatchInput,
  ApplyBlockPatchResult,
  ApiError,
  InsertBlockOp,
  UpdateBlockOp,
  MoveBlockOp,
  DeleteBlockOp,
  BlockType,
} from '@typenote/api';
import {
  notFoundObject,
  notFoundBlock,
  versionConflict,
  validationError,
  crossObjectError,
  parentDeletedError,
  cycleError,
  validateBlockContent,
} from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objects, blocks, idempotency } from './schema.js';
import { generateOrderKey, type SiblingInfo } from './orderKeys.js';
import { wouldCreateCycle } from './cycleDetection.js';

/**
 * Result of applyBlockPatch.
 */
export type ApplyBlockPatchOutcome =
  | { success: true; result: ApplyBlockPatchResult }
  | { success: false; error: ApiError };

/**
 * ULID regex pattern.
 */
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/**
 * Apply a block patch to a document.
 *
 * @param db - Database connection
 * @param input - Patch input
 * @returns Success with result, or failure with error
 */
export function applyBlockPatch(
  db: TypenoteDb,
  input: ApplyBlockPatchInput
): ApplyBlockPatchOutcome {
  // 1. Input validation
  if (input.apiVersion !== 'v1') {
    return {
      success: false,
      error: validationError('apiVersion', 'Must be v1'),
    };
  }

  if (!ULID_PATTERN.test(input.objectId)) {
    return {
      success: false,
      error: validationError('objectId', 'Must be a valid ULID'),
    };
  }

  // 2. Get object (check existence)
  const obj = db
    .select({ id: objects.id, docVersion: objects.docVersion })
    .from(objects)
    .where(and(eq(objects.id, input.objectId), isNull(objects.deletedAt)))
    .limit(1)
    .all()[0];

  if (!obj) {
    return {
      success: false,
      error: notFoundObject(input.objectId),
    };
  }

  // 3. Version check
  if (input.baseDocVersion !== undefined && input.baseDocVersion !== obj.docVersion) {
    return {
      success: false,
      error: versionConflict(input.baseDocVersion, obj.docVersion),
    };
  }

  // 4. Idempotency check
  if (input.idempotencyKey) {
    const cached = db
      .select({ resultJson: idempotency.resultJson })
      .from(idempotency)
      .where(
        and(eq(idempotency.objectId, input.objectId), eq(idempotency.key, input.idempotencyKey))
      )
      .limit(1)
      .all()[0];

    if (cached) {
      return {
        success: true,
        result: JSON.parse(cached.resultJson) as ApplyBlockPatchResult,
      };
    }
  }

  // 5. Apply ops
  const applied = {
    insertedBlockIds: [] as string[],
    updatedBlockIds: [] as string[],
    movedBlockIds: [] as string[],
    deletedBlockIds: [] as string[],
  };

  // Process each operation
  for (const op of input.ops) {
    switch (op.op) {
      case 'block.insert': {
        const insertResult = applyInsert(db, op, input.objectId);
        if (!insertResult.success) {
          return insertResult;
        }
        applied.insertedBlockIds.push(op.blockId);
        break;
      }
      case 'block.update': {
        const updateResult = applyUpdate(db, op, input.objectId);
        if (!updateResult.success) {
          return updateResult;
        }
        applied.updatedBlockIds.push(op.blockId);
        break;
      }
      case 'block.move': {
        const moveResult = applyMove(db, op, input.objectId);
        if (!moveResult.success) {
          return moveResult;
        }
        applied.movedBlockIds.push(op.blockId);
        break;
      }
      case 'block.delete': {
        const deleteResult = applyDelete(db, op, input.objectId);
        if (!deleteResult.success) {
          return deleteResult;
        }
        applied.deletedBlockIds.push(...deleteResult.deletedIds);
        break;
      }
    }
  }

  // 6. Increment version
  const previousDocVersion = obj.docVersion;
  const newDocVersion = previousDocVersion + 1;

  db.run('UPDATE objects SET doc_version = ?, updated_at = ? WHERE id = ?', [
    newDocVersion,
    Date.now(),
    input.objectId,
  ]);

  // 7. Build result
  const result: ApplyBlockPatchResult = {
    apiVersion: 'v1',
    objectId: input.objectId,
    previousDocVersion,
    newDocVersion,
    applied,
  };

  // 8. Store idempotency result
  if (input.idempotencyKey) {
    db.insert(idempotency)
      .values({
        objectId: input.objectId,
        key: input.idempotencyKey,
        resultJson: JSON.stringify(result),
        createdAt: new Date(),
      })
      .run();
  }

  return { success: true, result };
}

/**
 * Apply a block.insert operation.
 */
function applyInsert(
  db: TypenoteDb,
  op: InsertBlockOp,
  objectId: string
): { success: true } | { success: false; error: ApiError } {
  // 1. Validate parent if specified
  if (op.parentBlockId !== null) {
    const parent = db
      .select({
        id: blocks.id,
        objectId: blocks.objectId,
        deletedAt: blocks.deletedAt,
      })
      .from(blocks)
      .where(eq(blocks.id, op.parentBlockId))
      .limit(1)
      .all()[0];

    if (!parent) {
      return { success: false, error: notFoundBlock(op.parentBlockId) };
    }

    if (parent.deletedAt !== null) {
      return { success: false, error: parentDeletedError(op.parentBlockId) };
    }

    if (parent.objectId !== objectId) {
      return {
        success: false,
        error: crossObjectError(objectId, parent.objectId),
      };
    }
  }

  // 2. Validate content schema
  const contentValidation = validateBlockContent(op.blockType as BlockType, op.content);
  if (!contentValidation.valid) {
    const firstError = contentValidation.errors[0];
    return {
      success: false,
      error: validationError(
        firstError?.path ?? 'content',
        firstError?.message ?? 'Invalid content'
      ),
    };
  }

  // 3. Get siblings for order key generation
  const siblings = db
    .select({ id: blocks.id, orderKey: blocks.orderKey })
    .from(blocks)
    .where(
      and(
        eq(blocks.objectId, objectId),
        op.parentBlockId === null
          ? isNull(blocks.parentBlockId)
          : eq(blocks.parentBlockId, op.parentBlockId),
        isNull(blocks.deletedAt)
      )
    )
    .all() as SiblingInfo[];

  // 4. Generate order key
  let orderKey: string;
  try {
    orderKey = generateOrderKey(siblings, op.place, op.orderKey);
  } catch (err) {
    // OrderKeyError for sibling not found
    if (err instanceof Error && err.message.includes('not found')) {
      const siblingId =
        op.place && 'siblingBlockId' in op.place ? op.place.siblingBlockId : 'unknown';
      return { success: false, error: notFoundBlock(siblingId) };
    }
    throw err;
  }

  // 5. Insert the block
  const now = new Date();
  db.insert(blocks)
    .values({
      id: op.blockId,
      objectId,
      parentBlockId: op.parentBlockId,
      orderKey,
      blockType: op.blockType,
      content: JSON.stringify(op.content),
      meta: op.meta ? JSON.stringify(op.meta) : null,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return { success: true };
}

/**
 * Apply a block.update operation.
 */
function applyUpdate(
  db: TypenoteDb,
  op: UpdateBlockOp,
  objectId: string
): { success: true } | { success: false; error: ApiError } {
  // 1. Get existing block
  const existing = db
    .select({
      id: blocks.id,
      objectId: blocks.objectId,
      blockType: blocks.blockType,
      deletedAt: blocks.deletedAt,
    })
    .from(blocks)
    .where(eq(blocks.id, op.blockId))
    .limit(1)
    .all()[0];

  // 2. Validate block exists
  if (!existing) {
    return { success: false, error: notFoundBlock(op.blockId) };
  }

  // 3. Validate block is not deleted
  if (existing.deletedAt !== null) {
    return { success: false, error: notFoundBlock(op.blockId) };
  }

  // 4. Validate same object
  if (existing.objectId !== objectId) {
    return {
      success: false,
      error: crossObjectError(objectId, existing.objectId),
    };
  }

  // 5. Validate block type change (forbidden in v1)
  if (op.patch.blockType !== undefined && op.patch.blockType !== existing.blockType) {
    return {
      success: false,
      error: validationError('blockType', 'Changing block type is not allowed in v1'),
    };
  }

  // 6. Validate content schema if content is being updated
  if (op.patch.content !== undefined) {
    const contentValidation = validateBlockContent(
      existing.blockType as BlockType,
      op.patch.content
    );
    if (!contentValidation.valid) {
      const firstError = contentValidation.errors[0];
      return {
        success: false,
        error: validationError(
          firstError?.path ?? 'content',
          firstError?.message ?? 'Invalid content'
        ),
      };
    }
  }

  // 7. Build update fields
  const updates: string[] = [];
  const values: unknown[] = [];

  if (op.patch.content !== undefined) {
    updates.push('content = ?');
    values.push(JSON.stringify(op.patch.content));
  }

  if (op.patch.meta !== undefined) {
    updates.push('meta = ?');
    values.push(JSON.stringify(op.patch.meta));
  }

  // Always update updatedAt
  updates.push('updated_at = ?');
  values.push(Date.now());

  // Add blockId for WHERE clause
  values.push(op.blockId);

  // 8. Execute update
  if (updates.length > 0) {
    db.run(`UPDATE blocks SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  return { success: true };
}

/**
 * Apply a block.move operation.
 */
function applyMove(
  db: TypenoteDb,
  op: MoveBlockOp,
  objectId: string
): { success: true } | { success: false; error: ApiError } {
  // 1. Get existing block
  const existing = db
    .select({
      id: blocks.id,
      objectId: blocks.objectId,
      deletedAt: blocks.deletedAt,
    })
    .from(blocks)
    .where(eq(blocks.id, op.blockId))
    .limit(1)
    .all()[0];

  // 2. Validate block exists
  if (!existing) {
    return { success: false, error: notFoundBlock(op.blockId) };
  }

  // 3. Validate block is not deleted
  if (existing.deletedAt !== null) {
    return { success: false, error: notFoundBlock(op.blockId) };
  }

  // 4. Validate same object
  if (existing.objectId !== objectId) {
    return {
      success: false,
      error: crossObjectError(objectId, existing.objectId),
    };
  }

  // 5. Validate new parent if specified
  if (op.newParentBlockId !== null) {
    const newParent = db
      .select({
        id: blocks.id,
        objectId: blocks.objectId,
        deletedAt: blocks.deletedAt,
      })
      .from(blocks)
      .where(eq(blocks.id, op.newParentBlockId))
      .limit(1)
      .all()[0];

    if (!newParent) {
      return { success: false, error: notFoundBlock(op.newParentBlockId) };
    }

    if (newParent.deletedAt !== null) {
      return {
        success: false,
        error: parentDeletedError(op.newParentBlockId),
      };
    }

    if (newParent.objectId !== objectId) {
      return {
        success: false,
        error: crossObjectError(objectId, newParent.objectId),
      };
    }
  }

  // 6. Cycle detection
  if (wouldCreateCycle(db, op.blockId, op.newParentBlockId, objectId)) {
    return {
      success: false,
      error: cycleError(op.blockId, op.newParentBlockId ?? 'null'),
    };
  }

  // 7. Get siblings for order key generation (at new location)
  const siblings = db
    .select({ id: blocks.id, orderKey: blocks.orderKey })
    .from(blocks)
    .where(
      and(
        eq(blocks.objectId, objectId),
        op.newParentBlockId === null
          ? isNull(blocks.parentBlockId)
          : eq(blocks.parentBlockId, op.newParentBlockId),
        isNull(blocks.deletedAt)
      )
    )
    .all() as SiblingInfo[];

  // 8. Generate order key
  let orderKey: string;
  try {
    orderKey = generateOrderKey(siblings, op.place, op.orderKey);
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      const siblingId =
        op.place && 'siblingBlockId' in op.place ? op.place.siblingBlockId : 'unknown';
      return { success: false, error: notFoundBlock(siblingId) };
    }
    throw err;
  }

  // 9. Execute move
  db.run('UPDATE blocks SET parent_block_id = ?, order_key = ?, updated_at = ? WHERE id = ?', [
    op.newParentBlockId,
    orderKey,
    Date.now(),
    op.blockId,
  ]);

  return { success: true };
}

/**
 * Apply a block.delete operation.
 */
function applyDelete(
  db: TypenoteDb,
  op: DeleteBlockOp,
  objectId: string
): { success: true; deletedIds: string[] } | { success: false; error: ApiError } {
  // 1. Get existing block
  const existing = db
    .select({
      id: blocks.id,
      objectId: blocks.objectId,
      deletedAt: blocks.deletedAt,
    })
    .from(blocks)
    .where(eq(blocks.id, op.blockId))
    .limit(1)
    .all()[0];

  // 2. Validate block exists
  if (!existing) {
    return { success: false, error: notFoundBlock(op.blockId) };
  }

  // 3. Validate same object
  if (existing.objectId !== objectId) {
    return {
      success: false,
      error: crossObjectError(objectId, existing.objectId),
    };
  }

  // 4. Collect blocks to delete
  const deletedIds: string[] = [];
  const now = Date.now();

  if (op.subtree) {
    // Recursively collect all descendants
    const collectDescendants = (blockId: string): void => {
      deletedIds.push(blockId);
      const children = db
        .select({ id: blocks.id })
        .from(blocks)
        .where(
          and(
            eq(blocks.parentBlockId, blockId),
            eq(blocks.objectId, objectId),
            isNull(blocks.deletedAt)
          )
        )
        .all();

      for (const child of children) {
        collectDescendants(child.id);
      }
    };

    collectDescendants(op.blockId);
  } else {
    deletedIds.push(op.blockId);
  }

  // 5. Soft-delete all collected blocks
  for (const id of deletedIds) {
    db.run('UPDATE blocks SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL', [now, id]);
  }

  return { success: true, deletedIds };
}
