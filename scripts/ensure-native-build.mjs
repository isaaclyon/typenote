#!/usr/bin/env node
/**
 * Smart native module rebuild script.
 *
 * Tracks the current build mode (node vs electron) and only rebuilds
 * when switching between modes. This avoids the 10-20 second rebuild
 * penalty on every command invocation.
 *
 * Usage:
 *   node scripts/ensure-native-build.mjs node     # For unit tests
 *   node scripts/ensure-native-build.mjs electron # For Electron app/E2E
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arch } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MARKER_FILE = join(ROOT, 'node_modules', '.native-build-mode');

/**
 * Find the better-sqlite3 module path in pnpm's node_modules structure.
 */
function findBetterSqlite3Path() {
  const pnpmDir = join(ROOT, 'node_modules', '.pnpm');
  if (!existsSync(pnpmDir)) {
    throw new Error('pnpm node_modules not found');
  }

  const entries = readdirSync(pnpmDir);
  const sqlite3Dir = entries.find((e) => e.startsWith('better-sqlite3@'));
  if (!sqlite3Dir) {
    throw new Error('better-sqlite3 not found in pnpm node_modules');
  }

  return join(pnpmDir, sqlite3Dir, 'node_modules', 'better-sqlite3');
}

/**
 * Get the installed Electron version from package.json.
 */
function getElectronVersion() {
  const pnpmDir = join(ROOT, 'node_modules', '.pnpm');
  const entries = readdirSync(pnpmDir);
  const electronDir = entries.find((e) => e.startsWith('electron@'));
  if (!electronDir) {
    throw new Error('Electron not found in pnpm node_modules');
  }

  const pkgPath = join(pnpmDir, electronDir, 'node_modules', 'electron', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function getCurrentMode() {
  if (!existsSync(MARKER_FILE)) {
    return null;
  }
  try {
    return readFileSync(MARKER_FILE, 'utf-8').trim();
  } catch {
    return null;
  }
}

function setCurrentMode(mode) {
  writeFileSync(MARKER_FILE, mode, 'utf-8');
}

function rebuildForNode() {
  console.log('\n🔧 Rebuilding better-sqlite3 for Node.js (unit tests)...\n');

  const betterSqlite3Path = findBetterSqlite3Path();
  const nodeVersion = process.version.slice(1); // Remove 'v' prefix
  const cpuArch = arch();

  console.log(`   Module path: ${betterSqlite3Path}`);
  console.log(`   Node.js version: ${nodeVersion}`);
  console.log(`   Architecture: ${cpuArch}\n`);

  // Use node-gyp directly for Node.js (works with pnpm)
  execFileSync(
    'npx',
    ['node-gyp', 'rebuild', `--target=${nodeVersion}`, `--arch=${cpuArch}`],
    {
      cwd: betterSqlite3Path,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    }
  );
}

function rebuildForElectron() {
  console.log('\n🔧 Rebuilding better-sqlite3 for Electron (app & E2E tests)...\n');

  const betterSqlite3Path = findBetterSqlite3Path();
  const electronVersion = getElectronVersion();
  const cpuArch = arch();

  console.log(`   Module path: ${betterSqlite3Path}`);
  console.log(`   Electron version: ${electronVersion}`);
  console.log(`   Architecture: ${cpuArch}\n`);

  // Use node-gyp directly with Electron headers (works with pnpm)
  execFileSync(
    'npx',
    [
      'node-gyp',
      'rebuild',
      `--target=${electronVersion}`,
      `--arch=${cpuArch}`,
      '--dist-url=https://electronjs.org/headers',
      '--runtime=electron',
    ],
    {
      cwd: betterSqlite3Path,
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        HOME: join(process.env['HOME'] || '', '.electron-gyp'),
      },
    }
  );
}

function rebuild(mode) {
  try {
    if (mode === 'node') {
      rebuildForNode();
    } else {
      rebuildForElectron();
    }
    setCurrentMode(mode);
    const description =
      mode === 'node' ? 'Node.js (unit tests)' : 'Electron (app & E2E tests)';
    console.log(`\n✅ Native modules rebuilt for ${description}\n`);
  } catch (error) {
    console.error(`\n❌ Rebuild failed for ${mode}:`, error.message);
    process.exit(1);
  }
}

function main() {
  const requestedMode = process.argv[2];

  if (!requestedMode || !['node', 'electron'].includes(requestedMode)) {
    console.error('Usage: ensure-native-build.mjs <node|electron>');
    console.error('  node     - Build for Node.js (unit tests)');
    console.error('  electron - Build for Electron (app & E2E tests)');
    process.exit(1);
  }

  const currentMode = getCurrentMode();
  const descriptions = {
    node: 'Node.js (for unit tests)',
    electron: 'Electron (for app & E2E tests)',
  };

  if (currentMode === requestedMode) {
    console.log(`✓ Native modules already built for ${descriptions[requestedMode]}`);
    return;
  }

  if (currentMode) {
    console.log(
      `⚡ Switching from ${descriptions[currentMode]} → ${descriptions[requestedMode]}`
    );
  } else {
    console.log(`⚡ Initial build for ${descriptions[requestedMode]}`);
  }

  rebuild(requestedMode);
}

main();
