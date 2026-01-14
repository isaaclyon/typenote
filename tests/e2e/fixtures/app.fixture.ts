import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface TestFixtures {
  electronApp: ElectronApplication;
  window: Page;
  testDbPath: string;
}

export const test = base.extend<TestFixtures>({
  // eslint-disable-next-line no-empty-pattern
  testDbPath: async ({}, use) => {
    // Create unique temp DB for each test
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'typenote-e2e-'));
    const dbPath = path.join(tempDir, 'test.db');
    await use(dbPath);
    // Cleanup after test
    fs.rmSync(tempDir, { recursive: true, force: true });
  },

  electronApp: async ({ testDbPath }, use) => {
    // Path to the built desktop app's main entry point
    const appPath = path.resolve(__dirname, '../../../apps/desktop/dist/main/index.js');

    // Filter out undefined values from process.env
    const env: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        env[key] = value;
      }
    }

    const appDir = path.resolve(__dirname, '../../../apps/desktop');
    const electronApp = await electron.launch({
      args: [appPath],
      cwd: appDir,
      env: {
        ...env,
        NODE_ENV: 'test',
        TYPENOTE_DB_PATH: testDbPath,
      },
    });

    await use(electronApp);
    await electronApp.close();
  },

  window: async ({ electronApp }, use) => {
    // Increase timeout for firstWindow() since parallel Electron instances
    // can cause resource contention during startup
    const window = await electronApp.firstWindow({ timeout: 45000 });
    // Wait for app to be ready
    await window.waitForLoadState('domcontentloaded');
    await use(window);
  },
});

export { expect } from '@playwright/test';
