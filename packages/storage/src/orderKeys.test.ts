import { describe, it, expect } from 'vitest';
import type { Place } from '@typenote/api';
import { generateOrderKey, isOrderKeyUnique, OrderKeyError } from './orderKeys.js';

// Sibling type for testing
interface Sibling {
  id: string;
  orderKey: string;
}

describe('generateOrderKey', () => {
  describe('place: start', () => {
    it('generates key before first sibling when siblings exist', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a1' },
      ];
      const place: Place = { where: 'start' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be lexicographically before 'a0'
      expect(key < 'a0').toBe(true);
    });

    it('generates initial key when no siblings exist', () => {
      const siblings: Sibling[] = [];
      const place: Place = { where: 'start' };

      const key = generateOrderKey(siblings, place, undefined);

      // Should generate a valid key
      expect(key.length).toBeGreaterThan(0);
    });
  });

  describe('place: end', () => {
    it('generates key after last sibling', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a1' },
      ];
      const place: Place = { where: 'end' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be lexicographically after 'a1'
      expect(key > 'a1').toBe(true);
    });

    it('generates initial key when no siblings exist', () => {
      const siblings: Sibling[] = [];
      const place: Place = { where: 'end' };

      const key = generateOrderKey(siblings, place, undefined);

      // Should generate a valid key
      expect(key.length).toBeGreaterThan(0);
    });
  });

  describe('place: before', () => {
    it('generates key between prev sibling and target', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a2' },
        { id: 'block3', orderKey: 'a4' },
      ];
      const place: Place = { where: 'before', siblingBlockId: 'block2' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be between 'a0' and 'a2'
      expect(key > 'a0').toBe(true);
      expect(key < 'a2').toBe(true);
    });

    it('generates key before target when target is first', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a2' },
      ];
      const place: Place = { where: 'before', siblingBlockId: 'block1' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be before 'a0'
      expect(key < 'a0').toBe(true);
    });

    it('throws OrderKeyError when sibling does not exist', () => {
      const siblings: Sibling[] = [{ id: 'block1', orderKey: 'a0' }];
      const place: Place = { where: 'before', siblingBlockId: 'nonexistent' };

      expect(() => generateOrderKey(siblings, place, undefined)).toThrow(OrderKeyError);
      expect(() => generateOrderKey(siblings, place, undefined)).toThrow('not found');
    });
  });

  describe('place: after', () => {
    it('generates key between target and next sibling', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a2' },
        { id: 'block3', orderKey: 'a4' },
      ];
      const place: Place = { where: 'after', siblingBlockId: 'block2' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be between 'a2' and 'a4'
      expect(key > 'a2').toBe(true);
      expect(key < 'a4').toBe(true);
    });

    it('generates key after target when target is last', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a2' },
      ];
      const place: Place = { where: 'after', siblingBlockId: 'block2' };

      const key = generateOrderKey(siblings, place, undefined);

      // Key should be after 'a2'
      expect(key > 'a2').toBe(true);
    });

    it('throws OrderKeyError when sibling does not exist', () => {
      const siblings: Sibling[] = [{ id: 'block1', orderKey: 'a0' }];
      const place: Place = { where: 'after', siblingBlockId: 'nonexistent' };

      expect(() => generateOrderKey(siblings, place, undefined)).toThrow(OrderKeyError);
    });
  });

  describe('explicit orderKey', () => {
    it('uses provided orderKey when no place hint', () => {
      const siblings: Sibling[] = [{ id: 'block1', orderKey: 'a0' }];

      const key = generateOrderKey(siblings, undefined, 'custom-key');

      expect(key).toBe('custom-key');
    });

    it('uses provided orderKey even when place is provided', () => {
      // Explicit orderKey takes precedence
      const siblings: Sibling[] = [{ id: 'block1', orderKey: 'a0' }];
      const place: Place = { where: 'start' };

      const key = generateOrderKey(siblings, place, 'custom-key');

      expect(key).toBe('custom-key');
    });
  });

  describe('no place and no explicit orderKey', () => {
    it('defaults to end placement', () => {
      const siblings: Sibling[] = [
        { id: 'block1', orderKey: 'a0' },
        { id: 'block2', orderKey: 'a1' },
      ];

      const key = generateOrderKey(siblings, undefined, undefined);

      // Should be after last sibling (default to 'end')
      expect(key > 'a1').toBe(true);
    });
  });
});

describe('isOrderKeyUnique', () => {
  it('returns true when key is unique among siblings', () => {
    const siblings: Sibling[] = [
      { id: 'block1', orderKey: 'a0' },
      { id: 'block2', orderKey: 'a2' },
    ];

    expect(isOrderKeyUnique(siblings, 'a1')).toBe(true);
  });

  it('returns false when key already exists among siblings', () => {
    const siblings: Sibling[] = [
      { id: 'block1', orderKey: 'a0' },
      { id: 'block2', orderKey: 'a2' },
    ];

    expect(isOrderKeyUnique(siblings, 'a0')).toBe(false);
  });

  it('returns true for empty siblings list', () => {
    const siblings: Sibling[] = [];

    expect(isOrderKeyUnique(siblings, 'a0')).toBe(true);
  });
});
