import { afterEach, describe, expect, it, vi } from 'vitest';

import { generateBlockId, isValidBlockId, normalizeBlockId } from './block-id-utils.js';

describe('block-id-utils', () => {
  describe('generateBlockId', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('generates a 6-character id', () => {
      const id = generateBlockId();
      expect(id).toHaveLength(6);
      expect(id).toMatch(/^[a-z0-9]{6}$/);
    });

    it('avoids collisions with existing ids', () => {
      const aValue = 0;
      const bValue = 1 / 36 + 0.0001;
      const sequence = [...Array(6).fill(aValue), ...Array(6).fill(bValue)];
      let call = 0;
      vi.spyOn(Math, 'random').mockImplementation(() => sequence[call++] ?? bValue);

      const id = generateBlockId(new Set(['aaaaaa']));
      expect(id).toBe('bbbbbb');
    });

    it('falls back to a timestamp-based id when collisions persist', () => {
      const now = 1700000000000;
      vi.spyOn(Math, 'random').mockReturnValue(0);
      vi.spyOn(Date, 'now').mockReturnValue(now);

      const id = generateBlockId(new Set(['aaaaaa']));
      expect(id).toBe(now.toString(36).slice(-6));
      expect(id).not.toBe('aaaaaa');
    });
  });

  describe('isValidBlockId', () => {
    it('accepts valid ids', () => {
      expect(isValidBlockId('alpha')).toBe(true);
      expect(isValidBlockId('_start')).toBe(true);
      expect(isValidBlockId('alpha-1_beta')).toBe(true);
    });

    it('rejects invalid ids', () => {
      expect(isValidBlockId('')).toBe(false);
      expect(isValidBlockId('1start')).toBe(false);
      expect(isValidBlockId('-nope')).toBe(false);
      expect(isValidBlockId('a'.repeat(65))).toBe(false);
    });
  });

  describe('normalizeBlockId', () => {
    it('lowercases ids', () => {
      expect(normalizeBlockId('AbC123')).toBe('abc123');
    });
  });
});
