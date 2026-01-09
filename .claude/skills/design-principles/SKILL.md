---
name: design-principles
description: Enforce a precise, minimal design system inspired by Linear, Notion, and Stripe. Use this skill when building dashboards, admin interfaces, or any UI that needs Jony Ive-level precision - clean, modern, minimalist with taste. Every pixel matters.
---

# Design Principles

Precise, crafted design for enterprise software. Jony Ive-level precision with intentional personality — every interface polished, each designed for its specific context.

## Quick Reference

### The Quality Floor (Always Apply)

| Principle      | Rule                                                                 |
| -------------- | -------------------------------------------------------------------- |
| **Grid**       | 4px base: 4, 8, 12, 16, 24, 32px                                     |
| **Padding**    | Symmetrical (TLBR match)                                             |
| **Radius**     | Pick one system: sharp (4-8px), soft (8-12px), or minimal (2-6px)    |
| **Depth**      | ONE approach: borders-only, single shadow, layered, or surface color |
| **Typography** | Headlines: 600/-0.02em, Body: 400-500, Scale: 11-32px                |
| **Color**      | Gray builds structure. Color = meaning only (status, action, error)  |
| **Animation**  | 150ms micro, 200-250ms transitions. No spring/bounce.                |
| **Icons**      | Phosphor Icons. Clarify, don't decorate.                             |

### Design Personalities (Choose One)

| Direction                | Feel                          | Examples        |
| ------------------------ | ----------------------------- | --------------- |
| Precision & Density      | Tight, monochrome, power-user | Linear, Raycast |
| Warmth & Approachability | Generous, soft, human         | Notion, Coda    |
| Sophistication & Trust   | Cool, layered, financial      | Stripe, Mercury |
| Boldness & Clarity       | High contrast, decisive       | Vercel          |
| Utility & Function       | Muted, functional             | GitHub          |
| Data & Analysis          | Chart-optimized, technical    | Dashboards      |

### Anti-Pattern Checklist

- [ ] No dramatic shadows (0 25px 50px...)
- [ ] No large radius (16px+) on small elements
- [ ] No asymmetric padding without reason
- [ ] No pure white cards on colored backgrounds
- [ ] No thick decorative borders (2px+)
- [ ] No spring/bouncy animations
- [ ] No decorative gradients
- [ ] No multiple accent colors

## Detailed Reference

For comprehensive guidance, see:

- [Design Directions](design-directions.md) — Choosing personality, colors, layout, typography
- [Anti-Patterns & Standards](anti-patterns.md) — What to avoid, validation questions, dark mode

## TypeNote Design System

**This project has a committed design system.** Always use it:

- **[TypeNote Design Overview](typenote/README.md)** — Start here for the full spec

Detailed specs (load as needed):

- [Colors](typenote/colors.md) — Gray scale, accent, semantic colors
- [Typography](typenote/typography.md) — Fonts, scale, weights
- [Layout](typenote/layout.md) — Spacing grid, structure
- [Components](typenote/components.md) — Borders, depth, interactions
- [Daily Notes](typenote/daily-notes.md) — Special daily note treatment

### Quick Summary

| Aspect          | TypeNote Choice                           |
| --------------- | ----------------------------------------- |
| **Feeling**     | Focused calm — like a quiet library       |
| **Personality** | Linear precision + literary warmth        |
| **Background**  | Pure white (`#ffffff`) for content        |
| **Grays**       | Mostly neutral, barely perceptible warmth |
| **Accent**      | Cornflower Blue (`#6495ED`)               |
| **Typography**  | IBM Plex Sans/Mono, 15px base             |
| **Radius**      | Sharp (4px default)                       |
| **Depth**       | Borders primary, minimal shadows          |
| **Icons**       | Phosphor Regular                          |
| **Animation**   | 150-200ms, ease-out, no bounce            |
