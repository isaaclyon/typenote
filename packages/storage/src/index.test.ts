import { describe, it, expect } from 'vitest';

import {
  STORAGE_VERSION,
  objectTypes,
  objects,
  blocks,
  refs,
  idempotency,
  FTS_BLOCKS_TABLE_NAME,
  createTestDb,
  createFileDb,
  closeDb,
} from './index.js';

describe('Storage package', () => {
  it('exports storage version', () => {
    expect(STORAGE_VERSION).toBe('0.1.0');
  });

  it('exports all schema tables', () => {
    expect(objectTypes).toBeDefined();
    expect(objects).toBeDefined();
    expect(blocks).toBeDefined();
    expect(refs).toBeDefined();
    expect(idempotency).toBeDefined();
    expect(FTS_BLOCKS_TABLE_NAME).toBe('fts_blocks');
  });

  it('exports database functions', () => {
    expect(typeof createTestDb).toBe('function');
    expect(typeof createFileDb).toBe('function');
    expect(typeof closeDb).toBe('function');
  });
});
