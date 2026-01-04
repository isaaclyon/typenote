/**
 * Shared test helpers for applyBlockPatch tests.
 * Provides common setup, teardown, and utility functions.
 */

import { beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { createTestObjectType, createTestObject } from './testFixtures.js';

/**
 * Context object that holds test database and common IDs.
 * Used across all applyBlockPatch test suites.
 */
export interface TestContext {
  db: TypenoteDb;
  typeId: string;
  objectId: string;
}

/**
 * Creates a fresh test context with database, object type, and object.
 * Call this in beforeEach to get an isolated test environment.
 */
export function createTestContext(): TestContext {
  const db = createTestDb();
  const typeId = createTestObjectType(db, 'page');
  const objectId = createTestObject(db, typeId, 'Test Page');
  return { db, typeId, objectId };
}

/**
 * Cleans up the test context by closing the database.
 * Call this in afterEach to properly dispose resources.
 */
export function cleanupTestContext(ctx: TestContext): void {
  closeDb(ctx.db);
}

/**
 * Sets up beforeEach/afterEach hooks for applyBlockPatch tests.
 * Returns a getter function to access the current test context.
 *
 * Usage:
 * ```ts
 * const getCtx = setupTestContext();
 *
 * it('test case', () => {
 *   const { db, objectId } = getCtx();
 *   // ... test code
 * });
 * ```
 */
export function setupTestContext(): () => TestContext {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext();
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  return () => ctx;
}

// Re-export commonly used items for convenience
export { createTestDb, closeDb, type TypenoteDb } from './db.js';
export {
  createTestObjectType,
  createTestObject,
  createTestBlock,
  getBlockById,
  getAllBlocks,
  type BlockRow,
} from './testFixtures.js';
export { generateId } from '@typenote/core';
export { applyBlockPatch } from './applyBlockPatch.js';
export type { ApplyBlockPatchInput } from '@typenote/api';
