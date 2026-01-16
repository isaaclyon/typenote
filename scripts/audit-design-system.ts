#!/usr/bin/env npx tsx
/**
 * Design System Audit Script v2
 *
 * Scans the design system for components and tracks both direct and
 * transitive usage in the desktop app. Generates a JSON report.
 *
 * Usage: just audit-design-system
 */

import { globSync } from 'glob';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { basename, join } from 'path';

// Terminal colors
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface ComponentInfo {
  name: string;
  exports: string[];
  internalDeps: string[]; // Other design-system components this one imports
}

interface ComponentUsage {
  status: 'direct' | 'transitive' | 'unused';
  usedBy: string[];
  via?: string[]; // For transitive: which components bring this in
}

interface FileUsage {
  direct: string[];
  transitive: string[];
}

interface AuditReport {
  generated: string;
  summary: {
    totalComponents: number;
    usedDirectly: number;
    usedTransitively: number;
    unused: number;
  };
  byComponent: Record<string, ComponentUsage>;
  byFile: Record<string, FileUsage>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Build Component Graph
// ─────────────────────────────────────────────────────────────────────────────

function extractExports(indexPath: string): string[] {
  if (!existsSync(indexPath)) return [];

  const content = readFileSync(indexPath, 'utf-8');
  const exports: string[] = [];

  // Match: export { Foo, Bar } from './...'
  // Also match: export * from './...' (re-exports)
  const namedExportRegex = /export\s+\{([^}]+)\}\s+from/g;
  let match;

  while ((match = namedExportRegex.exec(content)) !== null) {
    const matched = match[1];
    if (!matched) continue;
    const names = matched
      .split(',')
      .map((s) => s.trim().split(/\s+as\s+/)[0])
      .filter((s): s is string => s !== undefined && !s.startsWith('type ') && s.length > 0);
    exports.push(...names);
  }

  return exports;
}

function extractInternalDeps(componentDir: string, allComponentNames: Set<string>): string[] {
  const deps = new Set<string>();
  const tsxFiles = globSync(join(componentDir, '**/*.tsx'));

  for (const file of tsxFiles) {
    const content = readFileSync(file, 'utf-8');

    // Match relative imports like: import { X } from '../OtherComponent/...'
    // or: import { X } from '../../ComponentName/ComponentName.js'
    const importRegex = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+)\s+from\s+['"]\.\.\/([^/'".]+)/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importedDir = match[1];
      if (importedDir && allComponentNames.has(importedDir)) {
        deps.add(importedDir);
      }
    }
  }

  return [...deps];
}

function buildComponentGraph(): Map<string, ComponentInfo> {
  const componentDirs = globSync('packages/design-system/src/components/*/');
  const graph = new Map<string, ComponentInfo>();

  // First pass: collect all component names
  const allComponentNames = new Set<string>();
  for (const dir of componentDirs) {
    allComponentNames.add(basename(dir));
  }

  // Second pass: build full info
  for (const dir of componentDirs) {
    const name = basename(dir);
    const indexPath = join(dir, 'index.ts');
    const exports = extractExports(indexPath);

    if (exports.length === 0) continue;

    const internalDeps = extractInternalDeps(dir, allComponentNames);

    graph.set(name, {
      name,
      exports,
      internalDeps,
    });
  }

  return graph;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Scan Desktop Imports
// ─────────────────────────────────────────────────────────────────────────────

interface DirectImport {
  file: string;
  imports: string[];
}

function scanDesktopImports(): DirectImport[] {
  const desktopFiles = globSync('apps/desktop/src/**/*.tsx');
  const results: DirectImport[] = [];

  for (const file of desktopFiles) {
    const content = readFileSync(file, 'utf-8');
    const imports: string[] = [];

    // Match imports from @typenote/design-system
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@typenote\/design-system['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const matched = match[1];
      if (!matched) continue;
      const names = matched
        .split(',')
        .map((s) => s.trim().split(/\s+as\s+/)[0])
        .filter((s): s is string => s !== undefined && !s.startsWith('type ') && s.length > 0);
      imports.push(...names);
    }

    if (imports.length > 0) {
      results.push({
        file: basename(file),
        imports: [...new Set(imports)],
      });
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Resolve Export → Component Mapping
// ─────────────────────────────────────────────────────────────────────────────

function buildExportToComponentMap(graph: Map<string, ComponentInfo>): Map<string, string> {
  const map = new Map<string, string>();

  for (const [componentName, info] of graph) {
    for (const exp of info.exports) {
      map.set(exp, componentName);
    }
  }

  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Expand Transitive Dependencies
// ─────────────────────────────────────────────────────────────────────────────

function getTransitiveDeps(
  componentName: string,
  graph: Map<string, ComponentInfo>,
  visited = new Set<string>()
): Set<string> {
  if (visited.has(componentName)) return new Set();
  visited.add(componentName);

  const info = graph.get(componentName);
  if (!info) return new Set();

  const allDeps = new Set<string>();

  for (const dep of info.internalDeps) {
    allDeps.add(dep);
    // Recursively get deps of deps
    const subDeps = getTransitiveDeps(dep, graph, visited);
    for (const subDep of subDeps) {
      allDeps.add(subDep);
    }
  }

  return allDeps;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5: Generate Report
// ─────────────────────────────────────────────────────────────────────────────

function generateReport(
  graph: Map<string, ComponentInfo>,
  desktopImports: DirectImport[]
): AuditReport {
  const exportToComponent = buildExportToComponentMap(graph);

  // Track direct usage per component
  const directUsage = new Map<string, Set<string>>(); // component -> files
  const transitiveUsage = new Map<string, Set<string>>(); // component -> files
  const transitiveVia = new Map<string, Set<string>>(); // component -> via which components

  // Initialize all components as unused
  for (const componentName of graph.keys()) {
    directUsage.set(componentName, new Set());
    transitiveUsage.set(componentName, new Set());
    transitiveVia.set(componentName, new Set());
  }

  // Process each file's imports
  const byFile: Record<string, FileUsage> = {};

  for (const { file, imports } of desktopImports) {
    const fileDirectComponents = new Set<string>();
    const fileTransitiveComponents = new Set<string>();

    for (const imp of imports) {
      const componentName = exportToComponent.get(imp);
      if (componentName) {
        fileDirectComponents.add(componentName);
        directUsage.get(componentName)?.add(file);

        // Get transitive deps
        const transitiveDeps = getTransitiveDeps(componentName, graph);
        for (const dep of transitiveDeps) {
          if (!fileDirectComponents.has(dep)) {
            fileTransitiveComponents.add(dep);
            transitiveUsage.get(dep)?.add(file);
            transitiveVia.get(dep)?.add(componentName);
          }
        }
      }
    }

    byFile[file] = {
      direct: [...fileDirectComponents].sort(),
      transitive: [...fileTransitiveComponents].sort(),
    };
  }

  // Build byComponent
  const byComponent: Record<string, ComponentUsage> = {};
  let usedDirectly = 0;
  let usedTransitively = 0;
  let unused = 0;

  for (const componentName of [...graph.keys()].sort()) {
    const directFiles = directUsage.get(componentName) ?? new Set();
    const transitiveFiles = transitiveUsage.get(componentName) ?? new Set();
    const viaComponents = transitiveVia.get(componentName) ?? new Set();

    if (directFiles.size > 0) {
      byComponent[componentName] = {
        status: 'direct',
        usedBy: [...directFiles].sort(),
      };
      usedDirectly++;
    } else if (transitiveFiles.size > 0) {
      byComponent[componentName] = {
        status: 'transitive',
        usedBy: [...transitiveFiles].sort(),
        via: [...viaComponents].sort(),
      };
      usedTransitively++;
    } else {
      byComponent[componentName] = {
        status: 'unused',
        usedBy: [],
      };
      unused++;
    }
  }

  return {
    generated: new Date().toISOString(),
    summary: {
      totalComponents: graph.size,
      usedDirectly,
      usedTransitively,
      unused,
    },
    byComponent,
    byFile,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 6: Output
// ─────────────────────────────────────────────────────────────────────────────

function printReport(report: AuditReport, graph: Map<string, ComponentInfo>) {
  console.log(bold('\n🔍 Scanning design system...\n'));

  for (const [name, usage] of Object.entries(report.byComponent)) {
    const info = graph.get(name);
    const directCount = usage.status === 'direct' ? usage.usedBy.length : 0;
    const transitiveCount = usage.status === 'transitive' ? usage.usedBy.length : 0;

    if (usage.status === 'direct') {
      console.log(
        `${green('✅')} ${name} ${dim(`(${directCount} direct)`)} → ${dim(usage.usedBy.join(', '))}`
      );

      // Show transitive deps this component brings in
      const deps = info?.internalDeps ?? [];
      if (deps.length > 0) {
        console.log(`   ${dim('└─ brings:')} ${cyan(deps.join(', '))}`);
      }
    } else if (usage.status === 'transitive') {
      console.log(
        `${green('✅')} ${name} ${dim(`(${transitiveCount} transitive)`)} → ${dim(`via ${usage.via?.join(', ')}`)}`
      );
    } else {
      console.log(`${yellow('⚪')} ${name} ${dim('(unused)')}`);
    }
  }

  // Summary
  const { summary } = report;
  const usedTotal = summary.usedDirectly + summary.usedTransitively;
  const percentage = Math.round((usedTotal / summary.totalComponents) * 100);

  console.log(dim('\n────────────────────────────────────────────'));
  console.log(bold(`\n📊 Summary: ${usedTotal}/${summary.totalComponents} used (${percentage}%)`));
  console.log(
    `   Direct: ${summary.usedDirectly} | Transitive: ${summary.usedTransitively} | Unused: ${summary.unused}`
  );

  if (summary.unused > 0) {
    const unusedNames = Object.entries(report.byComponent)
      .filter(([, u]) => u.status === 'unused')
      .map(([n]) => n);
    console.log(`   ${yellow('Unused:')} ${unusedNames.join(', ')}`);
  }

  console.log(`\n${dim('📄 Report written to design-system-usage.json')}\n`);
}

function writeReportFile(report: AuditReport) {
  const outputPath = 'design-system-usage.json';
  writeFileSync(outputPath, JSON.stringify(report, null, 2) + '\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  // 1. Build component graph
  const graph = buildComponentGraph();

  // 2. Scan desktop imports
  const desktopImports = scanDesktopImports();

  // 3. Generate report
  const report = generateReport(graph, desktopImports);

  // 4. Output
  writeReportFile(report);
  printReport(report, graph);
}

main();
