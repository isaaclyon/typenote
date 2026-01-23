# Unified TitleBar Breadcrumbs Implementation Plan

**Status:** Archived - implemented unified TitleBar breadcrumbs (2026-01-22).

**Goal:** Merge breadcrumbs into the TitleBar, remove the HeaderBar component, and keep chrome as a single row with sidebar controls.

**Scope:** Design-system only (AppShell + TitleBar). Sidebar controls remain in the sidebar header/footer.

**Success Criteria:**

- TitleBar renders breadcrumbs with proper drag/no-drag regions.
- AppShell no longer renders HeaderBar; breadcrumbs appear in TitleBar.
- HeaderBar feature is removed and no references remain.
- Ladle stories updated to reflect the single-row chrome layout.

---

## Task 1: Add Breadcrumb Support to TitleBar

**Files:**

- Modify: `packages/design-system/src/features/TitleBar/TitleBar.tsx`
- Modify: `packages/design-system/src/features/TitleBar/TitleBar.stories.tsx`

**Steps:**

1. Extend `TitleBarProps` with `breadcrumbs?: BreadcrumbItem[]` (import from `patterns/Breadcrumbs`).
2. Increase TitleBar height to `h-9` (36px) to comfortably fit breadcrumbs.
3. Render breadcrumbs centered in the TitleBar using `<Breadcrumbs items={breadcrumbs} />`.
4. Wrap breadcrumbs in an `app-region-no-drag` container so links remain clickable.
5. Ensure the collapse toggle stays `app-region-no-drag` and doesn’t overlap the centered breadcrumbs (use absolute centering + `max-w` if needed).
6. Update stories to include a dedicated “WithBreadcrumbs” example and revise copy to match the new chrome layout.

---

## Task 2: Remove HeaderBar from AppShell

**Files:**

- Modify: `packages/design-system/src/features/AppShell/AppShell.tsx`
- Modify: `packages/design-system/src/features/AppShell/AppShell.stories.tsx`

**Steps:**

1. Remove the `HeaderBar` import and JSX usage.
2. Pass `breadcrumbs` to `TitleBar` instead, and update the prop description to “shown in TitleBar.”
3. Update the layout comment to reflect a single-row chrome (TitleBar + Sidebar + Content).
4. Update all AppShell stories to reflect the new chrome layout text and visuals (no HeaderBar row).

---

## Task 3: Remove HeaderBar Feature

**Files:**

- Delete: `packages/design-system/src/features/HeaderBar/HeaderBar.tsx`
- Delete: `packages/design-system/src/features/HeaderBar/HeaderBar.stories.tsx`
- Delete: `packages/design-system/src/features/HeaderBar/index.ts`
- Modify: `packages/design-system/src/features/index.ts`

**Steps:**

1. Delete the HeaderBar component and stories.
2. Remove HeaderBar exports from the features index.
3. Search for remaining `HeaderBar` references (`rg "HeaderBar"`) and update them if found.

---

## Task 4: Verify

**Steps:**

1. Run `pnpm --filter @typenote/design-system typecheck`.
2. Run `pnpm --filter @typenote/design-system sandbox` and verify:
   - TitleBar shows breadcrumbs and remains draggable outside controls.
   - AppShell stories render without a HeaderBar row.

---

## Task 5: Commit

```bash
git add packages/design-system/src/features docs/plans/2026-01-22-unified-titlebar-breadcrumbs-implementation.md
git commit -m "feat(design-system): merge breadcrumbs into TitleBar"
```
