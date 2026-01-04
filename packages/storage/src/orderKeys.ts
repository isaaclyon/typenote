/**
 * Order key generation utilities using fractional indexing.
 */

import { generateKeyBetween } from 'fractional-indexing';
import type { Place } from '@typenote/api';

/**
 * Sibling info needed for order key generation.
 */
export interface SiblingInfo {
  id: string;
  orderKey: string;
}

/**
 * Error thrown when order key generation fails.
 */
export class OrderKeyError extends Error {
  constructor(
    message: string,
    public readonly code: 'SIBLING_NOT_FOUND' | 'KEY_COLLISION' = 'SIBLING_NOT_FOUND'
  ) {
    super(message);
    this.name = 'OrderKeyError';
  }
}

/**
 * Generate an order key for a block based on placement hint.
 *
 * @param siblings - Existing siblings at the target location (can be unsorted)
 * @param place - Placement hint (start, end, before, after)
 * @param explicitOrderKey - If provided, use this key directly
 * @returns Generated or provided order key
 * @throws OrderKeyError if sibling reference is invalid
 */
export function generateOrderKey(
  siblings: SiblingInfo[],
  place: Place | undefined,
  explicitOrderKey: string | undefined
): string {
  // Explicit key takes precedence
  if (explicitOrderKey !== undefined) {
    return explicitOrderKey;
  }

  // Sort siblings by orderKey for correct positioning
  const sorted = [...siblings].sort((a, b) => a.orderKey.localeCompare(b.orderKey));

  // Default to 'end' if no place specified
  const resolvedPlace: Place = place ?? { where: 'end' };

  switch (resolvedPlace.where) {
    case 'start': {
      // Before the first sibling, or generate initial key
      const firstKey = sorted[0]?.orderKey ?? null;
      return generateKeyBetween(null, firstKey);
    }

    case 'end': {
      // After the last sibling, or generate initial key
      const lastKey = sorted[sorted.length - 1]?.orderKey ?? null;
      return generateKeyBetween(lastKey, null);
    }

    case 'before': {
      const targetIndex = sorted.findIndex((s) => s.id === resolvedPlace.siblingBlockId);
      if (targetIndex === -1) {
        throw new OrderKeyError(
          `Sibling block not found: ${resolvedPlace.siblingBlockId}`,
          'SIBLING_NOT_FOUND'
        );
      }
      const prevKey = sorted[targetIndex - 1]?.orderKey ?? null;
      const targetKey = sorted[targetIndex]?.orderKey ?? null;
      return generateKeyBetween(prevKey, targetKey);
    }

    case 'after': {
      const targetIndex = sorted.findIndex((s) => s.id === resolvedPlace.siblingBlockId);
      if (targetIndex === -1) {
        throw new OrderKeyError(
          `Sibling block not found: ${resolvedPlace.siblingBlockId}`,
          'SIBLING_NOT_FOUND'
        );
      }
      const targetKey = sorted[targetIndex]?.orderKey ?? null;
      const nextKey = sorted[targetIndex + 1]?.orderKey ?? null;
      return generateKeyBetween(targetKey, nextKey);
    }
  }
}

/**
 * Check if an order key is unique among siblings.
 */
export function isOrderKeyUnique(siblings: SiblingInfo[], orderKey: string): boolean {
  return !siblings.some((s) => s.orderKey === orderKey);
}
