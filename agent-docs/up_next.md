# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building additional primitives and patterns for features
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Documentation preserved: agent-docs/to-extract/skills/design-principles/, /docs/system/
- ✅ Ladle configured and ready
- ✅ **16 primitives** implemented with co-located stories
- ✅ 2 patterns implemented with co-located stories
- ✅ Focus styling updated to subtle outlines
- ✅ Primitives/patterns migration complete (components/ has compat re-exports)
- ✅ **All interactive primitives now use shadcn/Radix** for accessibility
- ❌ Renderer is placeholder only (no sidebar, no editor, no navigation)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — 16 complete, 2 in progress (ScrollArea, DropdownMenu)
2. **Patterns** — CheckboxField ✅, SearchInput ✅, more planned (see below)
3. **Features** — Sidebar, AppShell, InteractiveEditor

### Primitive Inventory

**Complete (16):**

- Button ✅
- Input ✅
- Label ✅ (Radix)
- Checkbox ✅ (Radix)
- Badge ✅
- Skeleton ✅
- IconButton ✅
- Divider ✅
- Tooltip ✅ (Radix)
- Card ✅
- Switch ✅ (Radix)
- Radio ✅ (Radix)
- Select ✅ (Radix)
- Textarea ✅
- Keycap ✅
- Spinner ✅

**In Progress:**

- ScrollArea ⏳ (Radix) — Custom scrollbar for lists
- DropdownMenu ⏳ (Radix) — Action menus, context menus

**Deprioritized:**

- Avatar (single-player app, not needed yet)

### Pattern Inventory

**Complete (2):**

- CheckboxField ✅ — Checkbox + Label + help text
- SearchInput ✅ — Input with search icon

**Planned (6):**

- NavItem — Sidebar navigation item (icon, label, count, action menu)
- EmptyState — Icon + heading + description + optional action
- InputField — Input + Label + help/error text
- RadioField — RadioGroup + Label + help text
- SelectField — Select + Label + help/error text
- SwitchField — Switch + Label + help text

### Immediate Next Steps

1. **Build ScrollArea primitive** (Radix-based)
2. **Build DropdownMenu primitive** (Radix-based)
3. **Build NavItem pattern** (needs DropdownMenu for action menu)
4. Continue with remaining patterns
5. Start feature components (Sidebar, AppShell)

### Folder Structure

- `src/primitives/` — 16+ atoms with stories
- `src/patterns/` — 2+ molecules with stories
- `src/components/` — backward-compat re-exports only

### Reference

- Previous implementation available via `pre-reset` git tag (`88eefdd`)
- Design principles: `agent-docs/to-extract/skills/design-principles/`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## Design Decisions Log

Detailed design decisions for components being built. Serves as a reference during implementation.

### ScrollArea (Primitive)

| Aspect          | Decision                                   |
| --------------- | ------------------------------------------ |
| Implementation  | Radix `@radix-ui/react-scroll-area`        |
| Visibility      | Fade in/out with hover reveal (200ms ease) |
| Scrollbar width | 8px                                        |
| Thumb color     | `gray-300` (hover: `gray-400`)             |
| Border radius   | Fully rounded (rounded-full)               |
| Orientation     | Both available via prop, vertical default  |

**Props:**

```tsx
interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal' | 'both';
}
```

### DropdownMenu (Primitive)

| Aspect         | Decision                              |
| -------------- | ------------------------------------- |
| Implementation | Radix `@radix-ui/react-dropdown-menu` |
| Trigger        | Flexible (any element via asChild)    |
| Animation      | Subtle fade + scale (150ms ease-out)  |
| Styling        | Shadow-md, rounded-md, white bg       |

**Compound components:** Trigger, Content, Item, Separator, Label, Sub, etc.

### NavItem (Pattern)

| Aspect      | Decision                                                                  |
| ----------- | ------------------------------------------------------------------------- |
| Height      | ~28px (per sidebar spec)                                                  |
| Icon        | Component type (`LucideIcon`), 14px                                       |
| Icon color  | Optional `color` prop tints the icon                                      |
| Label       | Fills middle, text-sm, medium weight                                      |
| Count badge | Hover-only, appears on row hover                                          |
| Action menu | "..." button on right, triggers DropdownMenu                              |
| States      | Default, hover (gray-50 bg), active (accent-50 bg, accent text), disabled |

**Visual structure:**

```
[Icon] Label                    [Count] [...]
   ^                               ^      ^
colored via prop           hover-only  action menu
```

**Props:**

```tsx
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  color?: string; // Tints the icon
  onClick?: () => void;
  href?: string; // Link semantics
  actions?: NavItemAction[];
}

interface NavItemAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  destructive?: boolean; // Red styling
}
```

### EmptyState (Pattern)

| Aspect      | Decision                     |
| ----------- | ---------------------------- |
| Icon        | Large (40px+), muted opacity |
| Heading     | text-base, medium weight     |
| Description | text-sm, muted color         |
| Action      | Optional primary Button      |
| Background  | gray-50, dashed border       |

**Props:**

```tsx
interface EmptyStateProps {
  icon?: LucideIcon;
  heading: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### InputField (Pattern)

| Aspect      | Decision                                 |
| ----------- | ---------------------------------------- |
| Layout      | Vertical stack: Label, Input, Help/Error |
| Error state | Red border on input, red help text       |
| Required    | Asterisk on label                        |

**Props:**

```tsx
interface InputFieldProps extends InputProps {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
}
```

### RadioField (Pattern)

| Aspect      | Decision                                      |
| ----------- | --------------------------------------------- |
| Layout      | Label above, RadioGroup below, help at bottom |
| Orientation | RadioGroup handles horizontal/vertical        |

**Props:**

```tsx
interface RadioFieldProps extends RadioGroupProps {
  label: string;
  help?: string;
  children: React.ReactNode; // RadioItems
}
```

### SelectField (Pattern)

| Aspect      | Decision                                  |
| ----------- | ----------------------------------------- |
| Layout      | Vertical stack: Label, Select, Help/Error |
| Error state | Red border on trigger, red help text      |

**Props:**

```tsx
interface SelectFieldProps {
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode; // SelectItems
}
```

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

Current E2E tests expect UI elements that no longer exist (sidebar navigation, TypeBrowser, editor). Tests will be updated as components are rebuilt in Ladle and integrated into the desktop app.

### Quality & Performance

- [x] Improve mutation testing scores (api: 86.92%, core: 96.50%, storage: 77.51%)
- [x] Mutation testing parallel agent experiment — ~80 tests added, +16% on duplicateObjectService.ts
- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                              | Date       | Commits   |
| ------------------------------------ | ---------- | --------- |
| Spinner primitive                    | 2026-01-18 | `fd4cf3c` |
| Radix migration (5 primitives)       | 2026-01-18 | `6120d2f` |
| Keycap, Textarea, Select primitives  | 2026-01-18 | `a800321` |
| Radio primitive                      | 2026-01-18 | `af27675` |
| Switch primitive                     | 2026-01-18 | `9ccc7b1` |
| Primitives/Patterns Migration        | 2026-01-18 | `e3a0c5d` |
| Design System Atoms + Focus Outlines | 2026-01-18 | `af21b05` |
| Design System Full Reset             | 2026-01-18 | `3fdbd5d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
