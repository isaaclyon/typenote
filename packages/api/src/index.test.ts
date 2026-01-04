import { describe, it, expect } from 'vitest';

import { API_VERSION } from './index.js';

describe('API package', () => {
  it('exports API version', () => {
    expect(API_VERSION).toBe('v1');
  });
});
