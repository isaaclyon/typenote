import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    testTimeout: 30000,
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      '@typenote/api': resolve(__dirname, '../../packages/api/src'),
      '@typenote/core': resolve(__dirname, '../../packages/core/src'),
      '@typenote/storage': resolve(__dirname, '../../packages/storage/src'),
    },
  },
});
