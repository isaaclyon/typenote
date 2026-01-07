/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ==========================================================================
    // PACKAGE HIERARCHY RULES
    // ==========================================================================
    //
    // The TypeNote architecture enforces a strict dependency hierarchy:
    //
    //   apps/desktop, apps/cli
    //         │
    //         ▼
    //   packages/storage  (can import api, core)
    //         │
    //         ▼
    //   packages/core     (can import api only)
    //         │
    //         ▼
    //   packages/api      (no internal package imports)
    //
    // ==========================================================================

    // Rule 1: api cannot import from any internal packages
    {
      name: 'api-no-internal-imports',
      severity: 'error',
      comment: 'packages/api is the foundation layer and cannot import from other @typenote packages',
      from: { path: '^packages/api/' },
      to: { path: '^packages/(core|storage)/' },
    },

    // Rule 2: core can only import from api (not storage)
    {
      name: 'core-no-storage-imports',
      severity: 'error',
      comment: 'packages/core can only import from packages/api, not packages/storage',
      from: { path: '^packages/core/' },
      to: { path: '^packages/storage/' },
    },

    // Rule 3: No circular dependencies between packages
    {
      name: 'no-circular-package-deps',
      severity: 'error',
      comment: 'Packages must not have circular dependencies',
      from: { path: '^packages/' },
      to: {
        circular: true,
        path: '^packages/',
      },
    },

    // ==========================================================================
    // ELECTRON ISOLATION RULES
    // ==========================================================================

    // Rule 4: Shared packages cannot import Electron
    {
      name: 'packages-no-electron',
      severity: 'error',
      comment: 'Shared packages (api, core, storage) cannot import Electron modules',
      from: { path: '^packages/' },
      to: { path: '^electron$' },
    },

    // Rule 5: Renderer cannot import Node-only or storage modules
    {
      name: 'renderer-no-node-or-storage',
      severity: 'error',
      comment: 'The renderer process cannot import @typenote/storage or Node.js modules directly (use IPC)',
      from: { path: '^apps/desktop/src/renderer/' },
      to: {
        path: [
          '^packages/storage/',
          '^@typenote/storage',
        ],
      },
    },

    // Rule 6: Renderer cannot import Electron main process modules
    {
      name: 'renderer-no-electron-main',
      severity: 'error',
      comment: 'The renderer process cannot import from Electron main (app, BrowserWindow, etc.)',
      from: { path: '^apps/desktop/src/renderer/' },
      to: {
        path: '^electron$',
        // Allow electron types for type-only imports
        dependencyTypesNot: ['type-only'],
      },
    },

    // ==========================================================================
    // GENERAL BEST PRACTICES
    // ==========================================================================

    // Rule 7: No orphan modules (unreachable code)
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Modules should be imported by at least one other module (or be an entry point)',
      from: {
        orphan: true,
        pathNot: [
          // Entry points
          '(^|/)index\\.ts$',
          // Test files and setup
          '\\.test\\.(ts|tsx)$',
          '\\.spec\\.(ts|tsx)$',
          'test-setup\\.ts$',
          // Config files (various extensions)
          '\\.(config|setup)\\.(ts|js|mjs|cjs)$',
          // Type definitions
          '\\.d\\.ts$',
        ],
      },
      to: {},
    },

    // Rule 8: No circular dependencies within a package
    {
      name: 'no-internal-circular',
      severity: 'warn',
      comment: 'Avoid circular dependencies within the same package',
      from: {},
      to: { circular: true },
    },
  ],

  options: {
    // Process TypeScript files
    tsPreCompilationDeps: true,

    // Use TypeScript config for path resolution
    tsConfig: {
      fileName: 'tsconfig.base.json',
    },

    // Enhance the output to show resolved modules
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['module', 'main', 'types'],
      extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    },

    // Exclude these paths from analysis (sources only, not resolved targets)
    doNotFollow: {
      path: ['node_modules'],
    },
    exclude: {
      path: [
        '\\.d\\.ts$',
        // Build output (as source files, not as resolved targets)
        '/dist/',
        '/build/',
        // Generated UI components
        'apps/desktop/src/renderer/components/ui/',
        // Reference/docs folders
        '_reference/',
        'docs/',
        'claude-docs/',
        // Stryker mutation testing sandboxes
        '\\.stryker-tmp/',
        // Config files (vitest, tailwind, postcss, etc.)
        'vitest\\.config\\.',
        'tailwind\\.config\\.',
        'postcss\\.config\\.',
      ],
    },

    // Focus on source files
    includeOnly: {
      path: ['^packages/', '^apps/'],
    },

    // Report format settings
    reporterOptions: {
      dot: {
        theme: {
          graph: { rankdir: 'TB' },
          modules: [
            { criteria: { source: '^packages/api/' }, attributes: { fillcolor: '#e8f5e9' } },
            { criteria: { source: '^packages/core/' }, attributes: { fillcolor: '#e3f2fd' } },
            { criteria: { source: '^packages/storage/' }, attributes: { fillcolor: '#fff3e0' } },
            { criteria: { source: '^apps/' }, attributes: { fillcolor: '#f3e5f5' } },
          ],
        },
      },
    },
  },
};
