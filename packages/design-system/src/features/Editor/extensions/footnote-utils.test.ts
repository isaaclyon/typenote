import { describe, it, expect } from 'vitest';

import { computeFootnoteOrdering, isValidFootnoteKey } from './footnote-utils.js';

describe('computeFootnoteOrdering', () => {
  it('orders defs by first reference, then preserves remaining order', () => {
    const refKeys = ['a', 'b', 'a', 'c'];
    const defKeys = ['b', 'a', 'a', 'd'];

    const result = computeFootnoteOrdering(refKeys, defKeys);

    expect(result.refOrder).toEqual(['a', 'b', 'c']);
    expect(result.missingKeys).toEqual(['c']);
    expect(result.duplicateKeys).toEqual(['a']);
    expect(result.orderedDefIndices).toEqual([1, 0, 2, 3]);
  });

  it('keeps original order when there are no refs', () => {
    const result = computeFootnoteOrdering([], ['x', 'y']);
    expect(result.refOrder).toEqual([]);
    expect(result.missingKeys).toEqual([]);
    expect(result.duplicateKeys).toEqual([]);
    expect(result.orderedDefIndices).toEqual([0, 1]);
  });

  it('flags duplicates even without refs', () => {
    const result = computeFootnoteOrdering([], ['x', 'x']);
    expect(result.refOrder).toEqual([]);
    expect(result.duplicateKeys).toEqual(['x']);
    expect(result.orderedDefIndices).toEqual([0, 1]);
  });

  it('reports missing keys when defs are absent', () => {
    const result = computeFootnoteOrdering(['a'], []);
    expect(result.refOrder).toEqual(['a']);
    expect(result.missingKeys).toEqual(['a']);
    expect(result.orderedDefIndices).toEqual([]);
  });
});

describe('isValidFootnoteKey', () => {
  it('accepts alphanumeric keys with underscores and hyphens', () => {
    expect(isValidFootnoteKey('note1')).toBe(true);
    expect(isValidFootnoteKey('NOTE_2')).toBe(true);
    expect(isValidFootnoteKey('alpha-beta')).toBe(true);
    expect(isValidFootnoteKey('1start')).toBe(true);
  });

  it('rejects invalid characters or empty keys', () => {
    expect(isValidFootnoteKey('')).toBe(false);
    expect(isValidFootnoteKey('space key')).toBe(false);
    expect(isValidFootnoteKey('dots.are.bad')).toBe(false);
    expect(isValidFootnoteKey('caret^no')).toBe(false);
  });
});
