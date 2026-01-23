# Attachment Renderer Integration Design

**Date:** 2026-01-08
**Phase:** 8 of Attachments/Media System
**Status:** Ready for Implementation

## Scope

Images first. File attachments (PDFs, docs) deferred to future phase.

## User Interactions

| Action                 | Behavior                                     |
| ---------------------- | -------------------------------------------- |
| Drag image onto editor | Upload + insert attachment block             |
| Paste image (Cmd+V)    | Upload + insert attachment block             |
| Resize (drag corners)  | Update block dimensions, persist             |
| Delete block           | Remove from doc, attachment becomes orphaned |

## Component Architecture

```
src/renderer/
├── extensions/
│   └── AttachmentNode/
│       ├── AttachmentNode.tsx      # TipTap node extension
│       ├── AttachmentNode.test.tsx # Component tests
│       └── ResizeHandle.tsx        # Drag-to-resize UI
├── hooks/
│   └── useImageUpload.ts           # Drop/paste handling + IPC
└── lib/
    └── imageUtils.ts               # Base64 encoding, validation
```

## TipTap Node Schema

```typescript
{
  name: 'attachment',
  group: 'block',
  atom: true,
  draggable: true,
  attrs: {
    attachmentId: { default: null },
    width: { default: null },       // null = auto (max-width: 100%)
    height: { default: null },
    alt: { default: '' },
  }
}
```

## Data Flow

### Upload Flow

1. User drops/pastes image
2. `useImageUpload` hook validates (size ≤10MB, supported type)
3. On error → toast notification via sonner
4. On valid → encode base64 → call `uploadAttachment` IPC
5. On success → insert `AttachmentNode` with `attachmentId`
6. On IPC error → toast notification

### Display Flow

1. `AttachmentNode` renders with `attachmentId`
2. Fetch attachment metadata via IPC (for file path)
3. Render `<img src="file://{path}">` with optional width/height
4. Selected state shows resize handles

### Resize Flow

1. User drags corner/edge handle
2. Calculate new dimensions (corners maintain aspect ratio)
3. Call `updateAttributes({ width, height })`
4. Triggers `useAutoSave` → persists via block patch

## Error Handling

All errors shown as toast notifications (sonner):

- "Image exceeds 10MB limit"
- "Unsupported image type"
- IPC error messages from backend

## Block Content Schema

```typescript
AttachmentContent = {
  attachmentId: string,   // ULID reference
  width?: number,         // Pixels, null = auto
  height?: number,        // Pixels, null = auto
  alt?: string,           // Accessibility text
}
```

## Markdown Export (Future)

When exporting to markdown:

- **Pure markdown:** `![alt](attachments/hash.png)` — loses sizing
- **HTML-in-markdown:** `<img src="..." width="X" alt="...">` — preserves sizing

Export format is a user choice at export time.

## Testing Strategy

### Component Tests

- Renders image with correct src
- Shows resize handles when selected
- Updates dimensions on resize
- Displays alt text

### Hook Tests

- Uploads valid image and inserts node
- Shows toast for file > 10MB
- Shows toast for unsupported MIME type
- Shows loading placeholder during upload

## Out of Scope (YAGNI)

- File attachments (PDFs, docs)
- Caption editing UI
- Alt text editing UI
- Image toolbar (crop, rotate)
- Drag-to-reorder (TipTap handles)

## Dependencies

Already completed in Phase 6:

- `uploadAttachment` IPC handler
- `getAttachment` IPC handler
- `getBlockAttachments` IPC handler

Libraries available:

- `sonner` — toast notifications
- TipTap extensions pattern (see `RefNode`)
