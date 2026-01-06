import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Use jsdom for renderer tests, node for main process tests
    environmentMatchGlobs: [
      ['src/renderer/**/*.test.tsx', 'jsdom'],
      ['src/renderer/**/*.test.ts', 'jsdom'],
      ['src/main/**/*.test.ts', 'node'],
    ],
    // Setup file for jest-dom matchers in renderer tests
    setupFiles: ['src/renderer/test-setup.ts'],
  },
});
