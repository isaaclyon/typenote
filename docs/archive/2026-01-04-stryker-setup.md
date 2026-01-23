# Stryker Mutation Testing Setup

**Date:** 2026-01-04
**Status:** Approved

## Overview

Add Stryker mutation testing to the storage package to validate test quality and find gaps where tests pass but don't actually verify behavior.

## Decisions

| Decision   | Choice                 | Rationale                                          |
| ---------- | ---------------------- | -------------------------------------------------- |
| Scope      | storage package only   | Critical data layer, 350 tests, most complex logic |
| Threshold  | 80% break              | Industry standard, realistic for maturing codebase |
| Mode       | Incremental everywhere | Fast feedback, caches previous runs                |
| Exclusions | String literals        | Tests rarely assert exact error messages           |

## Configuration

**`packages/storage/stryker.config.json`:**

```json
{
  "$schema": "https://stryker-mutator.io/schema/stryker-schema.json",
  "packageManager": "pnpm",
  "testRunner": "vitest",
  "vitest": {
    "configFile": "vitest.config.ts"
  },
  "mutate": ["src/**/*.ts", "!src/**/*.test.ts", "!src/testFixtures.ts"],
  "incremental": true,
  "incrementalFile": ".stryker-cache/incremental.json",
  "thresholds": {
    "high": 90,
    "low": 80,
    "break": 80
  },
  "mutator": {
    "excludedMutations": ["StringLiteral"]
  },
  "reporters": ["html", "clear-text", "progress"],
  "htmlReporter": {
    "fileName": "reports/mutation/index.html"
  }
}
```

## Dependencies

```
@stryker-mutator/core: ^8.7.1
@stryker-mutator/vitest-runner: ^8.7.1
@stryker-mutator/typescript-checker: ^8.7.1
```

## Scripts

| Script             | Command                            | Description          |
| ------------------ | ---------------------------------- | -------------------- |
| `pnpm mutate`      | `stryker run`                      | Run mutation testing |
| `pnpm mutate:open` | `open reports/mutation/index.html` | View HTML report     |

## Files to Create/Modify

| File                                   | Action                      |
| -------------------------------------- | --------------------------- |
| `packages/storage/stryker.config.json` | Create                      |
| `packages/storage/vitest.config.ts`    | Create                      |
| `packages/storage/package.json`        | Add dependencies + scripts  |
| `packages/storage/.gitignore`          | Create (cache + reports)    |
| `package.json`                         | Add root convenience script |

## Expected Performance

- First run: 10-20 minutes (creates all mutants)
- Incremental runs: 1-3 minutes (only changed code)

## Interpreting Results

- **Killed** ✓ — Mutant caught by tests
- **Survived** ✗ — Test gap, needs coverage
- **No coverage** — Code not tested
- **Timeout** — Infinite loop (counts as killed)
