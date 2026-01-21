import { describe, expect, it } from 'vitest';

import { cn } from './utils.js';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold');
  });

  it('handles tailwind conflicts', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('ignores falsy values', () => {
    const shouldHide = false;
    expect(cn('text-sm', shouldHide && 'hidden', undefined, null, 'font-bold')).toBe(
      'text-sm font-bold'
    );
  });
});
