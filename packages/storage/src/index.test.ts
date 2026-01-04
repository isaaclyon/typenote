import { describe, it, expect } from 'vitest';

import { STORAGE_VERSION } from './index.js';

describe('Storage package', () => {
  it('exports storage version', () => {
    expect(STORAGE_VERSION).toBe('0.1.0');
  });
});
