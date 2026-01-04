import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { createTestObjectType, createTestObject, createTestBlock } from './testFixtures.js';
import { wouldCreateCycle, getAncestors } from './cycleDetection.js';

describe('wouldCreateCycle', () => {
  let db: TypenoteDb;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    const typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  it('returns false when moving to root (null parent)', () => {
    const block = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });

    const result = wouldCreateCycle(db, block, null, objectId);

    expect(result).toBe(false);
  });

  it('returns false when moving to unrelated block', () => {
    // Create two separate root blocks
    const blockA = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const blockB = createTestBlock(db, objectId, null, 'b', 'paragraph', {
      inline: [],
    });

    // Moving blockA under blockB (unrelated) should not create cycle
    const result = wouldCreateCycle(db, blockA, blockB, objectId);

    expect(result).toBe(false);
  });

  it('returns true when moving block under itself', () => {
    const block = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });

    const result = wouldCreateCycle(db, block, block, objectId);

    expect(result).toBe(true);
  });

  it('returns true when moving block under direct child', () => {
    const parent = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const child = createTestBlock(db, objectId, parent, 'a', 'paragraph', {
      inline: [],
    });

    // Moving parent under its child would create a cycle
    const result = wouldCreateCycle(db, parent, child, objectId);

    expect(result).toBe(true);
  });

  it('returns true when moving block under grandchild', () => {
    const grandparent = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const parent = createTestBlock(db, objectId, grandparent, 'a', 'paragraph', { inline: [] });
    const child = createTestBlock(db, objectId, parent, 'a', 'paragraph', {
      inline: [],
    });

    // Moving grandparent under grandchild would create a cycle
    const result = wouldCreateCycle(db, grandparent, child, objectId);

    expect(result).toBe(true);
  });

  it('returns true when moving block under deeply nested descendant', () => {
    // Create a chain: root -> A -> B -> C -> D
    const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const a = createTestBlock(db, objectId, root, 'a', 'paragraph', {
      inline: [],
    });
    const b = createTestBlock(db, objectId, a, 'a', 'paragraph', { inline: [] });
    const c = createTestBlock(db, objectId, b, 'a', 'paragraph', { inline: [] });
    const d = createTestBlock(db, objectId, c, 'a', 'paragraph', { inline: [] });

    // Moving root under D would create a cycle
    const result = wouldCreateCycle(db, root, d, objectId);

    expect(result).toBe(true);
  });

  it('returns false when moving sibling under another sibling', () => {
    const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const siblingA = createTestBlock(db, objectId, root, 'a', 'paragraph', {
      inline: [],
    });
    const siblingB = createTestBlock(db, objectId, root, 'b', 'paragraph', {
      inline: [],
    });

    // Moving siblingA under siblingB (both are children of root)
    const result = wouldCreateCycle(db, siblingA, siblingB, objectId);

    expect(result).toBe(false);
  });

  it('handles complex tree structures correctly', () => {
    // Create a more complex tree:
    //       root
    //      /    \
    //     A      B
    //    / \      \
    //   C   D      E
    //  /
    // F

    const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const a = createTestBlock(db, objectId, root, 'a', 'paragraph', {
      inline: [],
    });
    const b = createTestBlock(db, objectId, root, 'b', 'paragraph', {
      inline: [],
    });
    const c = createTestBlock(db, objectId, a, 'a', 'paragraph', { inline: [] });
    const d = createTestBlock(db, objectId, a, 'b', 'paragraph', { inline: [] });
    const e = createTestBlock(db, objectId, b, 'a', 'paragraph', { inline: [] });
    const f = createTestBlock(db, objectId, c, 'a', 'paragraph', { inline: [] });

    // A under F (its descendant) = cycle
    expect(wouldCreateCycle(db, a, f, objectId)).toBe(true);

    // root under E (its descendant) = cycle
    expect(wouldCreateCycle(db, root, e, objectId)).toBe(true);

    // D under E (cousin) = no cycle
    expect(wouldCreateCycle(db, d, e, objectId)).toBe(false);

    // F under B (uncle) = no cycle
    expect(wouldCreateCycle(db, f, b, objectId)).toBe(false);
  });
});

describe('getAncestors', () => {
  let db: TypenoteDb;
  let objectId: string;

  beforeEach(() => {
    db = createTestDb();
    const typeId = createTestObjectType(db, 'page');
    objectId = createTestObject(db, typeId, 'Test Page');
  });

  afterEach(() => {
    closeDb(db);
  });

  it('returns empty array for root block', () => {
    const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });

    const ancestors = getAncestors(db, root, objectId);

    expect(ancestors).toEqual([]);
  });

  it('returns parent for direct child', () => {
    const parent = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const child = createTestBlock(db, objectId, parent, 'a', 'paragraph', {
      inline: [],
    });

    const ancestors = getAncestors(db, child, objectId);

    expect(ancestors).toEqual([parent]);
  });

  it('returns full chain for deeply nested block', () => {
    const root = createTestBlock(db, objectId, null, 'a', 'paragraph', {
      inline: [],
    });
    const a = createTestBlock(db, objectId, root, 'a', 'paragraph', {
      inline: [],
    });
    const b = createTestBlock(db, objectId, a, 'a', 'paragraph', { inline: [] });
    const c = createTestBlock(db, objectId, b, 'a', 'paragraph', { inline: [] });

    const ancestors = getAncestors(db, c, objectId);

    // Should be in order from immediate parent to root
    expect(ancestors).toEqual([b, a, root]);
  });
});
