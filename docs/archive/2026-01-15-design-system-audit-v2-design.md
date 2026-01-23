# Design System Audit v2 — Transitive Dependency Tracking

## Problem

The current audit script (`scripts/audit-design-system.ts`) only checks direct imports from `@typenote/design-system` into desktop app files. It misses:

1. **Internal composition** — KeyboardKey is used by SidebarSearchTrigger, which is used by Sidebar, which is imported by LeftSidebar.tsx
2. **Function exports** — `toast()` function vs `Toast` component
3. **Transitive usage** — Components that are "used" because they're bundled inside other components

This causes the audit to report components like KeyboardKey, MultiselectDropdown, and Toast as "theoretical" (0 usages) when they're actually in use.

## Solution

Build a dependency graph of design-system components, then trace what desktop actually uses (directly and transitively).

## Design

### 1. Dependency Graph Builder

Scans the design-system to build a map of internal component dependencies.

```typescript
type ComponentGraph = {
  [componentName: string]: {
    directDeps: string[];      // Components this one imports internally
    exports: string[];         // What it exports (components, hooks, functions)
  }
}

// Example:
{
  "Sidebar": {
    directDeps: ["KeyboardKey", "ScrollArea", "Button"],
    exports: ["Sidebar", "SidebarTypeItem", "SidebarSearchTrigger"]
  },
  "KeyboardKey": {
    directDeps: [],
    exports: ["KeyboardKey"]
  }
}
```

**How it works:**

1. Glob all `packages/design-system/src/components/*/`
2. For each component folder, parse `.tsx` files
3. Extract imports from other design-system components (relative `../` imports)
4. Extract exports from `index.ts`

### 2. Desktop Usage Tracer

Scans desktop app files to find direct imports, then expands via graph.

**Process:**

1. Scan `apps/desktop/src/**/*.tsx` for imports from `@typenote/design-system`
2. For each file, collect direct imports: `["Sidebar", "Button", "Text"]`
3. Expand using graph: Sidebar → adds KeyboardKey, ScrollArea (transitive)
4. Output per-file and aggregate usage

### 3. JSON Report (`design-system-usage.json`)

Committed to repo. Shows what's used and how.

```json
{
  "generated": "2026-01-15T12:00:00Z",
  "summary": {
    "totalComponents": 32,
    "usedDirectly": 27,
    "usedTransitively": 4,
    "unused": 1
  },
  "byComponent": {
    "KeyboardKey": {
      "status": "transitive",
      "usedBy": ["LeftSidebar.tsx"],
      "via": ["Sidebar.SidebarSearchTrigger"]
    },
    "Sidebar": {
      "status": "direct",
      "usedBy": ["LeftSidebar.tsx"]
    },
    "NotesCreatedList": {
      "status": "unused"
    }
  },
  "byFile": {
    "LeftSidebar.tsx": {
      "direct": ["Sidebar", "MiniCalendar", "Button"],
      "transitive": ["KeyboardKey", "ScrollArea"]
    }
  }
}
```

### 4. CLI Output

Enhanced to show transitive usage:

```
🔍 Scanning design system...

✅ Sidebar (1 direct) → LeftSidebar.tsx
   └─ transitive: KeyboardKey, ScrollArea
✅ Button (3 direct) → TagPickerModal.tsx, LeftSidebar.tsx, CalendarHeader.tsx
✅ KeyboardKey (0 direct, 2 transitive) → via Sidebar, InteractiveEditor
✅ Toast (1 direct) → App.tsx (via toast function + Toaster)
⚪ NotesCreatedList (unused) ← OPTIONAL

────────────────────────────────────────────
📊 Summary: 31/32 used (97%)
   Direct: 27 | Transitive: 4 | Unused: 1

📄 Report written to design-system-usage.json
```

## Implementation

### Files to Modify

| File                             | Change                                  |
| -------------------------------- | --------------------------------------- |
| `scripts/audit-design-system.ts` | Replace with graph-based implementation |
| `design-system-usage.json`       | New file (committed)                    |
| `.gitignore`                     | Ensure report is NOT ignored            |

### Algorithm

```typescript
function audit() {
  // 1. Build internal dependency graph
  const graph = buildComponentGraph();

  // 2. Find direct imports in desktop
  const directUsage = scanDesktopImports();

  // 3. Expand to transitive usage
  const fullUsage = expandTransitive(directUsage, graph);

  // 4. Generate report
  const report = generateReport(graph, fullUsage);

  // 5. Write JSON and print CLI output
  writeReport(report);
  printSummary(report);
}
```

## Not Included

**ESLint enforcement rule** — A rule like "prefer `<Button>` over `<button>`" was considered but deemed too noisy. The real design system bypasses are subtler (custom card-like components) and hard to detect automatically. Can revisit if a pattern of bypassing emerges.

## Success Criteria

- [ ] KeyboardKey shows as "transitive" (used via Sidebar)
- [ ] MultiselectDropdown shows as "transitive" (used via PropertyItem, TypeBrowser)
- [ ] Toast shows as "direct" (via toast function + Toaster)
- [ ] NotesCreatedList shows as "unused"
- [ ] JSON report is queryable for per-file breakdown
