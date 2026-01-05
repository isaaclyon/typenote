/**
 * Custom assertion helpers for integration tests.
 */

import { expect } from 'vitest';
import { eq, isNull, and } from 'drizzle-orm';
import { objects, blocks, refs, type TypenoteDb } from '@typenote/storage';
import type { ApplyBlockPatchOutcome } from '@typenote/storage';
import type { ApiErrorCode } from '@typenote/api';

/**
 * Assert that a patch was applied correctly by checking all affected tables.
 */
export function assertPatchApplied(
  db: TypenoteDb,
  objectId: string,
  expected: {
    docVersion: number;
    blockCount: number;
    refCount?: number;
  }
): void {
  // Check object doc version
  const obj = db.select().from(objects).where(eq(objects.id, objectId)).get();
  expect(obj).toBeDefined();
  if (obj) {
    expect(obj.docVersion).toBe(expected.docVersion);
  }

  // Check block count (non-deleted)
  const blockRows = db
    .select()
    .from(blocks)
    .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
    .all();
  expect(blockRows.length).toBe(expected.blockCount);

  // Check ref count if specified
  if (expected.refCount !== undefined) {
    const refRows = db.select().from(refs).where(eq(refs.sourceObjectId, objectId)).all();
    expect(refRows.length).toBe(expected.refCount);
  }
}

/**
 * Assert that an API error was returned with the expected code.
 */
export function assertApiError(
  outcome: ApplyBlockPatchOutcome,
  expectedCode: ApiErrorCode,
  detailsContain?: Record<string, unknown>
): void {
  expect(outcome.success).toBe(false);
  if (!outcome.success) {
    expect(outcome.error.code).toBe(expectedCode);
    if (detailsContain) {
      expect(outcome.error.details).toMatchObject(detailsContain);
    }
  }
}

/**
 * Assert that a patch succeeded and returned the expected result.
 */
export function assertPatchSuccess(
  outcome: ApplyBlockPatchOutcome,
  expected?: {
    newDocVersion?: number;
    insertedBlockIds?: string[];
  }
): void {
  expect(outcome.success).toBe(true);
  if (outcome.success && expected) {
    if (expected.newDocVersion !== undefined) {
      expect(outcome.result.newDocVersion).toBe(expected.newDocVersion);
    }
    if (expected.insertedBlockIds !== undefined) {
      expect(outcome.result.applied.insertedBlockIds.sort()).toEqual(
        expected.insertedBlockIds.sort()
      );
    }
  }
}

/**
 * Assert that a block exists and has expected properties.
 */
export function assertBlockExists(
  db: TypenoteDb,
  blockId: string,
  expected: {
    objectId?: string;
    parentBlockId?: string | null;
    blockType?: string;
    deleted?: boolean;
  }
): void {
  const block = db.select().from(blocks).where(eq(blocks.id, blockId)).get();
  expect(block).toBeDefined();

  if (block) {
    if (expected.objectId !== undefined) {
      expect(block.objectId).toBe(expected.objectId);
    }
    if (expected.parentBlockId !== undefined) {
      expect(block.parentBlockId).toBe(expected.parentBlockId);
    }
    if (expected.blockType !== undefined) {
      expect(block.blockType).toBe(expected.blockType);
    }
    if (expected.deleted !== undefined) {
      if (expected.deleted) {
        expect(block.deletedAt).not.toBeNull();
      } else {
        expect(block.deletedAt).toBeNull();
      }
    }
  }
}

/**
 * Assert that a block does not exist or is deleted.
 */
export function assertBlockDeleted(db: TypenoteDb, blockId: string): void {
  const block = db.select().from(blocks).where(eq(blocks.id, blockId)).get();
  if (block) {
    expect(block.deletedAt).not.toBeNull();
  }
}

/**
 * Get the current doc version for an object.
 */
export function getDocVersion(db: TypenoteDb, objectId: string): number {
  const obj = db.select().from(objects).where(eq(objects.id, objectId)).get();
  if (!obj) throw new Error(`Object ${objectId} not found`);
  return obj.docVersion;
}
