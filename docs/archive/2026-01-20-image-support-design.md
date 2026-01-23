# Image Support Design

**Status:** Active  
**Owner:** Design System  
**Created:** 2026-01-20

## Goal

Add image support to the TypeNote editor with display, upload, and simple resizing capabilities.

## Scope

- Display images from URLs or local file paths
- Upload images via drag-drop, paste, or `![alt](src)` syntax
- Store uploads in `./attachments/<objectId>/` folder (Obsidian-style)
- Simple resize via drag handles (width/height stored in attributes)
- Alt text editable via popover (no visible captions)

## Component Architecture

### Editor Layer (design-system)

1. **ImageNode extension** — Custom TipTap node extending `@tiptap/extension-image`
   - Attributes: `src`, `alt`, `width`, `height`, `title`
   - Renders via React NodeView for resize handles
   - Input rule: `![alt](src)` converts to image node

2. **ImageNodeView component** — React component for rendering
   - Displays `<img>` with max-width constraint
   - Resize handles on selection (drag to resize, store dimensions)
   - Alt text popover on double-click or context menu
   - Loading state while image fetches

3. **FileHandler extension** — Handles drag-drop and paste
   - On drop/paste: calls `onImageUpload` callback
   - Inserts image node with returned path
   - Shows upload progress indicator

### App Layer (desktop)

4. **AttachmentService** — Manages file storage
   - `uploadImage(objectId, file)` → saves to `./attachments/<objectId>/`
   - `getImagePath(objectId, filename)` → returns absolute path
   - Handles filename conflicts (append suffix)

### Editor Props

```typescript
onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>
```

## Data Flow

### Insertion Flows

1. **Markdown input (`![alt](url)`):**
   - TipTap input rule matches pattern
   - Creates image node with `{ src: url, alt: alt }`
   - No upload needed — URL is used directly

2. **Drag-drop / Paste:**
   - FileHandler intercepts file drop/paste event
   - Calls `onImageUpload(file)` → returns `{ src: '/attachments/obj123/image.png' }`
   - Inserts image node at cursor position
   - Shows loading placeholder while uploading

3. **URL paste (http image):**
   - Detect pasted URL pointing to image (`.png`, `.jpg`, etc.)
   - Insert as external URL (no download)
   - Future: Option to download and localize

### Storage Format

Image nodes serialize to TipTap JSON:

```json
{
  "type": "image",
  "attrs": {
    "src": "/attachments/obj123/screenshot.png",
    "alt": "Dashboard screenshot",
    "width": 400,
    "height": null
  }
}
```

For Markdown export:

```markdown
![Dashboard screenshot](/attachments/obj123/screenshot.png)
```

Width/height are visual-only and not exported to Markdown (consistent with standard Markdown).

## Implementation Phases

### Phase 1: Basic Image Display ✅ Complete

- Add `@tiptap/extension-image` to Editor
- Basic styling in `editor.css` (max-width, rounded corners)
- Ladle story with sample image content
- No upload, no resize — just display from URLs

### Phase 2: Resize Handles ✅ Complete

- `ImageNodeView` React component with resize handles
- `ResizableImage` extension using ReactNodeViewRenderer
- Resize handles on left/right edges when image selected
- Width stored in node attributes, aspect ratio maintained
- Minimum width: 100px, Maximum: container width

### Phase 3: Upload Support

- Add `onImageUpload` prop to Editor
- FileHandler extension for drag-drop/paste
- AttachmentService in desktop app
- Loading states during upload

### Phase 4: Alt Text Editing

- Popover on double-click
- Edit alt text inline
- Update node attributes

## Testing

- Ladle stories for each phase
- Unit tests for AttachmentService
- E2E test for drag-drop upload flow

## Open Questions

- Should we support GIF animation?
- Max file size limit for uploads?
- Image compression on upload?
