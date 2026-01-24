#!/usr/bin/env node
/**
 * Smart native module rebuild script.
 *
 * Tracks the current build mode (node vs electron), caches compiled binaries,
 * and only rebuilds when switching to a missing/invalid target.
 *
 * Usage:
 *   node scripts/ensure-native-build.mjs node     # For unit tests
 *   node scripts/ensure-native-build.mjs electron # For Electron app/E2E
 */

import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arch, platform } from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MARKER_FILE = join(ROOT, 'node_modules', '.native-build-mode');
const CACHE_ROOT = join(ROOT, 'node_modules', '.native-build-cache', 'better-sqlite3');
const BINARY_NAME = 'better_sqlite3.node';

/**
 * Find the better-sqlite3 module path in pnpm's node_modules structure.
 */
let cachedBetterSqlite3Path;
function findBetterSqlite3Path() {
  if (cachedBetterSqlite3Path) {
    return cachedBetterSqlite3Path;
  }
  const pnpmDir = join(ROOT, 'node_modules', '.pnpm');
  if (!existsSync(pnpmDir)) {
    throw new Error('pnpm node_modules not found');
  }

  const entries = readdirSync(pnpmDir);
  const sqlite3Dir = entries.find((e) => e.startsWith('better-sqlite3@'));
  if (!sqlite3Dir) {
    throw new Error('better-sqlite3 not found in pnpm node_modules');
  }

  cachedBetterSqlite3Path = join(pnpmDir, sqlite3Dir, 'node_modules', 'better-sqlite3');
  return cachedBetterSqlite3Path;
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

function getBetterSqlite3Version() {
  const betterSqlite3Path = findBetterSqlite3Path();
  const pkgPath = join(betterSqlite3Path, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function getBinaryPath() {
  return join(findBetterSqlite3Path(), 'build', 'Release', BINARY_NAME);
}

function readMarker() {
  if (!existsSync(MARKER_FILE)) {
    return null;
  }
  const raw = readFileSync(MARKER_FILE, 'utf-8').trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Old marker format: plain string "node" | "electron"
    return { mode: raw };
  }

  return null;
}

function writeMarker(info) {
  writeFileSync(MARKER_FILE, JSON.stringify(info), 'utf-8');
}

function getBuildInfo(mode) {
  const sqliteVersion = getBetterSqlite3Version();
  const common = {
    mode,
    arch: arch(),
    platform: platform(),
    sqliteVersion,
  };

  if (mode === 'node') {
    return {
      ...common,
      runtime: 'node',
      targetVersion: process.versions.node,
    };
  }

  return {
    ...common,
    runtime: 'electron',
    targetVersion: getElectronVersion(),
  };
}

function buildInfoMatches(current, desired) {
  if (!current || !desired) {
    return false;
  }
  return (
    current.mode === desired.mode &&
    current.runtime === desired.runtime &&
    current.targetVersion === desired.targetVersion &&
    current.arch === desired.arch &&
    current.platform === desired.platform &&
    current.sqliteVersion === desired.sqliteVersion
  );
}

function buildKey(info) {
  const raw = `${info.mode}-${info.runtime}-${info.platform}-${info.arch}-${info.sqliteVersion}-${info.targetVersion}`;
  return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getCachePath(info) {
  return join(CACHE_ROOT, buildKey(info), BINARY_NAME);
}

function cacheBinary(info) {
  const binaryPath = getBinaryPath();
  if (!existsSync(binaryPath)) {
    return false;
  }
  const cachePath = getCachePath(info);
  mkdirSync(dirname(cachePath), { recursive: true });
  copyFileSync(binaryPath, cachePath);
  writeFileSync(join(dirname(cachePath), 'build-info.json'), JSON.stringify(info, null, 2));
  return true;
}

function restoreFromCache(info) {
  const cachePath = getCachePath(info);
  if (!existsSync(cachePath)) {
    return false;
  }
  const binaryPath = getBinaryPath();
  mkdirSync(dirname(binaryPath), { recursive: true });
  copyFileSync(cachePath, binaryPath);
  return true;
}

function verifyNativeModule(info) {
  const binaryPath = getBinaryPath();
  if (!existsSync(binaryPath)) {
    return false;
  }

  if (info.mode === 'electron') {
    // Can't load Electron binary in Node.js; rely on marker + cache validity
    return true;
  }

  try {
    require(binaryPath);
    return true;
  } catch {
    return false;
  }
}

function rebuildForNode(info) {
  console.log('\n🔧 Rebuilding better-sqlite3 for Node.js (unit tests)...\n');

  const betterSqlite3Path = findBetterSqlite3Path();
  const nodeVersion = info.targetVersion;
  const cpuArch = info.arch;

  console.log(`   Module path: ${betterSqlite3Path}`);
  console.log(`   Node.js version: ${nodeVersion}`);
  console.log(`   Architecture: ${cpuArch}\n`);

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

function rebuildForElectron(info) {
  console.log('\n🔧 Rebuilding better-sqlite3 for Electron (app & E2E tests)...\n');

  const betterSqlite3Path = findBetterSqlite3Path();
  const electronVersion = info.targetVersion;
  const cpuArch = info.arch;

  console.log(`   Module path: ${betterSqlite3Path}`);
  console.log(`   Electron version: ${electronVersion}`);
  console.log(`   Architecture: ${cpuArch}\n`);

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

function rebuild(info) {
  try {
    if (info.mode === 'node') {
      rebuildForNode(info);
    } else {
      rebuildForElectron(info);
    }
    writeMarker(info);
    cacheBinary(info);
    const description =
      info.mode === 'node' ? 'Node.js (unit tests)' : 'Electron (app & E2E tests)';
    console.log(`\n✅ Native modules ready for ${description}\n`);
  } catch (error) {
    console.error(`\n❌ Rebuild failed for ${info.mode}:`, error.message);
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

  const requestedInfo = getBuildInfo(requestedMode);
  const currentInfo = readMarker();
  const markerMatches = buildInfoMatches(currentInfo, requestedInfo);
  const moduleValid = verifyNativeModule(requestedInfo);

  const descriptions = {
    node: 'Node.js (for unit tests)',
    electron: 'Electron (for app & E2E tests)',
  };

  if (markerMatches && moduleValid) {
    console.log(`✓ Native modules already built for ${descriptions[requestedMode]}`);
    return;
  }

  // Cache current build before switching modes, if we know what it is
  if (currentInfo && !buildInfoMatches(currentInfo, requestedInfo)) {
    try {
      cacheBinary(currentInfo);
    } catch {
      // Best-effort cache only
    }
  }

  if (!moduleValid && markerMatches) {
    console.log(`⚠️  Native module verification failed, rebuilding for ${descriptions[requestedMode]}`);
  } else if (currentInfo && currentInfo.mode && currentInfo.mode !== requestedMode) {
    console.log(`⚡ Switching from ${descriptions[currentInfo.mode]} → ${descriptions[requestedMode]}`);
  } else {
    console.log(`⚡ Initial build for ${descriptions[requestedMode]}`);
  }

  if (restoreFromCache(requestedInfo)) {
    const cacheOk = requestedInfo.mode === 'electron' || verifyNativeModule(requestedInfo);
    if (cacheOk) {
      writeMarker(requestedInfo);
      console.log(`✓ Restored cached binary for ${descriptions[requestedMode]}`);
      return;
    }
  }

  rebuild(requestedInfo);
}

main();
