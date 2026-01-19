# TagNode Extension Design

## Summary

Add a TagNode extension to the Editor for inline hashtag support. User types `#` to open a suggestion dropdown with existing tags, can select or create new tags.

## Trigger Behavior

- Trigger character: `#`
- Works anywhere in text (not restricted to start of line)
- Typing after `#` filters the suggestion list
- Arrow up/down to navigate, Enter to select, Escape to close
- Create option shown when query doesn't match existing tag

## Data Structures

### TagSuggestionItem

```typescript
interface TagSuggestionItem {
  tagId: string; // ULID
  name: string; // Display name (e.g., "important")
  color?: string; // Optional hex color for styling
}
```

### TagNodeAttributes

```typescript
interface TagNodeAttributes {
  tagId: string; // ULID
  displayName: string; // The tag name to display
  color?: string; // Optional hex color
}
```

## Architecture

### New Files

```
packages/design-system/src/features/Editor/extensions/
  TagNode.ts          # TipTap Node extension (inline, atom)
  TagNodeView.tsx     # React component for rendering tag pills
  TagSuggestionList.tsx # Dropdown UI component
```

### Extension Structure

- `TagNode` — TipTap Node with `group: 'inline'`, `atom: true`
- Uses `ReactNodeViewRenderer` for custom React rendering
- Suggestion handled via `@tiptap/suggestion` plugin (like RefSuggestion)
- Unique `PluginKey('tagSuggestion')` to avoid conflicts

### Command

```typescript
// Insert a tag node
editor
  .chain()
  .focus()
  .deleteRange(range)
  .insertContent([
    { type: 'tagNode', attrs: { tagId, displayName, color } },
    { type: 'text', text: ' ' },
  ])
  .run();
```

## UI Design

### TagNodeView (Inline Pill)

- Small inline pill/chip styling
- Background tinted with tag color (10% opacity) or neutral gray
- Text in tag color (full saturation) or neutral
- Rounded corners (full radius for pill effect)
- Cursor pointer, clickable for navigation
- No icon (minimal design)

```
[ #important ]  ← pill with subtle background
```

### Visual Specs

- Font size: inherit from surrounding text
- Padding: `0 6px`
- Border radius: `9999px` (full pill)
- Background: `tag color @ 10%` or `var(--accent)/10`
- Text: `tag color @ 100%` or `var(--foreground)`
- Hover: darken background slightly

### TagSuggestionList (Dropdown)

- Same styling as RefSuggestionList (consistency)
- Min-width: 180px, max-width: 240px
- Each item: `#name` with color indicator dot
- "Create #query" option at bottom when no exact match

## Editor Integration

### New Props (in types.ts)

```typescript
/** Enable tag suggestions via # trigger */
enableTags?: boolean;

/** Search function for tag suggestions */
onTagSearch?: (query: string) => TagSuggestionItem[] | Promise<TagSuggestionItem[]>;

/** Called when user wants to create a new tag */
onTagCreate?: (name: string) => TagSuggestionItem | Promise<TagSuggestionItem>;

/** Called when a tag node is clicked */
onTagClick?: (attrs: TagNodeAttributes) => void;
```

### Integration Pattern

Follow same pattern as RefNode:

1. Store callback refs to avoid extension re-creation
2. Manage suggestion state in Editor component
3. Render popup at cursor position
4. Handle keyboard navigation in render callbacks

## Files to Change

1. `TagNode.ts` — New TipTap Node extension
2. `TagNodeView.tsx` — New React component
3. `TagSuggestionList.tsx` — New dropdown UI
4. `extensions/index.ts` — Export new extension
5. `Editor.tsx` — Wire up tag suggestion state and rendering
6. `types.ts` — Add `enableTags`, `onTagSearch`, `onTagCreate`, `onTagClick` props
7. `Editor.stories.tsx` — Add stories for tag functionality

## Stories Required

1. `WithTags` — Basic tag functionality enabled
2. `WithExistingTags` — Document containing tag nodes
3. `TagColors` — Various tag colors displayed
4. `FullFeaturedEditor` — Update existing story to include tags
