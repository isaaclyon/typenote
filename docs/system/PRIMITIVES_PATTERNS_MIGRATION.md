# Primitives/Patterns/Features Migration Plan

**Date:** 2026-01-18

This document outlines the shift from atoms/molecules/organisms to primitives/patterns/features, and how to migrate the current design-system components.

---

## Goals

- Reduce taxonomy friction while keeping design-system discipline.
- Keep Ladle as the proving ground for reusable UI.
- Separate domain-specific UI from reusable primitives/patterns.

---

## Target Structure

```
packages/design-system/src/
├── primitives/
├── patterns/
└── index.ts
```

```
apps/desktop/src/
└── features/
```

---

## Rules of the Road

- **Primitives:** No domain nouns, no IPC, no routing, no data fetching.
- **Patterns:** Reusable compositions with no domain logic.
- **Features:** Domain-specific components; may use IPC, routing, app state.
- **Graduation:** Build in features first, promote to patterns after 2–3 real uses, promote to primitives rarely.

---

## Current Component Mapping (Post-Reset)

### Primitives

- Button
- Input
- Label
- Checkbox
- Badge
- Skeleton
- IconButton
- Divider
- Tooltip
- Card

### Patterns

- CheckboxField
- SearchInput

### Features (Future)

- Sidebar
- AppShell
- InteractiveEditor
- TypeBrowser

---

## Migration Steps

1. **Create new folders** `primitives/` and `patterns/` in design-system.
2. **Move components** from `components/` into their mapped folder.
3. **Update exports** in `packages/design-system/src/index.ts` and new folder `index.ts` files.
4. **Update import paths** within stories and component files.
5. **Verify Ladle** stories still render correctly.
6. **Do not move features** into design-system; keep them in app code.

---

## Recommended Order

1. Move primitives first (Button/Input/etc).
2. Move patterns next (SearchInput/CheckboxField).
3. Add a temporary re-export layer from `components/` to avoid churn (optional).
4. Update documentation references.

---

## Notes

- Keep `components/` during migration to avoid breaking imports.
- Remove `components/` only after all consumers migrate.
- Update `agent-docs/rules/design-system.md` when folder move is complete.
