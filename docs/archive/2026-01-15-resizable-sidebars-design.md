# Resizable Sidebars Design

## Overview

Enable drag-to-resize for left and right sidebars in the AppShell, with localStorage persistence and snap-to-collapse behavior.

## Requirements

### Width Constraints

| Property       | Value | Notes                          |
| -------------- | ----- | ------------------------------ |
| Default width  | 240px | Current `w-60`                 |
| Minimum width  | 180px | Content remains readable       |
| Maximum width  | 400px | Preserves main content area    |
| Collapsed rail | 48px  | Unchanged from current         |
| Snap threshold | 120px | Below this, snaps to collapsed |

### Behavior

- **Independent widths**: Left and right sidebars resize independently
- **Persist to localStorage**: Each sidebar's width stored separately
- **Snap-to-collapse**: Dragging below 120px collapses to rail
- **Restore on expand**: Expanding from collapsed restores previous custom width

### Resize Handle UX

- **Hitbox**: 8px wide along inner edge of sidebar
- **Default**: Invisible (no visual element)
- **Hover**: 2px accent line appears (`bg-accent-500/50`)
- **Dragging**: 2px solid accent line (`bg-accent-500`)
- **Cursor**: `col-resize` on hover/drag

### Handle Position

- Left sidebar: Right edge (inner side toward content)
- Right sidebar: Left edge (inner side toward content)
- Full height of sidebar

## Technical Design

### New Hook: `useResizableSidebar`

```typescript
interface UseResizableSidebarOptions {
  defaultWidth?: number; // 240
  minWidth?: number; // 180
  maxWidth?: number; // 400
  snapThreshold?: number; // 120
  widthStorageKey?: string; // e.g., 'typenote.sidebar.left.width'
  collapsedStorageKey?: string; // e.g., 'typenote.sidebar.left.collapsed'
}

interface UseResizableSidebarReturn {
  width: number;
  collapsed: boolean;
  isResizing: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  handleResizeStart: (e: React.MouseEvent) => void;
}
```

**Responsibilities:**

- Manages width state with min/max clamping
- Handles snap-to-collapse when width < threshold
- Persists width to localStorage
- Provides `handleResizeStart` for resize handle
- Tracks `isResizing` for visual feedback

### New Component: `ResizeHandle`

```typescript
interface ResizeHandleProps {
  side: 'left' | 'right';
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent) => void;
}
```

**Implementation:**

- Renders invisible 8px hitbox
- Shows accent line on hover/drag
- Attaches mousedown handler
- Drag logic uses document mousemove/mouseup

### AppShell Changes

**Current (fixed width):**

```typescript
const EXPANDED_WIDTH = 'w-60'; // 240px

<div className={cn(
  leftState.collapsed ? RAIL_WIDTH : EXPANDED_WIDTH
)}>
```

**New (dynamic width):**

```typescript
<div
  style={{ width: leftState.collapsed ? 48 : leftWidth }}
  className="transition-[width] duration-200"
>
  {/* sidebar content */}
  <ResizeHandle
    side="left"
    isResizing={leftState.isResizing}
    onResizeStart={leftState.handleResizeStart}
  />
</div>
```

### File Changes

| File                     | Change                             |
| ------------------------ | ---------------------------------- |
| `useResizableSidebar.ts` | New hook                           |
| `ResizeHandle.tsx`       | New component                      |
| `AppShell.tsx`           | Integrate dynamic widths + handles |
| `AppShell.stories.tsx`   | Add resizable demo stories         |
| `index.ts`               | Export new hook                    |

### localStorage Keys

| Key                                | Value              |
| ---------------------------------- | ------------------ |
| `typenote.sidebar.left.width`      | number (pixels)    |
| `typenote.sidebar.left.collapsed`  | boolean (existing) |
| `typenote.sidebar.right.width`     | number (pixels)    |
| `typenote.sidebar.right.collapsed` | boolean (existing) |

## Edge Cases

### Snap-to-Collapse Flow

1. User drags sidebar width below 120px
2. Visual feedback shows "snap zone" (optional subtle color change)
3. User releases mouse
4. Sidebar collapses to 48px rail
5. Previous width (before snap) is preserved for next expand

### Expand from Collapsed

1. User clicks expand button (or drags rail outward)
2. Sidebar expands to stored width (or default 240px if none stored)
3. Width is clamped to min/max constraints

### Window Resize

- Sidebar widths are absolute pixels, not percentages
- Main content area (`flex-1 min-w-0`) absorbs window size changes
- No special handling needed

## Testing Strategy

### Unit Tests (useResizableSidebar)

- Width clamping (below min, above max)
- Snap-to-collapse threshold
- localStorage persistence (read/write)
- Expand restores previous width
- Toggle collapsed state

### Ladle Stories

- Default resizable sidebars
- Both collapsed initially
- One collapsed, one expanded
- Resize interaction demo

## Implementation Order

1. Create `useResizableSidebar` hook with tests
2. Create `ResizeHandle` component with tests
3. Integrate into AppShell
4. Add Ladle stories
5. Update desktop app to use new props (if needed)
