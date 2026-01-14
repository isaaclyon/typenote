# Color Centralization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Centralize hardcoded color values into semantic tokens and shared constants for maintainability.

**Architecture:** Create two new files: `semanticColors.ts` for component hex values (success/error/warning/info) and `demoColors.ts` for story mock data. Extract InteractiveEditor inline styles to CSS file with variables.

**Tech Stack:** TypeScript, Tailwind CSS v4 (CSS variables in @theme), Ladle stories

---

## Context

Audit identified 40+ hardcoded hex values across 12 component files and 7 story files. Priority order:

1. **High**: Toast, Badge, mockTags (semantic colors)
2. **Medium**: Editor inline styles, default icon colors
3. **Low**: Story demo data (consistency nice-to-have)

---

### Task 1: Create Semantic Colors Constants

**Files:**

- Create: `packages/design-system/src/constants/semanticColors.ts`
- Modify: `packages/design-system/src/constants/index.ts`

**Step 1: Create the semantic colors file**

```typescript
/**
 * Semantic color constants for components that need hex values.
 * Maps to CSS variables in tokens/index.css
 */

export const SEMANTIC_COLORS = {
  success: '#81c784',
  successDark: '#2e7d32',
  warning: '#ffb74d',
  warningDark: '#e65100',
  error: '#e57373',
  errorDark: '#d32f2f',
  info: '#6495ED',
  infoDark: '#3d5fc2',
} as const;

export type SemanticColor = keyof typeof SEMANTIC_COLORS;
```

**Step 2: Export from constants index**

Add to `packages/design-system/src/constants/index.ts`:

```typescript
export * from './semanticColors.js';
```

**Step 3: Commit**

```bash
git add packages/design-system/src/constants/semanticColors.ts packages/design-system/src/constants/index.ts
git commit -m "feat(design-system): add semantic colors constants"
```

---

### Task 2: Update Toast Component

**Files:**

- Modify: `packages/design-system/src/components/Toast/Toast.tsx`

**Step 1: Import semantic colors**

Add import at top:

```typescript
import { SEMANTIC_COLORS } from '../../constants/semanticColors.js';
```

**Step 2: Replace hardcoded hex values**

Find the variant color definitions (around lines 12-15) and replace:

- `#81c784` → `SEMANTIC_COLORS.success`
- `#e57373` → `SEMANTIC_COLORS.error`
- `#ffb74d` → `SEMANTIC_COLORS.warning`
- `#6495ED` → `SEMANTIC_COLORS.info`

And their dark variants:

- `#4caf50` or `#2e7d32` → `SEMANTIC_COLORS.successDark`
- `#d32f2f` → `SEMANTIC_COLORS.errorDark`
- `#f57c00` or `#e65100` → `SEMANTIC_COLORS.warningDark`
- `#3d5fc2` → `SEMANTIC_COLORS.infoDark`

**Step 3: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Check Toast stories render correctly with same colors.

**Step 4: Commit**

```bash
git add packages/design-system/src/components/Toast/Toast.tsx
git commit -m "refactor(design-system): use semantic colors in Toast"
```

---

### Task 3: Update Badge Component

**Files:**

- Modify: `packages/design-system/src/components/Badge/Badge.tsx`

**Step 1: Import semantic colors**

```typescript
import { SEMANTIC_COLORS } from '../../constants/semanticColors.js';
```

**Step 2: Replace hardcoded hex values**

Around lines 12-13:

- `#81c784` → `SEMANTIC_COLORS.success`
- `#2e7d32` → `SEMANTIC_COLORS.successDark`
- `#ffb74d` → `SEMANTIC_COLORS.warning`
- `#e65100` → `SEMANTIC_COLORS.warningDark`

**Step 3: Verify in Ladle**

Check Badge stories render correctly.

**Step 4: Commit**

```bash
git add packages/design-system/src/components/Badge/Badge.tsx
git commit -m "refactor(design-system): use semantic colors in Badge"
```

---

### Task 4: Create Demo Colors for Stories

**Files:**

- Create: `packages/design-system/src/constants/demoColors.ts`

**Step 1: Create demo colors file**

```typescript
/**
 * Demo/story data color palette.
 * Used for consistent mock data across Ladle stories.
 */

export const DEMO_TYPE_COLORS = {
  // Primary types
  notes: '#6495ED', // Cornflower blue (accent)
  tasks: '#81c784', // Success green
  events: '#ffb74d', // Warning amber
  people: '#8B5CF6', // Violet
  places: '#F59E0B', // Amber

  // Status colors
  active: '#22C55E', // Green
  inactive: '#6B7280', // Gray
  urgent: '#EF4444', // Red
  pending: '#3B82F6', // Blue

  // Tags
  frontend: '#3B82F6',
  backend: '#22C55E',
  design: '#8B5CF6',
  bug: '#EF4444',
  feature: '#F59E0B',
  docs: '#6B7280',
} as const;

export type DemoTypeColor = keyof typeof DEMO_TYPE_COLORS;
```

**Step 2: Export from constants index**

Add to `packages/design-system/src/constants/index.ts`:

```typescript
export * from './demoColors.js';
```

**Step 3: Commit**

```bash
git add packages/design-system/src/constants/demoColors.ts packages/design-system/src/constants/index.ts
git commit -m "feat(design-system): add demo colors for stories"
```

---

### Task 5: Update mockTags.ts

**Files:**

- Modify: `packages/design-system/src/components/InteractiveEditor/mocks/mockTags.ts`

**Step 1: Import demo colors**

```typescript
import { DEMO_TYPE_COLORS } from '../../../constants/demoColors.js';
```

**Step 2: Replace hardcoded hex values**

Replace the 8 hardcoded colors (around lines 19-28):

- `#3B82F6` → `DEMO_TYPE_COLORS.frontend` or `DEMO_TYPE_COLORS.pending`
- `#22C55E` → `DEMO_TYPE_COLORS.active`
- `#EF4444` → `DEMO_TYPE_COLORS.bug` or `DEMO_TYPE_COLORS.urgent`
- `#6B7280` → `DEMO_TYPE_COLORS.inactive`
- `#8B5CF6` → `DEMO_TYPE_COLORS.design`
- `#F59E0B` → `DEMO_TYPE_COLORS.feature`

**Step 3: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/mocks/mockTags.ts
git commit -m "refactor(design-system): use demo colors in mockTags"
```

---

### Task 6: Create Default Icon Color Constant

**Files:**

- Create: `packages/design-system/src/constants/defaults.ts`
- Modify: `packages/design-system/src/components/NotesCreatedList/NotesCreatedList.tsx`
- Modify: `packages/design-system/src/components/BacklinkItem/BacklinkItem.tsx`

**Step 1: Create defaults file**

```typescript
/**
 * Default values used across components.
 */

// Warm gray that matches --color-gray-500 from tokens
export const DEFAULT_ICON_COLOR = '#78716c';
```

**Step 2: Export from constants index**

```typescript
export * from './defaults.js';
```

**Step 3: Update NotesCreatedList**

Replace inline `DEFAULT_ICON_COLOR = '#78716c'` with import from constants.

**Step 4: Update BacklinkItem**

Replace `typeColor || '#78716c'` with `typeColor || DEFAULT_ICON_COLOR`.

**Step 5: Commit**

```bash
git add packages/design-system/src/constants/defaults.ts packages/design-system/src/constants/index.ts
git add packages/design-system/src/components/NotesCreatedList/NotesCreatedList.tsx
git add packages/design-system/src/components/BacklinkItem/BacklinkItem.tsx
git commit -m "refactor(design-system): centralize default icon color"
```

---

### Task 7: Extract Editor Inline Styles (Optional)

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/styles/editor.css`
- Modify: `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx`

**Step 1: Create CSS file with variables**

```css
/* Editor-specific color overrides using CSS variables */

.ProseMirror p.is-editor-empty:first-child::before {
  color: var(--editor-placeholder, #9ca3af);
}

.ProseMirror blockquote {
  border-left-color: var(--editor-blockquote-border, #e5e7eb);
  color: var(--editor-blockquote-text, #6b7280);
}

.ProseMirror code {
  background-color: var(--editor-code-bg, #f3f4f6);
}

.ProseMirror pre {
  background-color: var(--editor-pre-bg, #1f2937);
  color: var(--editor-pre-text, #f9fafb);
}
```

**Step 2: Import CSS and remove inline styles**

In InteractiveEditor.tsx, replace inline `<style>` tag with CSS import:

```typescript
import './styles/editor.css';
```

**Step 3: Verify in Ladle**

Check InteractiveEditor stories render correctly.

**Step 4: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/styles/editor.css
git add packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx
git commit -m "refactor(design-system): extract editor styles to CSS file"
```

---

### Task 8: Update Story Files (Low Priority, Optional)

**Files to update with `DEMO_TYPE_COLORS`:**

- `Sidebar/Sidebar.stories.tsx`
- `AppShell/AppShell.stories.tsx`
- `NotesCreatedList/NotesCreatedList.stories.tsx`
- `EditorPreview/EditorBottomSections.stories.tsx`
- `InteractiveEditor/stories/WikiLinks.stories.tsx`

For each file:

1. Import `DEMO_TYPE_COLORS` from constants
2. Replace hardcoded hex values with constant references
3. Commit individually

---

## Summary

| Task                         | Priority | Estimated Effort |
| ---------------------------- | -------- | ---------------- |
| 1. Semantic colors constants | High     | 5 min            |
| 2. Update Toast              | High     | 10 min           |
| 3. Update Badge              | High     | 5 min            |
| 4. Demo colors constants     | Medium   | 5 min            |
| 5. Update mockTags           | Medium   | 5 min            |
| 6. Default icon color        | Medium   | 10 min           |
| 7. Editor CSS extraction     | Low      | 15 min           |
| 8. Story files               | Low      | 20 min           |

**Total: ~75 min for high+medium priority tasks**
