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
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MARKER_FILE = join(ROOT, 'node_modules', '.native-build-mode');

const MODES = {
  node: {
    command: 'npm',
    args: ['rebuild', 'better-sqlite3'],
    description: 'Node.js (for unit tests)',
  },
  electron: {
    command: 'npx',
    args: ['electron-rebuild'],
    description: 'Electron (for app & E2E tests)',
  },
};

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

function rebuild(mode) {
  const config = MODES[mode];
  console.log(`\n🔧 Rebuilding better-sqlite3 for ${config.description}...`);
  console.log(`   Running: ${config.command} ${config.args.join(' ')}\n`);

  try {
    execFileSync(config.command, config.args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    });
    setCurrentMode(mode);
    console.log(`\n✅ Native modules rebuilt for ${config.description}\n`);
  } catch (error) {
    console.error(`\n❌ Rebuild failed for ${mode}:`, error.message);
    process.exit(1);
  }
}

function main() {
  const requestedMode = process.argv[2];

  if (!requestedMode || !MODES[requestedMode]) {
    console.error('Usage: ensure-native-build.mjs <node|electron>');
    console.error('  node     - Build for Node.js (unit tests)');
    console.error('  electron - Build for Electron (app & E2E tests)');
    process.exit(1);
  }

  const currentMode = getCurrentMode();

  if (currentMode === requestedMode) {
    console.log(
      `✓ Native modules already built for ${MODES[requestedMode].description}`
    );
    return;
  }

  if (currentMode) {
    console.log(
      `⚡ Switching from ${MODES[currentMode].description} → ${MODES[requestedMode].description}`
    );
  } else {
    console.log(`⚡ Initial build for ${MODES[requestedMode].description}`);
  }

  rebuild(requestedMode);
}

main();
