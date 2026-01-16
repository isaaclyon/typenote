# Hook Metrics System + New Validation Hooks

**Date:** 2026-01-16
**Status:** Approved Design
**Goal:** Add metrics tracking to all hooks + implement two new validation hooks (renderer IPC, migration safety)

## Overview

This design adds observability to the Claude Code hook system via SQLite-based metrics tracking, plus two new architectural validation hooks that were identified as valuable during hook review.

**What we're building:**

1. Shared metrics utility for all hooks
2. Query script for viewing metrics
3. Renderer IPC validation hook
4. Migration safety validation hook

**Why:**

- **Metrics:** Understand which hooks provide value, identify false positives, debug hook behavior
- **Renderer IPC:** Enforce type-safe IPC patterns, prevent security issues from direct storage access
- **Migration safety:** Catch destructive operations before they're committed

## Requirements

### Metrics System

**Must track:**

- ✅ Invocations (every hook run, even early exits)
- ✅ Violations (exit code 2 - found issues)
- ✅ Execution time (performance monitoring)
- ✅ Failures (exit code 1 - hook errors)

**Must provide:**

- ✅ Summary view (total runs, violation rate, avg duration per hook)
- ✅ Recent violations (last 20 with file paths)
- ✅ Slowest runs (performance outliers)
- ✅ Recent activity (last 30 hook executions)

**Constraints:**

- Database location: `.claude/metrics.db` (project-local)
- Fail gracefully if metrics fails (don't break hooks)
- Minimal overhead (<5ms per hook)
- Simple bash script for queries (no external tools)

### Renderer IPC Validation

**Must enforce:**

- ✅ Use `window.typenoteAPI.*` instead of direct `ipcRenderer` calls
- ✅ IPC channel names follow convention: `typenote:resource:action`
- ⚠️ Warn if missing error handling on IPC calls

**Targets:** `apps/desktop/src/renderer/**/*.{ts,tsx}`

### Migration Safety Validation

**Must catch:**

- ❌ Destructive operations (DROP, TRUNCATE) without `@migration-destructive` comment
- ⚠️ Breaking schema changes (ALTER COLUMN TYPE, NOT NULL without DEFAULT)

**Targets:** `packages/storage/drizzle/**/*.sql`, `packages/storage/migrations/**/*.sql`

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Individual Hooks (12 existing + 2 new)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ package-     │  │ renderer-    │  │ migration-   │      │
│  │ boundary     │  │ ipc          │  │ safety       │ ...  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                            ▼                                 │
│         ┌─────────────────────────────────┐                 │
│         │  .claude/hooks/lib/metrics.sh   │                 │
│         │  - init_metrics_db()            │                 │
│         │  - log_hook_metric()            │                 │
│         └─────────────┬───────────────────┘                 │
│                       │                                      │
│                       ▼                                      │
│         ┌─────────────────────────────────┐                 │
│         │   .claude/metrics.db (SQLite)   │                 │
│         │   - hook_runs table             │                 │
│         │   - Indexes on name/time/code   │                 │
│         └─────────────┬───────────────────┘                 │
└───────────────────────┼─────────────────────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────┐
         │ .claude/scripts/show-metrics.sh │
         │ - summary                       │
         │ - violations                    │
         │ - slowest                       │
         │ - recent                        │
         │ - reset                         │
         └─────────────────────────────────┘
```

### Database Schema

**Table: `hook_runs`**

| Column          | Type    | Description                                            |
| --------------- | ------- | ------------------------------------------------------ |
| id              | INTEGER | Primary key (autoincrement)                            |
| hook_name       | TEXT    | Hook script name (e.g., "package-boundary-validation") |
| timestamp       | TEXT    | ISO 8601 UTC (e.g., "2026-01-16T10:30:45Z")            |
| exit_code       | INTEGER | 0=success, 2=violation, 1=error                        |
| duration_ms     | INTEGER | Execution time in milliseconds                         |
| file_path       | TEXT    | File that triggered hook (nullable)                    |
| violation_count | INTEGER | Number of violations found (default 0)                 |

**Indexes:**

- `idx_hook_name` on `hook_name` (filter by hook)
- `idx_timestamp` on `timestamp` (time-range queries)
- `idx_exit_code` on `exit_code` (filter by outcome)

**Size estimate:** ~50 bytes/row, 10K runs = 500KB

## Implementation Details

### 1. Shared Metrics Utility

**File:** `.claude/hooks/lib/metrics.sh`

**Functions:**

```bash
init_metrics_db()
  - Creates .claude/metrics.db if not exists
  - Defines schema with indexes
  - Idempotent (safe to call multiple times)

log_hook_metric(hook_name, exit_code, duration_ms, file_path, violation_count)
  - Inserts row into hook_runs table
  - Auto-generates timestamp (UTC)
  - Handles nulls for optional fields
```

**Integration pattern** (add to all hooks):

```bash
#!/bin/bash
set -euo pipefail

# Source metrics utility (fail gracefully if missing)
source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true

hook_name="my-validation-hook"
start_time=$(date +%s%3N)  # Milliseconds since epoch

# ... existing validation logic ...
# Sets: violation_count, file_path

# At exit, log metrics
exit_code=$?
end_time=$(date +%s%3N)
duration_ms=$((end_time - start_time))
log_hook_metric "$hook_name" "$exit_code" "$duration_ms" "$file_path" "$violation_count"
exit $exit_code
```

**Failure modes:**

- If metrics.sh missing: `|| true` prevents hook failure
- If SQLite fails: Hook continues, error logged to stderr
- If database locked: SQLite retries (default timeout)

### 2. Metrics Query Script

**File:** `.claude/scripts/show-metrics.sh`

**Commands:**

| Command      | Description                             | SQL Query                        |
| ------------ | --------------------------------------- | -------------------------------- |
| `summary`    | Overview by hook (runs/violations/time) | GROUP BY hook_name, aggregates   |
| `violations` | Last 20 violations with file paths      | WHERE exit_code=2, ORDER BY time |
| `slowest`    | Top 10 slowest runs                     | ORDER BY duration_ms DESC        |
| `recent`     | Last 30 hook executions                 | ORDER BY timestamp DESC          |
| `reset`      | Delete database (fresh start)           | rm -f .claude/metrics.db         |

**Output format:** sqlite3 `-box` mode (ASCII tables)

**Usage:**

```bash
.claude/scripts/show-metrics.sh summary
.claude/scripts/show-metrics.sh violations
```

### 3. Renderer IPC Validation Hook

**File:** `.claude/hooks/renderer-ipc-validation.sh`

**Validation rules:**

**Rule 1: Block direct ipcRenderer usage**

```bash
# Violation: ipcRenderer.invoke() or ipcRenderer.send()
# Allowed: window.typenoteAPI.*

if grep -qE "ipcRenderer\.(invoke|send)" "$file_path"; then
  violation="❌ Direct ipcRenderer usage in renderer"
  violation="${violation}\n   Use window.typenoteAPI.* for type-safe IPC"
  violation="${violation}\n   Preload bridge: apps/desktop/src/preload/"
  exit 2
fi
```

**Rule 2: Validate IPC channel naming**

```bash
# Pattern: typenote:resource:action
# Example: typenote:object:get, typenote:block:update

while IFS= read -r line; do
  if [[ $line =~ invoke\(['\"]([^'\"]+)['\"] ]]; then
    channel="${BASH_REMATCH[1]}"
    if [[ ! $channel =~ ^typenote:[a-z]+:[a-z]+ ]]; then
      violation="⚠️  Bad IPC channel: '$channel'"
      violation="${violation}\n   Expected: 'typenote:resource:action'"
      exit 2
    fi
  fi
done < <(grep "invoke(" "$file_path")
```

**Rule 3: Warn on missing error handling**

```bash
# Non-blocking warning - good practice but not fatal

if grep -qE "window\.typenoteAPI\.[a-zA-Z]+\(" "$file_path"; then
  # Check if followed by .catch() or try/catch
  if ! grep -qE "(\.catch\(|try\s*\{)" "$file_path"; then
    echo "⚠️  Consider error handling for IPC calls" >&2
    echo "   Pattern: const result = await api.call(); if (!result.ok) { ... }" >&2
  fi
fi
```

**Target paths:**

- `apps/desktop/src/renderer/**/*.ts`
- `apps/desktop/src/renderer/**/*.tsx`

**Exit codes:**

- 0: Clean
- 2: Direct ipcRenderer or bad channel names (blocking)
- Warning only: Missing error handling (non-blocking)

### 4. Migration Safety Validation Hook

**File:** `.claude/hooks/migration-safety-validation.sh`

**Validation rules:**

**Rule 1: Destructive operations need safety comment**

```bash
# Require: -- @migration-destructive: [explanation]
# For: DROP TABLE, DROP COLUMN, TRUNCATE, DELETE without WHERE

destructive_ops=("DROP TABLE" "DROP COLUMN" "TRUNCATE")

for op in "${destructive_ops[@]}"; do
  if grep -iq "$op" "$file_path"; then
    if ! head -20 "$file_path" | grep -q "@migration-destructive"; then
      violation="❌ Destructive operation without safety comment: $op"
      violation="${violation}\n   Add: -- @migration-destructive: [why this is safe]"
      violation="${violation}\n   Example: -- @migration-destructive: removing unused temp table"
      exit 2
    fi
  fi
done
```

**Rule 2: Warn on breaking schema changes**

```bash
# ALTER COLUMN TYPE - may break data
if grep -iq "ALTER COLUMN.*TYPE" "$file_path"; then
  echo "⚠️  ALTER COLUMN TYPE detected - verify data compatibility" >&2
fi

# NOT NULL without DEFAULT - fails on existing rows
if grep -iq "ADD COLUMN.*NOT NULL" "$file_path" && ! grep -q "DEFAULT" "$file_path"; then
  violation="⚠️  NOT NULL column without DEFAULT"
  violation="${violation}\n   Will fail if table has rows. Add DEFAULT or backfill."
  echo -e "$violation" >&2
fi
```

**Target paths:**

- `packages/storage/drizzle/**/*.sql`
- `packages/storage/migrations/**/*.sql`

**Exit codes:**

- 0: Clean
- 2: Destructive operation without comment (blocking)
- Warning: Breaking changes (non-blocking)

## Integration with Existing Hooks

**Changes to `.claude/settings.json`:**

Add new hooks to PostToolUse and PreToolUse:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          // ... existing hooks ...
          {
            "command": "./.claude/hooks/renderer-ipc-validation.sh",
            "type": "command"
          },
          {
            "command": "./.claude/hooks/migration-safety-validation.sh",
            "type": "command"
          }
        ],
        "matcher": "Edit|Write"
      }
    ]
  }
}
```

**Migrate existing hooks:**

Each of the 12 existing hooks needs metrics integration:

1. Add `source` line at top
2. Capture start time before validation
3. Log metrics before exit

**Example migration:**

```diff
 #!/bin/bash
 set -euo pipefail

+# Source metrics utility
+source "$(dirname "$0")/lib/metrics.sh" 2>/dev/null || true
+
+hook_name="package-boundary-validation"
+start_time=$(date +%s%3N)
+
 # Read JSON input from stdin
 input=$(cat)

 # ... existing validation logic ...

+# Log metrics before exit
+exit_code=$?
+end_time=$(date +%s%3N)
+duration_ms=$((end_time - start_time))
+log_hook_metric "$hook_name" "$exit_code" "$duration_ms" "$file_path" "$violation_count"
 exit $exit_code
```

## Testing Plan

### 1. Metrics System

**Test scenarios:**

- ✅ Database creation on first run
- ✅ Metrics logged for successful hook (exit 0)
- ✅ Metrics logged for violation (exit 2)
- ✅ Metrics logged for error (exit 1)
- ✅ Duration tracking works
- ✅ Query script displays correct data
- ✅ Reset command clears database

**Manual test:**

```bash
# Trigger a hook violation
echo "import { db } from '@typenote/storage'" >> packages/api/src/test.ts

# Check metrics
.claude/scripts/show-metrics.sh summary
.claude/scripts/show-metrics.sh violations

# Reset
.claude/scripts/show-metrics.sh reset
```

### 2. Renderer IPC Validation

**Test scenarios:**

- ✅ Blocks `ipcRenderer.invoke()` in renderer
- ✅ Allows `window.typenoteAPI.*` calls
- ✅ Validates channel naming convention
- ✅ Warns on missing error handling
- ✅ Only runs on renderer files (not main process)

**Test files:**

```typescript
// Should block
import { ipcRenderer } from 'electron';
ipcRenderer.invoke('get-data');

// Should allow
window.typenoteAPI.getDocument(id);

// Should warn
await window.typenoteAPI.getData(); // No error handling
```

### 3. Migration Safety

**Test scenarios:**

- ✅ Blocks DROP TABLE without comment
- ✅ Allows DROP TABLE with `@migration-destructive`
- ✅ Warns on ALTER COLUMN TYPE
- ✅ Warns on NOT NULL without DEFAULT
- ✅ Only runs on migration files

**Test migration:**

```sql
-- Should block
DROP TABLE old_table;

-- Should allow
-- @migration-destructive: removing unused table from v0.1
DROP TABLE old_table;

-- Should warn
ALTER TABLE users ALTER COLUMN role TYPE integer;
```

## Rollout Plan

**Phase 1: Metrics foundation**

1. Create `.claude/hooks/lib/` directory
2. Implement `metrics.sh` utility
3. Implement `show-metrics.sh` query script
4. Test with one hook (package-boundary-validation)
5. Verify metrics collection works

**Phase 2: Migrate existing hooks**

1. Add metrics integration to all 12 hooks
2. Test each hook generates metrics
3. Run `.claude/scripts/show-metrics.sh summary` to verify

**Phase 3: New validation hooks**

1. Implement renderer-ipc-validation.sh
2. Test with renderer files
3. Implement migration-safety-validation.sh
4. Test with migration files
5. Add to `.claude/settings.json`

**Phase 4: Documentation**

1. Add metrics guide to `.claude/README.md`
2. Document query script usage
3. Update hook development guide

## Success Criteria

**Metrics system:**

- ✅ All hooks log metrics without failures
- ✅ Query script shows accurate data
- ✅ Overhead <5ms per hook (avg)
- ✅ Database stays <10MB after 1 month

**Renderer IPC validation:**

- ✅ Catches direct ipcRenderer usage
- ✅ Zero false positives on valid window.typenoteAPI calls
- ✅ Helps identify preload bridge violations

**Migration safety:**

- ✅ Catches DROP operations without comment
- ✅ Warns on breaking schema changes
- ✅ Zero false positives on safe migrations

## Future Enhancements

**Metrics:**

- Aggregate metrics across multiple developers (shared analytics)
- Chart violation trends over time
- Alert on high error rates

**Renderer IPC:**

- Validate preload bridge type definitions match usage
- Check that all IPC handlers exist in main process

**Migration safety:**

- Detect removed columns still referenced in code
- Validate Drizzle schema matches migration SQL
- Check index creation performance on large tables

## Open Questions

None - design approved.

## References

- Existing hooks: `.claude/hooks/*.sh`
- Hook configuration: `.claude/settings.json`
- Architecture rules: `.claude/rules/architecture.md`
- Backend contract: `docs/foundational/backend_contract.md`
