/**
 * Integration test context with pre-seeded types and helper methods.
 * Extends the basic TestContext pattern from packages/storage.
 */

import { beforeEach, afterEach } from 'vitest';
import {
  createTestDb,
  closeDb,
  seedBuiltInTypes,
  getObjectTypeByKey,
  objects,
  blocks,
  type TypenoteDb,
} from '@typenote/storage';
import { generateId } from '@typenote/core';

/**
 * Extended context for integration tests with pre-seeded built-in types.
 */
export interface IntegrationTestContext {
  db: TypenoteDb;
  pageTypeId: string;
  dailyNoteTypeId: string;
  personTypeId: string;
  eventTypeId: string;
  placeTypeId: string;
}

/**
 * Creates an integration test context with all built-in types seeded.
 */
export function createIntegrationContext(): IntegrationTestContext {
  const db = createTestDb();
  seedBuiltInTypes(db);

  const pageType = getObjectTypeByKey(db, 'Page');
  const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
  const personType = getObjectTypeByKey(db, 'Person');
  const eventType = getObjectTypeByKey(db, 'Event');
  const placeType = getObjectTypeByKey(db, 'Place');

  if (!pageType || !dailyNoteType || !personType || !eventType || !placeType) {
    throw new Error('Failed to seed built-in types');
  }

  return {
    db,
    pageTypeId: pageType.id,
    dailyNoteTypeId: dailyNoteType.id,
    personTypeId: personType.id,
    eventTypeId: eventType.id,
    placeTypeId: placeType.id,
  };
}

/**
 * Cleans up the integration test context.
 */
export function cleanupIntegrationContext(ctx: IntegrationTestContext): void {
  closeDb(ctx.db);
}

/**
 * Sets up beforeEach/afterEach hooks for integration tests.
 */
export function setupIntegrationContext(): () => IntegrationTestContext {
  let ctx: IntegrationTestContext;

  beforeEach(() => {
    ctx = createIntegrationContext();
  });

  afterEach(() => {
    cleanupIntegrationContext(ctx);
  });

  return () => ctx;
}

/**
 * Helper to create a Page object directly in the database.
 */
export function createPage(db: TypenoteDb, typeId: string, title: string): string {
  const id = generateId();
  const now = new Date();

  db.insert(objects)
    .values({
      id,
      typeId,
      title,
      docVersion: 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return id;
}

/**
 * Helper to insert a block directly in the database.
 */
export function insertBlock(
  db: TypenoteDb,
  objectId: string,
  parentBlockId: string | null,
  orderKey: string,
  blockType: string,
  content: unknown
): string {
  const id = generateId();
  const now = new Date();

  db.insert(blocks)
    .values({
      id,
      objectId,
      parentBlockId,
      orderKey,
      blockType,
      content: JSON.stringify(content),
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return id;
}

// Re-export commonly used items
export {
  createTestDb,
  closeDb,
  applyBlockPatch,
  type TypenoteDb,
  type ApplyBlockPatchOutcome,
} from '@typenote/storage';
export { generateId } from '@typenote/core';
export type { ApplyBlockPatchInput } from '@typenote/api';
