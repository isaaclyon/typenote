# Interactive Editor Design for Ladle

**Date:** 2026-01-11
**Status:** Approved
**Goal:** Create a fully functional TipTap-based editor in the design system for design iteration, component documentation, and interaction testing in Ladle.

## Summary

Build an `InteractiveEditor` component in `packages/design-system/` that provides real TipTap editing capabilities with mocked data for wiki-links, tags, and slash commands. This enables isolated testing and documentation of all editor features without running the full Electron app.

## Key Decisions

| Decision           | Choice                    | Rationale                                                               |
| ------------------ | ------------------------- | ----------------------------------------------------------------------- |
| TipTap location    | Add to design-system      | Real editor behavior, not mocked UI                                     |
| Mock strategy      | Static mock data          | Simple, predictable for stories                                         |
| Architecture       | New InteractiveEditor     | Keep EditorPreview read-only                                            |
| Extensions         | Copy & adapt from desktop | Self-contained, can extract later if needed                             |
| Story organization | Feature-grouped           | Clear separation: BlockTypes, SlashCommand, WikiLinks, InlineFormatting |
| Keyboard hints     | Visual overlay in stories | Documents shortcuts, aids discoverability                               |
| Priority           | Core editing first        | Foundation before advanced features                                     |

## Component Structure

```
packages/design-system/src/components/InteractiveEditor/
├── InteractiveEditor.tsx        # Main editor component
├── InteractiveEditor.stories.tsx # Core stories
├── extensions/                   # TipTap extensions (adapted from desktop)
│   ├── RefNode/                  # Wiki-link [[ref]] with mock suggestions
│   ├── TagNode/                  # Hashtag #tag with mock suggestions
│   ├── CalloutNode/              # Info/warning/error/success callouts
│   ├── MathNode/                 # Inline and block LaTeX
│   ├── SlashCommand/             # Command menu with static commands
│   └── index.ts                  # Extension bundle export
├── mocks/                        # Static mock data
│   ├── mockNotes.ts              # Fake notes for [[ref]] autocomplete
│   ├── mockTags.ts               # Fake tags for # autocomplete
│   └── mockCommands.ts           # Slash command definitions
├── stories/                      # Feature-grouped stories
│   ├── BlockTypes.stories.tsx
│   ├── InlineFormatting.stories.tsx
│   ├── SlashCommand.stories.tsx
│   └── WikiLinks.stories.tsx
├── types.ts
└── index.ts
```

## Component API

```typescript
interface InteractiveEditorProps {
  // Content
  initialContent?: JSONContent;
  placeholder?: string;

  // Callbacks
  onChange?: (content: JSONContent) => void;
  onBlur?: () => void;
  onFocus?: () => void;

  // Configuration
  editable?: boolean;
  autofocus?: boolean;

  // Mock data overrides
  mockNotes?: MockNote[];
  mockTags?: MockTag[];
  mockCommands?: SlashCommand[];

  // Styling
  className?: string;
  minHeight?: string;
}

interface MockNote {
  id: string;
  title: string;
  type: 'note' | 'project' | 'task' | 'person' | 'resource';
}

interface MockTag {
  id: string;
  value: string;
  color?: string;
}
```

## Extensions Adaptation

| Extension            | Source                                   | Adaptation                     |
| -------------------- | ---------------------------------------- | ------------------------------ |
| RefNode              | `renderer/extensions/RefNode.tsx`        | Remove IPC, use mockNotes prop |
| RefSuggestion        | `renderer/extensions/RefSuggestion.tsx`  | Static mock lookup             |
| TagNode              | `renderer/extensions/TagNode.tsx`        | Minimal changes                |
| CalloutNode          | `renderer/extensions/CalloutNode.tsx`    | Direct copy                    |
| MathInline/MathBlock | `renderer/extensions/MathNode.tsx`       | Direct copy (uses KaTeX)       |
| SlashCommand         | `renderer/extensions/SlashCommand.tsx`   | Use mockCommands prop          |
| AttachmentNode       | `renderer/extensions/AttachmentNode.tsx` | Mock image URLs                |

**Adaptation pattern:**

```typescript
// Desktop (IPC)
const suggestions = await window.typenoteAPI.searchNotes(query);

// Design system (mock)
const suggestions = mockNotes.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));
```

## Story Coverage

### BlockTypes.stories.tsx

- Paragraph, Headings (H1-H3), BulletList, OrderedList, TaskList
- Blockquote, Callouts (all 4 kinds), CodeBlock, Table, MathBlock
- AllBlockTypes (combined showcase)

### InlineFormatting.stories.tsx

- Bold (⌘B), Italic (⌘I), Code, Strikethrough, Highlight, Links
- CombinedFormatting (nested)

### SlashCommand.stories.tsx

- BasicUsage (type "/")
- FilteredSearch (type "/head")
- KeyboardNavigation (arrows + Enter)

### WikiLinks.stories.tsx

- CreateLink (type "[[")
- SearchNotes (filter mock notes)
- CreateNewNote ("Create new" option)
- TagInsertion (type "#")

## Keyboard Shortcuts

| Keys               | Action                  |
| ------------------ | ----------------------- |
| ⌘/Ctrl + B         | Bold                    |
| ⌘/Ctrl + I         | Italic                  |
| ⌘/Ctrl + E         | Code                    |
| ⌘/Ctrl + Shift + S | Strikethrough           |
| ⌘/Ctrl + Shift + H | Highlight               |
| /                  | Open slash command menu |
| [[                 | Start wiki-link         |
| #                  | Start tag               |
| Enter              | New paragraph / confirm |
| Shift + Enter      | Line break within block |
| Tab                | Indent list item        |
| Shift + Tab        | Outdent list item       |

Stories will include a `ShortcutHints` component showing relevant shortcuts.

## Implementation Phases

### Phase 1: Foundation (Core Editing)

1. Install TipTap dependencies in design-system
2. Create InteractiveEditor with StarterKit
3. Basic stories: empty, with content, placeholder
4. BlockTypes.stories.tsx — paragraph, headings, lists, blockquote
5. InlineFormatting.stories.tsx — bold, italic, code, links

**Deliverable:** Functional editor with basic typing and formatting

### Phase 2: Rich Blocks

1. Copy & adapt CalloutNode extension
2. Copy & adapt MathNode (inline + block)
3. Add code block with language labels
4. Add table support
5. Expand BlockTypes.stories.tsx

**Deliverable:** All block types working

### Phase 3: Slash Commands

1. Copy & adapt SlashCommand extension with mock commands
2. Create mockCommands.ts
3. SlashCommand.stories.tsx
4. Add ShortcutHints component

**Deliverable:** Type "/" to insert any block type

### Phase 4: Wiki-Links & Tags

1. Copy & adapt RefNode and RefSuggestion with mock data
2. Copy & adapt TagNode
3. Create mockNotes.ts and mockTags.ts
4. WikiLinks.stories.tsx

**Deliverable:** Full editor feature parity with desktop (minus real data)

## Future Considerations

- If extension drift becomes painful (2-3 sync fixes), extract to `packages/editor`
- Desktop app could eventually import InteractiveEditor instead of maintaining separate implementation
- Consider adding visual regression tests for editor states
