# TypeNote Design System

The definitive design spec for TypeNote. These are **committed decisions**, not options.

## Identity

**Core Feeling:** Focused calm — like a quiet library. UI recedes; thoughts take center stage.

**Personality:** Linear's precision meets literary warmth. Sharp, intentional, keyboard-driven — with clean whites and cornflower blue.

### Principles

1. **Content-first** — UI chrome is minimal
2. **Precision without coldness** — Sharp corners, subtle borders, warm typography
3. **Keyboard-native** — Command palette (`⌘K`) is primary
4. **Balanced density** — Comfortable but efficient
5. **Calm feedback** — Soft-but-clear colors, no alarming states

### Inspirations

- **Linear** — Precision, keyboard-driven, monochrome
- **Capacities** — Type-based navigation, daily notes
- **iA Writer** — Balanced density, focused writing

### What TypeNote is NOT

- No spring/bouncy animations
- No heavy shadows or high drama
- No muddy/muted colors

## Quick Reference

| Aspect     | Choice                      |
| ---------- | --------------------------- |
| Background | Pure white `#ffffff`        |
| Grays      | Neutral with hint of warmth |
| Accent     | Cornflower Blue `#6495ED`   |
| Font       | IBM Plex Sans/Mono          |
| Base size  | 15px                        |
| Radius     | Sharp (4px)                 |
| Depth      | Borders primary             |
| Icons      | Phosphor Regular            |
| Animation  | 150-200ms, ease-out         |

## Detailed Specs

**Quick design decisions (load as needed):**

- [Colors](colors.md) — Gray scale, accent, semantic colors
- [Typography](typography.md) — Fonts, scale, weights, usage
- [Layout](layout.md) — Spacing grid, structure, responsive
- [Components](components.md) — Borders, depth, interactions, states
- [Daily Notes](daily-notes.md) — Special treatment for daily notes

**Complete implementation reference:**

For comprehensive specs, measurements, and copy-paste ready code:

- **[/docs/system/QUICK_REFERENCE.md](../../../../docs/system/QUICK_REFERENCE.md)** — Fast lookup (colors, spacing, typography)
- **[/docs/system/COMPONENTS_INVENTORY.md](../../../../docs/system/COMPONENTS_INVENTORY.md)** — Component catalog with full specs
- **[/docs/system/DESIGN_SYSTEM_BREAKDOWN.md](../../../../docs/system/DESIGN_SYSTEM_BREAKDOWN.md)** — Complete detailed reference (~790 lines)
- **[/docs/system/README.md](../../../../docs/system/README.md)** — System overview and FAQ
