import { describe, expect, it } from 'vitest';
import { generateId, isValidUlid, parseUlid } from './ids.js';

describe('generateId', () => {
  it('returns a 26-character ULID string', () => {
    const id = generateId();

    expect(id).toHaveLength(26);
  });

  it('returns unique IDs on successive calls', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
  });

  it('returns IDs that pass ULID validation', () => {
    const id = generateId();

    expect(isValidUlid(id)).toBe(true);
  });
});

describe('isValidUlid', () => {
  it('returns true for valid ULID', () => {
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAV')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidUlid('')).toBe(false);
  });

  it('returns false for wrong length', () => {
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FA')).toBe(false); // 25 chars
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAVX')).toBe(false); // 27 chars
  });

  it('returns false for invalid characters (I, L, O, U)', () => {
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAI')).toBe(false); // I
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAL')).toBe(false); // L
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAO')).toBe(false); // O
    expect(isValidUlid('01ARZ3NDEKTSV4RRFFQ69G5FAU')).toBe(false); // U
  });

  it('returns false for lowercase', () => {
    expect(isValidUlid('01arz3ndektsv4rrffq69g5fav')).toBe(false);
  });
});

describe('parseUlid', () => {
  it('extracts timestamp from ULID', () => {
    // ULID encodes timestamp in first 10 characters
    const id = generateId();
    const result = parseUlid(id);

    expect(result.timestamp).toBeInstanceOf(Date);
    // Timestamp should be recent (within last second)
    expect(Date.now() - result.timestamp.getTime()).toBeLessThan(1000);
  });

  it('throws for invalid ULID', () => {
    expect(() => parseUlid('invalid')).toThrow();
  });

  it('throws with specific error message for invalid ULID', () => {
    // Tests that our validation runs (not just ulid library's validation)
    expect(() => parseUlid('invalid')).toThrow('Invalid ULID: invalid');
  });

  it('throws before calling decodeTime for invalid format', () => {
    // A 26-char string with invalid ULID chars (lowercase) - our validation catches it
    const invalidUlid = '01arz3ndektsv4rrffq69g5fav'; // lowercase is invalid
    expect(() => parseUlid(invalidUlid)).toThrow('Invalid ULID');
  });
});
