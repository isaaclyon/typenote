import { test as base, _electron as electron } from '@playwright/test';
import type { ElectronApplication, Page } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find an available port by attempting to bind.
 * This prevents EADDRINUSE errors when parallel tests or stale processes
 * are using the default port.
 */
async function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        reject(new Error('Could not get server address'));
      }
    });
    server.on('error', reject);
  });
}

export interface TestFixtures {
  electronApp: ElectronApplication;
  window: Page;
  testDbPath: string;
  testPort: number;
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

  // eslint-disable-next-line no-empty-pattern
  testPort: async ({}, use) => {
    // Get a unique available port for each test to prevent EADDRINUSE errors
    const port = await findAvailablePort();
    await use(port);
  },

  electronApp: async ({ testDbPath, testPort }, use) => {
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
        TYPENOTE_HTTP_PORT: String(testPort), // Unique port per test
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
