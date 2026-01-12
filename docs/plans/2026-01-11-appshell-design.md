# AppShell Design: Responsive Layout with Collapsible Sidebars

**Date:** 2026-01-11
**Status:** Approved

## Overview

Create a unified `AppShell` component that orchestrates a 3-column responsive layout with collapsible sidebars. This enables a cohesive experience combining the existing Sidebar, ContentArea, and RightSidebar components with edge-positioned collapse buttons.

## Design Decisions

| Decision          | Choice                | Rationale                                          |
| ----------------- | --------------------- | -------------------------------------------------- |
| Collapse UX       | Edge buttons          | Subtle but always accessible, like Linear/Notion   |
| Expand UX         | Collapsed rail (48px) | Persistent visual anchor with expand button        |
| Content resize    | Fluid expand          | Aligns with design system's fluid layout principle |
| Component API     | AppShell wrapper      | Single component manages layout orchestration      |
| State persistence | localStorage          | Consistent with CollapsibleSection pattern         |

## Architecture

### Component API

```tsx
<AppShell
  leftSidebar={<Sidebar>...</Sidebar>}
  rightSidebar={<RightSidebar>...</RightSidebar>}
  leftStorageKey="typenote-left-sidebar" // optional, enables persistence
  rightStorageKey="typenote-right-sidebar" // optional
>
  <ContentArea>
    <Editor />
  </ContentArea>
</AppShell>
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────┐ ┌──────────┐   │
│ │  Left    │ │                                │ │  Right   │   │
│ │ Sidebar  │▶│        Content Area            │◀│ Sidebar  │   │
│ │  240px   │ │         (fluid)                │ │  240px   │   │
│ │    or    │ │                                │ │    or    │   │
│ │  48px    │ │    Responsive padding:         │ │  48px    │   │
│ │(collapsed)│ │    24/48/80px by viewport     │ │(collapsed)│  │
│ └──────────┘ └────────────────────────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Collapse Button Design

### Visual Specification

- **Position:** Inner edge of sidebar, vertically centered
- **Size:** 24×24px touch target (icon 14px)
- **Icon:** Chevron pointing toward collapse direction
  - Left sidebar expanded: `ChevronLeft` (click to collapse)
  - Left sidebar collapsed: `ChevronRight` (click to expand)
  - Right sidebar: mirror pattern

### Styling

- **Default:** Subtle gray, blends with sidebar edge
- **Hover:** Slightly darker, cursor pointer
- **Active:** Brief press feedback
- **Animation:** Chevron rotates 180° on toggle (150ms ease-out)

### Collapsed Rail

- **Width:** 48px (12 × 4px grid)
- **Content:** Only expand button, centered
- **Style:** Clean, minimal

## State Management

### Internal State

```tsx
{
  leftCollapsed: boolean; // persisted to leftStorageKey
  rightCollapsed: boolean; // persisted to rightStorageKey
}
```

### Controlled Mode (Optional)

```tsx
<AppShell
  leftCollapsed={isLeftCollapsed}
  onLeftCollapse={setLeftCollapsed}
  // When controlled props provided, localStorage is ignored
>
```

### Animations

| Property         | Duration | Easing   | Description          |
| ---------------- | -------- | -------- | -------------------- |
| Sidebar width    | 200ms    | ease-out | Smooth 240px ↔ 48px  |
| Content area     | 200ms    | ease-out | Fluid reflow synced  |
| Chevron rotation | 150ms    | ease-out | Icon direction flip  |
| Content opacity  | 150ms    | ease-out | Fade during collapse |

## Component Inventory

### New Components

| Component               | Location                                        | Purpose                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------- |
| `AppShell`              | `components/AppShell/AppShell.tsx`              | Main layout orchestrator              |
| `ContentArea`           | `components/AppShell/ContentArea.tsx`           | Fluid content with responsive padding |
| `SidebarCollapseButton` | `components/AppShell/SidebarCollapseButton.tsx` | Edge toggle button                    |
| `useCollapsibleSidebar` | `components/AppShell/useCollapsibleSidebar.ts`  | State hook with localStorage          |

### Existing Components to Enhance

| Component      | Change                              |
| -------------- | ----------------------------------- |
| `Sidebar`      | Support collapse button positioning |
| `RightSidebar` | Support collapse button positioning |

### File Structure

```
packages/design-system/src/components/
├── AppShell/
│   ├── AppShell.tsx
│   ├── AppShell.stories.tsx
│   ├── ContentArea.tsx
│   ├── SidebarCollapseButton.tsx
│   ├── types.ts
│   ├── useCollapsibleSidebar.ts
│   └── index.ts
```

## Ladle Stories Required

1. Default 3-column layout
2. Left sidebar collapsed
3. Right sidebar collapsed
4. Both sidebars collapsed
5. Interactive toggle demo
6. Responsive behavior demo

## Design Principles Alignment

- **Focused calm:** Collapsed sidebars reduce chrome, amplify content
- **Fluid layout:** Content expands naturally when sidebars collapse
- **Responsive padding:** 24/48/80px maintains readable line lengths
- **4px grid:** All dimensions follow spacing system
