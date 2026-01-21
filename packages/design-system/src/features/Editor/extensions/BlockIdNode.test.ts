import { describe, expect, it } from 'vitest';

import { BLOCK_ID_INPUT_REGEX } from './BlockIdNode.js';

describe('BLOCK_ID_INPUT_REGEX', () => {
  it('matches valid block id input', () => {
    const match = BLOCK_ID_INPUT_REGEX.exec('Todo ^abc123 ');
    expect(match?.[1]).toBe('abc123');
  });

  it('supports underscores and hyphens', () => {
    const match = BLOCK_ID_INPUT_REGEX.exec('Note ^_alpha-beta ');
    expect(match?.[1]).toBe('_alpha-beta');
  });

  it('rejects input without spacing', () => {
    expect(BLOCK_ID_INPUT_REGEX.test('Todo^abc123 ')).toBe(false);
  });

  it('rejects invalid starting characters', () => {
    expect(BLOCK_ID_INPUT_REGEX.test('Todo ^1abc ')).toBe(false);
  });

  it('rejects input without trailing space', () => {
    expect(BLOCK_ID_INPUT_REGEX.test('Todo ^abc123')).toBe(false);
  });
});
