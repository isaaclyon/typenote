# SlashCommand Design

## Summary

Add a slash command menu to the Editor for inserting block types. User types `/` at the start of a line to open a filterable dropdown menu.

## Trigger Behavior

- Trigger character: `/`
- Only triggers at start of line (empty paragraph or beginning of text)
- Typing after `/` filters the menu (e.g., `/head` shows headings)
- Arrow up/down to navigate, Enter to select, Escape to close

## Block Types (Minimal Set)

| Command       | Keywords              | Block Type       |
| ------------- | --------------------- | ---------------- |
| Paragraph     | `text`, `p`           | `paragraph`      |
| Heading 1     | `h1`, `heading1`      | `heading` L1     |
| Heading 2     | `h2`, `heading2`      | `heading` L2     |
| Heading 3     | `h3`, `heading3`      | `heading` L3     |
| Bullet List   | `bullet`, `ul`        | `bulletList`     |
| Numbered List | `numbered`, `ol`      | `orderedList`    |
| Quote         | `quote`, `blockquote` | `blockquote`     |
| Code Block    | `code`, `codeblock`   | `codeBlock`      |
| Divider       | `divider`, `hr`       | `horizontalRule` |

## Architecture

### New Files

```
packages/design-system/src/features/Editor/extensions/
  SlashCommand.ts          # TipTap extension with Suggestion plugin
  SlashCommandList.tsx     # Dropdown UI component
```

### Extension Structure

- Uses `@tiptap/suggestion` plugin (same as RefSuggestion)
- Unique `PluginKey('slashCommand')` to avoid conflicts
- `char: '/'` as trigger
- `startOfLine: true` to restrict to line start
- `command()` executes block transformation

### Data Structure

```typescript
interface SlashCommandItem {
  id: string;
  title: string;
  icon: PhosphorIcon;
  keywords: string[];
  command: (editor: Editor, range: Range) => void;
}
```

### Command Implementations

```typescript
// Paragraph
editor.chain().focus().deleteRange(range).setParagraph().run();

// Headings
editor.chain().focus().deleteRange(range).setHeading({ level }).run();

// Lists
editor.chain().focus().deleteRange(range).toggleBulletList().run();
editor.chain().focus().deleteRange(range).toggleOrderedList().run();

// Quote
editor.chain().focus().deleteRange(range).toggleBlockquote().run();

// Code Block
editor.chain().focus().deleteRange(range).toggleCodeBlock().run();

// Divider
editor.chain().focus().deleteRange(range).setHorizontalRule().run();
```

## UI Component (SlashCommandList)

### Visual Design

- Same popover styling as RefSuggestionList
- Min-width: 200px, max-width: 300px
- Each item: icon (16px) + title
- Hover: `bg-accent/50`, Selected: `bg-accent`

### Icons (Phosphor)

| Block         | Icon          |
| ------------- | ------------- |
| Paragraph     | `TextT`       |
| Heading 1     | `TextHOne`    |
| Heading 2     | `TextHTwo`    |
| Heading 3     | `TextHThree`  |
| Bullet List   | `ListBullets` |
| Numbered List | `ListNumbers` |
| Quote         | `Quotes`      |
| Code Block    | `Code`        |
| Divider       | `Minus`       |

## Editor Integration

- New prop: `enableSlashCommands?: boolean` (default: true)
- No external callbacks needed - all internal editor commands
- Follows same suggestion state pattern as RefSuggestion

## Files to Change

1. `SlashCommand.ts` - New extension file
2. `SlashCommandList.tsx` - New UI component
3. `extensions/index.ts` - Export new extension
4. `Editor.tsx` - Wire up slash command state and rendering
5. `types.ts` - Add `enableSlashCommands` prop
6. `Editor.stories.tsx` - Add stories for slash commands
