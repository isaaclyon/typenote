/**
 * Test fixture utilities for storage tests.
 * These helpers simplify setup in unit and integration tests.
 */

import { generateId } from '@typenote/core';
import { eq, isNull, and } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { objectTypes, objects, blocks } from './schema.js';

/**
 * Create a test object type and return its ID.
 */
export function createTestObjectType(db: TypenoteDb, key: string): string {
  const id = generateId();
  const now = new Date();

  db.insert(objectTypes)
    .values({
      id,
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      builtIn: false,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  return id;
}

/**
 * Create a test object and return its ID.
 */
export function createTestObject(db: TypenoteDb, typeId: string, title: string): string {
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
 * Create a test block and return its ID.
 */
export function createTestBlock(
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

/**
 * Block row as returned from database with camelCase field names.
 */
export interface BlockRow {
  id: string;
  objectId: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: string;
  meta: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Get a block by ID, or null if not found.
 */
export function getBlockById(db: TypenoteDb, blockId: string): BlockRow | null {
  const result = db.select().from(blocks).where(eq(blocks.id, blockId)).limit(1).all();

  return result[0] ?? null;
}

/**
 * Get all non-deleted blocks for an object.
 */
export function getAllBlocks(db: TypenoteDb, objectId: string): BlockRow[] {
  return db
    .select()
    .from(blocks)
    .where(and(eq(blocks.objectId, objectId), isNull(blocks.deletedAt)))
    .all();
}
