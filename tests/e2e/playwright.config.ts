import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './specs',
  timeout: 60000, // Electron apps need longer startup time
  retries: process.env['CI'] ? 2 : 0,
  workers: 4, // Parallel execution - each test has isolated temp DB

  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
    },
  ],
});
