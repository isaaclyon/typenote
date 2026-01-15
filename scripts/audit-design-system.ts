#!/usr/bin/env npx tsx
/**
 * Design System Audit Script
 *
 * Scans the design system for components and checks which ones
 * are actually used in the desktop app vs "theoretical" (unused).
 *
 * Usage: just audit-design-system
 */

import { globSync } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { basename, join } from 'path';

// Terminal colors
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

interface ComponentStatus {
  name: string;
  usages: string[];
  isTheoretical: boolean;
}

function extractExports(indexPath: string): string[] {
  if (!existsSync(indexPath)) return [];

  const content = readFileSync(indexPath, 'utf-8');
  const exports: string[] = [];

  // Match: export { Foo, Bar } from './...'
  // Skip: export type { ... }
  const exportRegex = /export\s+\{([^}]+)\}\s+from/g;
  let match;

  while ((match = exportRegex.exec(content)) !== null) {
    const names = match[1]
      .split(',')
      .map((s) => s.trim().split(/\s+as\s+/)[0])
      .filter((s) => s !== undefined && !s.startsWith('type ') && s.length > 0);
    exports.push(...(names as string[]));
  }

  return exports;
}

function findUsagesInDesktop(componentName: string): string[] {
  const desktopFiles = globSync('apps/desktop/src/**/*.tsx');
  const usages: string[] = [];

  for (const file of desktopFiles) {
    const content = readFileSync(file, 'utf-8');

    // Check for import from @typenote/design-system containing this component
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@typenote\/design-system['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]);
      if (imports.some((i) => i === componentName)) {
        usages.push(basename(file));
      }
    }
  }

  return [...new Set(usages)]; // dedupe
}

function main() {
  console.log(bold('\n🔍 Scanning design system...\n'));

  const componentDirs = globSync('packages/design-system/src/components/*/');
  const results: ComponentStatus[] = [];
  let migrated = 0;
  let theoretical = 0;

  for (const dir of componentDirs.sort()) {
    const componentName = basename(dir);
    const indexPath = join(dir, 'index.ts');
    const exports = extractExports(indexPath);

    if (exports.length === 0) continue;

    // Check primary export (component name itself)
    const primaryExport = exports.find((e) => e === componentName) ?? exports[0];
    if (primaryExport === undefined) continue;

    const usages = findUsagesInDesktop(primaryExport);

    const status: ComponentStatus = {
      name: componentName,
      usages,
      isTheoretical: usages.length === 0,
    };

    results.push(status);

    // Stream output
    if (status.isTheoretical) {
      console.log(`${red('❌')} ${componentName} ${dim('(0 usages)')} ${yellow('← THEORETICAL')}`);
      theoretical++;
    } else {
      console.log(
        `${green('✅')} ${componentName} ${dim(`(${usages.length} usages)`)} → ${dim(usages.join(', '))}`
      );
      migrated++;
    }
  }

  // Summary
  const total = migrated + theoretical;
  const percentage = Math.round((migrated / total) * 100);

  console.log(dim('\n────────────────────────────────────────────'));
  console.log(bold(`\n📊 Summary: ${migrated}/${total} migrated (${percentage}%)`));

  if (theoretical > 0) {
    const theoreticalNames = results.filter((r) => r.isTheoretical).map((r) => r.name);
    console.log(`   ${yellow('Theoretical:')} ${theoreticalNames.join(', ')}`);
  }

  console.log('');
}

main();
