---
name: e2e-design-implementation
description: Use when implementing UI features requiring design system components - enforces Ladle-first workflow with design system patterns before desktop integration
---

# End-to-End Design Implementation

## Overview

**E2E implementation with design system rigor.**

This skill wraps the base `e2e-implementation` workflow with MANDATORY design system constraints for UI-focused features.

**Core principle:** UI components MUST be built in `packages/design-system/` and verified in Ladle BEFORE desktop integration.

## When to Use

Use e2e-design-implementation for:

- Features requiring new UI components or primitives
- Changes to existing design system components
- Frontend features that touch `apps/desktop/src/renderer/`
- Any work involving visual/interactive elements

**Not for:** Backend-only features, CLI tools, or pure data layer changes (use base `e2e-implementation` instead).

## Design System Constraint (NON-NEGOTIABLE)

```
🚨 ALL UI COMPONENTS MUST BE BUILT IN LADLE FIRST 🚨

packages/design-system/ → Ladle verification → apps/desktop/
```

**NEVER create UI components directly in `apps/desktop/src/renderer/` without design system parity.**

## The Workflow

This skill follows the same 3-phase workflow as `e2e-implementation` BUT enforces design system rules:

### Phase 1: Brainstorming (with Design Focus)

**Action:** Invoke `Skill(superpowers:brainstorming)` with $ARGUMENTS

During brainstorming, identify:

- Which UI components are needed
- Whether they're **primitives**, **patterns**, or **features**
- Which design tokens apply (colors, spacing, typography)
- What Ladle stories are needed

**Design System Build Sequence:**

1. **Primitives** — Foundational building blocks (Button, Input, Icon)
   - Path: `packages/design-system/src/primitives/`
   - No domain nouns, no IPC hooks, no routing
2. **Patterns** — Reusable compositions (SearchInput, FormField)
   - Path: `packages/design-system/src/patterns/`
   - Still no domain nouns or IPC hooks
3. **Features** — Domain-specific UI (Sidebar, TypeBrowser)
   - Path: `packages/design-system/src/components/` (currently)
   - Can use IPC hooks, routing, app state

**Checkpoint 1:** Ask user:

> "Brainstorming complete. UI components identified: [list]. Ready for feature development with Ladle-first workflow?"

### Phase 2: Feature Development (Design-System-First)

**Action:** Invoke `Skill(feature-dev:feature-dev)` with brainstorming context

**CRITICAL ADDITION:** Before implementing ANY UI component:

```
Step 1: Build in Design System
  → Create component in packages/design-system/src/[primitives|patterns|components]/
  → Write Ladle stories covering all variants
  → Start Ladle: pnpm --filter @typenote/design-system sandbox
  → Verify at http://localhost:61000

Step 2: Only Then Integrate
  → Import from @typenote/design-system in desktop app
  → Wire up IPC/data/routing in apps/desktop/src/renderer/
```

**Forbidden Actions:**

- ❌ Creating UI components in `apps/desktop/src/renderer/ui/` without design system first
- ❌ Writing JSX/TSX in renderer without checking design system for existing components
- ❌ Using arbitrary values instead of design tokens (`w-[237px]` → use grid)
- ❌ Skipping Ladle stories "to save time"

**Required Reading:** Load `agent-docs/rules/design-system.md` before implementing UI

**Checkpoint 2:** Ask user:

> "Feature implementation complete. All UI components built in design system first. Ready for TDD verification?"

### Phase 3: TDD Verification

**Action:** Invoke `Skill(test-driven-development:test-driven-development)`

Apply TDD to:

- Component logic (hooks, state management)
- Interaction handlers
- Data transformations
- Integration points (not visual rendering)

**Note:** Ladle stories serve as visual regression tests. TDD focuses on behavior.

## Design System Paths (Reference)

**Component Development:**

- Primitives: `packages/design-system/src/primitives/`
- Patterns: `packages/design-system/src/patterns/`
- Features: `packages/design-system/src/components/` (current)

**Stories:**

- Co-located: `ComponentName.stories.tsx` next to component

**Sandbox:**

- Command: `pnpm --filter @typenote/design-system sandbox`
- URL: http://localhost:61000

**Desktop Integration:**

- Import from: `@typenote/design-system`
- Wire data in: `apps/desktop/src/renderer/`

**Design Specs:**

- Quick reference: `docs/system/QUICK_REFERENCE.md`
- Full specs: `docs/system/`
- Philosophy: `.claude/skills/design-principles/`

## Execution Checklist

```
Phase 1: Brainstorming
□ Invoked Skill(superpowers:brainstorming)
□ UI components identified and categorized (primitives/patterns/features)
□ Design tokens identified (colors, spacing, typography)
□ User approved design at Checkpoint 1

Phase 2: Feature Development (DESIGN-SYSTEM-FIRST)
□ Loaded agent-docs/rules/design-system.md
□ Created components in packages/design-system/ (NOT desktop app)
□ Wrote Ladle stories for all variants
□ Verified components in Ladle sandbox (http://localhost:61000)
□ Design tokens used (no arbitrary values)
□ 4px spacing grid followed
□ Interactive states tested (hover, focus, active, disabled)
□ ONLY THEN imported in desktop app from @typenote/design-system
□ Wired up IPC/data/routing in apps/desktop/src/renderer/
□ Code reviewed
□ User approved at Checkpoint 2

Phase 3: TDD
□ Invoked Skill(test-driven-development:test-driven-development)
□ Component behavior tested
□ All tests passing
```

## Common Mistakes

| Mistake                                                     | Reality                                 | Fix                                     |
| ----------------------------------------------------------- | --------------------------------------- | --------------------------------------- |
| "I'll build in renderer first, move to design system later" | Later = never. Design debt accumulates. | Design system FIRST, always             |
| "This component is one-off, doesn't need design system"     | One-off today = pattern tomorrow        | Build in design system anyway           |
| "Ladle takes too long to set up"                            | 30 seconds vs hours debugging in app    | Start Ladle, use it                     |
| "I can skip stories for simple components"                  | Stories catch edge cases                | Write stories, every time               |
| "Design tokens don't have what I need"                      | Arbitrary values break consistency      | Use existing tokens or propose new ones |

## Red Flags - STOP and Use Design System

These thoughts mean you're bypassing the workflow:

- "Let me quickly add this to renderer..."
- "I'll prototype in the app first"
- "This is too simple for Ladle"
- "I'll add stories later"
- "Just need a custom color this once"
- "The design system is slowing me down"

**All of these mean: STOP. Build in design system first. No exceptions.**

## The Iron Law

```
NO UI IN DESKTOP APP WITHOUT DESIGN SYSTEM FIRST
NO DESIGN SYSTEM COMPONENTS WITHOUT LADLE STORIES
```

The workflow is:

1. `packages/design-system/` → Ladle stories → verify in browser
2. Import to `apps/desktop/` → wire up data/IPC
3. TDD for behavior

Reversing this order creates design debt, inconsistent UI, and wasted time.
