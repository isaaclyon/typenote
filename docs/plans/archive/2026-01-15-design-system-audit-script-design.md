# Design System Audit Script

**Date:** 2026-01-15
**Status:** Approved

## Overview

A standalone TypeScript script that deterministically scans the design system for components and identifies which ones are "theoretical" (exist in design-system with Ladle stories but are never imported in the desktop app).

## Problem

The `docs/design-system-migration.md` checklist requires manual maintenance and can become stale. We need an automated way to verify migration status.

## Solution

### Script Location

`scripts/audit-design-system.ts`

### Justfile Command

```justfile
# Audit design system migration status
audit-design-system:
    npx tsx scripts/audit-design-system.ts
```

### Algorithm

1. Scan `packages/design-system/src/components/*/index.ts` for named exports
2. For each exported component, search `apps/desktop/src/**/*.tsx` for imports from `@typenote/design-system`
3. Stream results to stdout with color-coded status
4. Print summary with percentage and list of theoretical components

### Output Format

```
🔍 Scanning design system...

✅ Button (12 usages) → App.tsx, CalendarHeader.tsx, ...
✅ Sidebar (1 usage) → LeftSidebar.tsx
❌ InteractiveEditor (0 usages) ← THEORETICAL
❌ EditorPreview (0 usages) ← THEORETICAL

────────────────────────────────────────────
📊 Summary: 29/33 migrated (88%)
   Theoretical: InteractiveEditor, EditorPreview, NotesCreatedList, TagChip
```

### Detection Logic

**Finding exports:**

- Parse `index.ts` files for `export { Foo } from './...'` patterns
- Skip type-only exports (`export type { ... }`)
- Handle `as` aliases

**Finding usages:**

- Search for `import { ComponentName } from '@typenote/design-system'`
- Skip type-only imports
- Deduplicate file matches

**Edge cases:**

- Type-only imports → Skip (not real usage)
- Wrapper components → Count as usage (LeftSidebar using Sidebar counts)
- Compound components → Group under parent name

### Dependencies

None new required:

- `glob` — Already in devDependencies
- `tsx` — Already available

## Implementation

See `scripts/audit-design-system.ts` for the full implementation.

The script:

1. Uses `globSync` to find component directories
2. Parses `index.ts` files with regex to extract named exports
3. Searches desktop app files for matching imports
4. Streams color-coded results to stdout
5. Prints summary with migration percentage

## Future Enhancements

- JSON output flag (`--json`) for CI integration
- GitHub Actions workflow to comment on PRs
- Track sub-component usage (e.g., CommandPaletteInput separately from CommandPalette)
- Compare against `docs/design-system-migration.md` and flag discrepancies
