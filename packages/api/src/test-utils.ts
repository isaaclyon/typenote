/**
 * Test utilities for the @typenote/api package
 *
 * Provides shared test constants and helper functions for schema testing.
 */
import { expect } from 'vitest';
import type { ZodSchema, SafeParseReturnType } from 'zod';

// =============================================================================
// Test Constants
// =============================================================================

/** Valid 26-character ULID for testing */
export const VALID_ULID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

/** Second valid ULID for tests requiring multiple IDs */
export const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

/** Third valid ULID for tests requiring three IDs */
export const VALID_ULID_3 = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

// =============================================================================
// Schema Test Helpers
// =============================================================================

/**
 * Asserts that a schema accepts the given data as valid.
 * Provides a detailed error message if validation fails.
 */
export function expectValid<T>(schema: ZodSchema<T>, data: unknown): void {
  const result = schema.safeParse(data);
  if (!result.success) {
    expect.fail(
      `Expected valid but got errors:\n${result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`
    );
  }
  expect(result.success).toBe(true);
}

/**
 * Asserts that a schema rejects the given data as invalid.
 * Optionally checks that the error is at a specific path.
 */
export function expectInvalid<T>(schema: ZodSchema<T>, data: unknown, expectedPath?: string): void {
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
  if (expectedPath !== undefined && !result.success) {
    const paths = result.error.issues.map((i) => i.path.join('.'));
    expect(paths).toContain(expectedPath);
  }
}

/**
 * Parses data with a schema and returns the result for additional assertions.
 * Useful when you need to check the parsed data structure.
 */
export function parseWith<T>(schema: ZodSchema<T>, data: unknown): SafeParseReturnType<unknown, T> {
  return schema.safeParse(data);
}

// =============================================================================
// Test Data Builders
// =============================================================================

/**
 * Creates a minimal valid insert block operation.
 */
export function makeInsertOp(overrides: Record<string, unknown> = {}) {
  return {
    op: 'block.insert',
    blockId: VALID_ULID,
    parentBlockId: null,
    blockType: 'paragraph',
    content: { inline: [] },
    ...overrides,
  };
}

/**
 * Creates a minimal valid update block operation.
 */
export function makeUpdateOp(overrides: Record<string, unknown> = {}) {
  return {
    op: 'block.update',
    blockId: VALID_ULID,
    patch: { content: { inline: [] } },
    ...overrides,
  };
}

/**
 * Creates a minimal valid move block operation.
 */
export function makeMoveOp(overrides: Record<string, unknown> = {}) {
  return {
    op: 'block.move',
    blockId: VALID_ULID,
    newParentBlockId: null,
    ...overrides,
  };
}

/**
 * Creates a minimal valid delete block operation.
 */
export function makeDeleteOp(overrides: Record<string, unknown> = {}) {
  return {
    op: 'block.delete',
    blockId: VALID_ULID,
    ...overrides,
  };
}

/**
 * Creates a minimal valid ApplyBlockPatch input.
 */
export function makePatchInput(overrides: Record<string, unknown> = {}) {
  return {
    apiVersion: 'v1',
    objectId: VALID_ULID,
    ops: [],
    ...overrides,
  };
}

/**
 * Creates a minimal valid ApplyBlockPatch result.
 */
export function makePatchResult(overrides: Record<string, unknown> = {}) {
  return {
    apiVersion: 'v1',
    objectId: VALID_ULID,
    previousDocVersion: 0,
    newDocVersion: 1,
    applied: {
      insertedBlockIds: [],
      updatedBlockIds: [],
      movedBlockIds: [],
      deletedBlockIds: [],
    },
    ...overrides,
  };
}
