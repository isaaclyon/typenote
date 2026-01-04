import { describe, it, expect } from 'vitest';

import { CORE_VERSION } from './index.js';

describe('Core package', () => {
  it('exports core version', () => {
    expect(CORE_VERSION).toBe('0.1.0');
  });
});
