# PRD: Design System Editor Integration

## Introduction

Replace TypeNote's current editor with the comprehensive Editor component from `@typenote/design-system`. The Editor is a block-based rich text editor built on TipTap/ProseMirror with full feature parity across all Ladle stories. This includes basic formatting, blocks (tasks, code, tables, callouts), references (@mentions, [[wiki-links]]), tags, embeds, math, media, footnotes, and slash commands.

This implementation requires:

1. Bidirectional format converters (NotateDoc ↔ TipTap JSONContent)
2. Backend IPC handlers for refs, tags, embeds, and image uploads
3. Integration into the document view at `/notes/:objectId`
4. Faithful 1:1 reproduction of all design system functionality and styling

## Goals

- Replace current editor with design system Editor in document view
- Implement all features shown in Ladle stories (10+ story files, 60+ variations)
- Support bidirectional conversion between NotateDoc and TipTap JSONContent
- Add backend IPC handlers for refs, tags, embeds, and image uploads
- Maintain visual and functional parity with design system across electron and web
- Ensure all keyboard shortcuts, markdown input rules, and interactions work identically
- Achieve 80%+ test coverage using TDD approach
- Enforce absolute alignment with design system tokens (no arbitrary values)

## Quality Gates

**Every user story with UI changes must pass ALL quality gates before marking as complete:**

### 1. Test-Driven Development (TDD)

- **Write tests FIRST** before implementation code
- Use `superpowers:test-driven-development` skill at story start
- Minimum 80% code coverage for new code
- All unit tests pass
- All integration tests pass

### 2. Visual Fidelity Gate

- **Screenshot comparison**: Side-by-side screenshot with corresponding Ladle story
  - Electron app screenshot vs Ladle screenshot
  - Web app screenshot vs Ladle screenshot
  - Both light and dark themes
- **Token alignment**: Chrome DevTools inspection shows:
  - All colors use design system tokens (e.g., `rgb(var(--color-accent-500))`)
  - All spacing uses 4px grid (e.g., `8px`, `12px`, `16px` - no `13px`)
  - All typography uses design system tokens (font-size, font-weight, line-height)
  - No arbitrary values (e.g., `#3b82f6` instead of token is FORBIDDEN)
- **Interactive states**: Verify hover, focus, active, disabled states match design system

### 3. Behavioral Gate (E2E Testing)

- **Playwright test**: Story-specific E2E test demonstrates feature works
- **Test coverage**: Happy path + edge cases + error states
- **Persistence test**: Save → reload → verify data persists correctly
- **Cross-platform**: Test passes in both Electron and web modes

### 4. Chrome DevTools Verification

- **Performance**: Input latency <50ms (measured in Performance panel)
- **No console errors**: Zero errors or warnings in Console
- **Accessibility**: No ARIA violations (Lighthouse audit)
- **Memory**: No memory leaks (Heap snapshot before/after)

### 5. Code Quality Gate

- **TypeScript strict**: No `any` types without justification
- **ESLint**: No disabled rules without explanation
- **Type coverage**: 100% of new code is typed
- **Typecheck passes**: `pnpm typecheck` succeeds

### 6. Design System Alignment Checklist

For every UI component, verify in Chrome DevTools:

```css
/* ✅ CORRECT - using design tokens */
color: rgb(var(--color-foreground));
background: rgb(var(--color-accent-500));
padding: 8px 12px; /* 4px grid */
font-size: 14px; /* from design system scale */

/* ❌ FORBIDDEN - arbitrary values */
color: #374151; /* use token instead */
padding: 13px 15px; /* breaks 4px grid */
font-size: 13.5px; /* not in design system scale */
```

## User Stories

### Phase 1: Foundation & Format Conversion

#### US-001: TipTap JSONContent to NotateDoc Converter

**Description:** As a developer, I need to convert TipTap's JSONContent to TypeNote's NotateDoc format so the Editor can save to the existing database schema.

**Acceptance Criteria:**

- [ ] Create `packages/core/src/converters/tiptapToNotateDoc.ts`
- [ ] Support all block types: paragraph, heading (1-6), task-list, code-block, table, callout
- [ ] Support all inline marks: bold, italic, code, strikethrough, highlight, link
- [ ] Support RefNode, TagNode, EmbedNode, BlockIdNode, FootnoteRef, FootnoteDef, InlineMath, MathBlock, ImageNode
- [ ] Handle nested structures (lists, table cells)
- [ ] Unit tests cover all node/mark types
- [ ] Typecheck passes

#### US-002: NotateDoc to TipTap JSONContent Converter

**Description:** As a developer, I need to convert NotateDoc to TipTap JSONContent so existing documents can be loaded into the Editor.

**Acceptance Criteria:**

- [ ] Create `packages/core/src/converters/notateDocToTiptap.ts`
- [ ] Support all NotateDoc block types and map to TipTap equivalents
- [ ] Support all NotateDoc inline nodes and marks
- [ ] Handle edge cases (empty blocks, missing properties)
- [ ] Unit tests cover round-trip conversion (NotateDoc → TipTap → NotateDoc === original)
- [ ] Typecheck passes

#### US-003: Converter Integration Tests

**Description:** As a developer, I need comprehensive tests to ensure converters preserve content fidelity.

**Acceptance Criteria:**

- [ ] Test fixtures for complex documents (nested lists, tables, all node types)
- [ ] Round-trip tests: NotateDoc → TipTap → NotateDoc (lossless)
- [ ] Round-trip tests: TipTap → NotateDoc → TipTap (lossless)
- [ ] Test error handling for malformed input
- [ ] All tests pass
- [ ] Typecheck passes

### Phase 2: Basic Editor Integration (Formatting & Blocks)

#### US-004: Import Editor Component into Desktop App

**Description:** As a developer, I need the design system Editor available in the desktop app so I can use it in the document view.

**Acceptance Criteria:**

- [ ] Editor exports correctly from `@typenote/design-system`
- [ ] Editor renders in document view at `/notes/:objectId`
- [ ] Editor CSS imports correctly (`editor.css`)
- [ ] No console errors on mount
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-005: Load Document Content into Editor

**Description:** As a user, I want to see my existing document content in the new Editor.

**Acceptance Criteria:**

- [ ] Fetch document via `window.typenoteAPI.getDocument(objectId)`
- [ ] Convert NotateDoc to TipTap JSONContent using converter
- [ ] Pass converted content to Editor `content` prop
- [ ] Document renders correctly (verify with complex test document)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-006: Save Editor Changes to Backend

**Description:** As a user, I want my edits to persist when I change content in the Editor.

**Acceptance Criteria:**

- [ ] Hook up Editor `onChange` callback
- [ ] Convert TipTap JSONContent to NotateDoc using converter
- [ ] Call `window.typenoteAPI.applyBlockPatch` with diff
- [ ] Implement debounced save (300ms)
- [ ] Show save indicator (saving/saved/error)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-007: Text Formatting (Bold, Italic, Code, Strikethrough)

**Description:** As a user, I want to format text with bold, italic, code, and strikethrough using keyboard shortcuts and markdown input rules.

**Acceptance Criteria:**

**TDD Gate:**

- [ ] Use `superpowers:test-driven-development` skill before implementation
- [ ] Write unit tests first: format conversion (TipTap ↔ NotateDoc)
- [ ] Write E2E tests first: keyboard shortcuts, markdown input rules
- [ ] 80%+ coverage for formatting code
- [ ] All tests pass

**Implementation:**

- [ ] Keyboard shortcuts work: Cmd+B (bold), Cmd+I (italic), Cmd+E (code), Cmd+Shift+X (strikethrough)
- [ ] Markdown input rules work: `**bold**`, `*italic*`, `` `code` ``, `~~strike~~`
- [ ] Formatted text saves and loads correctly

**Visual Fidelity Gate:**

- [ ] Screenshot comparison: App vs Ladle story `Editor.formatting.stories.tsx → AllMarks`
  - Electron (light theme) ✓
  - Electron (dark theme) ✓
  - Web (light theme) ✓
  - Web (dark theme) ✓
- [ ] Chrome DevTools inspection shows:
  - Bold: `font-weight: 600` (matches design system)
  - Italic: `font-style: italic`
  - Code: `background: rgb(var(--color-muted))`, `font-family: var(--font-mono)`
  - Strikethrough: `text-decoration: line-through`
  - No arbitrary color values (all use tokens)

**Behavioral Gate:**

- [ ] Playwright E2E test `editor-formatting.spec.ts` passes:
  - Type text → apply each format via keyboard → verify appearance
  - Type text with markdown syntax → verify auto-formatting
  - Save document → reload → verify formats persist
  - Works in both Electron and web modes

**Chrome DevTools Verification:**

- [ ] Performance: Typing latency <50ms (Performance panel)
- [ ] No console errors or warnings
- [ ] Lighthouse accessibility: No violations

**Code Quality:**

- [ ] Typecheck passes
- [ ] No `any` types
- [ ] ESLint passes
- [ ] Verify in browser using dev-browser skill

#### US-008: Headings (H1-H6)

**Description:** As a user, I want to create headings using slash commands and markdown input rules.

**Acceptance Criteria:**

- [ ] Markdown input rules: `# H1`, `## H2`, ..., `###### H6`
- [ ] Slash commands: `/heading1` through `/heading6`
- [ ] Keyboard shortcut: Cmd+Opt+1 through Cmd+Opt+6
- [ ] Headings render with correct styling (matches design system)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-009: Highlight Support

**Description:** As a user, I want to highlight text with different colors.

**Acceptance Criteria:**

- [ ] Keyboard shortcut: Cmd+Shift+H
- [ ] Color picker appears with design system colors
- [ ] Highlighted text renders correctly
- [ ] Highlight color saves and loads
- [ ] Matches design system exactly
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 3: Task Lists

#### US-010: Task List Block

**Description:** As a user, I want to create task lists with checkboxes.

**Acceptance Criteria:**

**TDD Gate:**

- [ ] Use `superpowers:test-driven-development` skill before implementation
- [ ] Write unit tests first: task list conversion, state toggling
- [ ] Write E2E tests first: slash command, checkbox interaction, persistence
- [ ] 80%+ coverage for task list code
- [ ] All tests pass

**Implementation:**

- [ ] Slash command: `/task` creates task list item
- [ ] Checkbox toggles on click
- [ ] Enter key creates new task item
- [ ] Backspace on empty task converts to paragraph
- [ ] Task state persists on save/load

**Visual Fidelity Gate:**

- [ ] Screenshot comparison: App vs Ladle story `Editor.blocks.stories.tsx → TaskList`
  - Electron (light/dark) ✓
  - Web (light/dark) ✓
- [ ] Chrome DevTools inspection shows:
  - Checkbox size: `16px` (4px grid)
  - Checkbox spacing: `8px` margin-right (4px grid)
  - Checkbox border: `1px solid rgb(var(--color-border))`
  - Checked state: `background: rgb(var(--color-accent-500))`
  - Hover state: `border-color: rgb(var(--color-accent-600))`
  - Focus ring: `outline: 2px solid rgb(var(--color-ring))`
  - No arbitrary values

**Behavioral Gate:**

- [ ] Playwright E2E test `editor-tasks.spec.ts` passes:
  - Type `/task` → verify task item created
  - Click checkbox → verify checked state
  - Click again → verify unchecked
  - Press Enter → verify new task created
  - Backspace on empty task → verify converts to paragraph
  - Save → reload → verify states persist
  - Works in Electron and web

**Chrome DevTools Verification:**

- [ ] Performance: Checkbox click response <16ms
- [ ] Interactive states: Hover, focus, active, disabled render correctly
- [ ] No console errors
- [ ] Accessibility: Checkbox has proper ARIA labels

**Code Quality:**

- [ ] Typecheck passes
- [ ] No `any` types
- [ ] ESLint passes
- [ ] Verify in browser using dev-browser skill

#### US-011: Nested Task Lists

**Description:** As a user, I want to indent task items to create hierarchies.

**Acceptance Criteria:**

- [ ] Tab key indents task (increases nesting)
- [ ] Shift+Tab unindents task (decreases nesting)
- [ ] Nested tasks render with correct indentation
- [ ] Checkbox interactions work at all nesting levels
- [ ] Structure persists on save/load
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 4: Code Blocks

#### US-012: Code Block Support

**Description:** As a user, I want to insert code blocks with syntax highlighting.

**Acceptance Criteria:**

- [ ] Markdown input rule: ` ``` ` creates code block
- [ ] Slash command: `/code` creates code block
- [ ] Language dropdown shows common languages (matches design system list)
- [ ] Syntax highlighting works for selected language
- [ ] Long lines scroll horizontally (no wrapping)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 5: Callouts

#### US-013: Callout Blocks

**Description:** As a user, I want to create styled callout boxes for info/warning/success/error messages.

**Acceptance Criteria:**

- [ ] Slash command: `/callout` creates callout
- [ ] Type selector: info (default), warning, success, error
- [ ] Each type renders with correct icon and color (matches design system)
- [ ] Callouts can contain nested content (paragraphs, lists, etc.)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 6: Tables

#### US-014: Table Block

**Description:** As a user, I want to insert and edit tables with rows and columns.

**Acceptance Criteria:**

- [ ] Slash command: `/table` creates default 3x3 table
- [ ] Tab key moves to next cell, Shift+Tab moves to previous
- [ ] Table toolbar appears on selection (matches design system)
- [ ] Toolbar actions: add row/column, delete row/column, merge cells
- [ ] Tables render correctly with borders and spacing
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 7: Slash Commands

#### US-015: Slash Command Menu

**Description:** As a user, I want to trigger a command menu with `/` to quickly insert blocks.

**Acceptance Criteria:**

- [ ] Typing `/` shows command menu
- [ ] Menu shows all available commands with icons (matches design system icons)
- [ ] Arrow keys navigate menu, Enter selects
- [ ] Typing filters commands (e.g., `/ta` shows task, table)
- [ ] Esc closes menu
- [ ] Menu styling matches design system exactly
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 8: Links & Media

#### US-016: Link Support

**Description:** As a user, I want to create hyperlinks.

**Acceptance Criteria:**

- [ ] Keyboard shortcut: Cmd+K opens link input
- [ ] Paste URL auto-creates link
- [ ] Markdown input rule: `[text](url)` creates link
- [ ] Click link opens URL in external browser
- [ ] Links render with correct styling
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-017: Image Node

**Description:** As a user, I want to insert images into documents.

**Acceptance Criteria:**

- [ ] Slash command: `/image` shows image insert popover
- [ ] Popover has URL input and Upload button (matches design system)
- [ ] Image renders with correct styling
- [ ] Images can be resized by dragging corner handles
- [ ] Image size persists on save/load
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-018: Image Upload IPC Handler

**Description:** As a developer, I need a backend IPC handler to upload and store images.

**Acceptance Criteria:**

- [ ] Create `typenote:uploadImage` IPC handler in main process
- [ ] Accept image file data (base64 or buffer)
- [ ] Store image in attachments directory
- [ ] Return attachment ID and URL
- [ ] Handle upload errors gracefully
- [ ] Typecheck passes

#### US-019: Image Upload Integration

**Description:** As a user, I want to upload images from my computer.

**Acceptance Criteria:**

- [ ] Click "Upload" button opens file picker
- [ ] Selected image uploads via `window.typenoteAPI.uploadImage`
- [ ] Uploaded image inserts into document with attachment URL
- [ ] Drag-and-drop image file uploads and inserts
- [ ] Show upload progress/spinner during upload
- [ ] Show error message on upload failure
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 9: References (@mentions & [[wiki-links]])

#### US-020: Ref Suggestion List IPC Handler

**Description:** As a developer, I need a backend IPC handler to search for reference targets.

**Acceptance Criteria:**

- [ ] Create `typenote:searchObjects` IPC handler in main process
- [ ] Accept search query string
- [ ] Return matching objects with id, title, typeKey, typeColor
- [ ] Limit results to 10 items
- [ ] Sort by relevance (title match, then recent)
- [ ] Typecheck passes

#### US-021: Basic @mention References

**Description:** As a user, I want to reference other objects using @mention syntax.

**Acceptance Criteria:**

- [ ] Typing `@` triggers ref suggestion menu
- [ ] Menu shows search results from `window.typenoteAPI.searchObjects`
- [ ] Typing filters results (e.g., `@daily` shows DailyNote objects)
- [ ] Arrow keys navigate, Enter selects
- [ ] Selected ref inserts as RefNode with object ID
- [ ] Refs render with correct styling and type color
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-022: [[Wiki-link]] Reference Syntax

**Description:** As a user, I want to reference objects using [[wiki-link]] syntax.

**Acceptance Criteria:**

- [ ] Typing `[[` triggers ref suggestion menu
- [ ] Closing `]]` completes the ref
- [ ] Suggestion menu behavior same as @mention
- [ ] Wiki-link refs render identically to @mentions
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-023: Aliased References

**Description:** As a user, I want to create references with custom display text.

**Acceptance Criteria:**

- [ ] Syntax: `@ObjectTitle|alias text` or `[[ObjectTitle|alias text]]`
- [ ] Alias text displays instead of object title
- [ ] Clicking aliased ref still opens target object
- [ ] Editing alias in suggestion menu works (matches design system)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-024: Create New Object from Ref

**Description:** As a user, I want to create a new object when referencing a non-existent title.

**Acceptance Criteria:**

- [ ] Ref suggestion menu shows "Create new" option at bottom
- [ ] Selecting "Create new" calls `window.typenoteAPI.createObject`
- [ ] New object created with typed title as name
- [ ] Ref inserts with new object ID
- [ ] Clicking ref opens newly created object
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-025: Ref Type Colors

**Description:** As a user, I want refs to show their object type color.

**Acceptance Criteria:**

- [ ] Fetch object type metadata for each ref
- [ ] Ref renders with left border in type color
- [ ] Type colors match design system palette
- [ ] Colors persist across themes (light/dark)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-026: Ref Click Handling

**Description:** As a user, I want to click a reference to navigate to that object.

**Acceptance Criteria:**

- [ ] Click ref calls `onRefClick` callback with object ID
- [ ] Navigate to `/notes/:objectId` route
- [ ] Cmd+Click opens in new tab (if supported)
- [ ] Hover shows tooltip with object title
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 10: Tags

#### US-027: Tag Suggestion IPC Handler

**Description:** As a developer, I need a backend IPC handler to search and create tags.

**Acceptance Criteria:**

- [ ] Create `typenote:searchTags` IPC handler in main process
- [ ] Accept search query string
- [ ] Return matching tags with id, name, color
- [ ] Create `typenote:createTag` IPC handler
- [ ] Create new tag with generated color
- [ ] Typecheck passes

#### US-028: Tag Support with # Trigger

**Description:** As a user, I want to tag objects using #hashtag syntax.

**Acceptance Criteria:**

- [ ] Typing `#` triggers tag suggestion menu
- [ ] Menu shows search results from `window.typenoteAPI.searchTags`
- [ ] Typing filters tags (e.g., `#proj` shows "project" tags)
- [ ] Arrow keys navigate, Enter selects
- [ ] Selected tag inserts as TagNode
- [ ] Tags render with colored pill styling
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-029: Create New Tag

**Description:** As a user, I want to create new tags inline while editing.

**Acceptance Criteria:**

- [ ] Tag suggestion menu shows "Create new" option
- [ ] Selecting "Create new" calls `window.typenoteAPI.createTag`
- [ ] New tag created with typed name
- [ ] Tag inserts into document
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-030: Tag Click Handling

**Description:** As a user, I want to click a tag to see all objects with that tag.

**Acceptance Criteria:**

- [ ] Click tag calls `onTagClick` callback with tag ID
- [ ] Navigate to tag view (or show tag modal)
- [ ] Hover shows tooltip with tag name
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 11: Heading & Block References

#### US-031: Heading Reference Search IPC Handler

**Description:** As a developer, I need a backend IPC handler to search heading blocks within objects.

**Acceptance Criteria:**

- [ ] Create `typenote:searchHeadings` IPC handler
- [ ] Accept search query and object ID (optional)
- [ ] Return headings with object title, heading text, block ID
- [ ] Typecheck passes

#### US-032: Heading References

**Description:** As a user, I want to reference specific headings within documents.

**Acceptance Criteria:**

- [ ] Typing `@` then selecting object shows heading submenu
- [ ] Typing `@ObjectTitle#` shows heading suggestions
- [ ] Select heading inserts ref with fragment (e.g., `@Obj#Heading`)
- [ ] Clicking heading ref scrolls to that heading
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-033: Block References

**Description:** As a user, I want to reference specific blocks using block IDs.

**Acceptance Criteria:**

- [ ] Typing `@` then selecting object shows block submenu (if blocks have IDs)
- [ ] Typing `@ObjectTitle^` shows block suggestions
- [ ] Select block inserts ref with block ID
- [ ] Clicking block ref scrolls to that block
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 12: Block IDs

#### US-034: Block ID Support

**Description:** As a user, I want to assign IDs to blocks for referencing and linking.

**Acceptance Criteria:**

- [ ] Slash command: `/block-id` assigns unique ID to current block
- [ ] Keyboard shortcut: Cmd+Shift+I assigns block ID
- [ ] Block ID renders as subtle inline indicator (matches design system)
- [ ] Copy block ID to clipboard button (matches design system)
- [ ] Block IDs persist on save/load
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 13: Embeds

#### US-035: Embed Resolve IPC Handler

**Description:** As a developer, I need a backend IPC handler to fetch embed content.

**Acceptance Criteria:**

- [ ] Create `typenote:resolveEmbed` IPC handler
- [ ] Accept embed target (object ID or URL)
- [ ] Return embed metadata (title, excerpt, object type, URL, etc.)
- [ ] Handle missing/deleted objects gracefully
- [ ] Typecheck passes

#### US-036: Object Embeds with ![[...]]

**Description:** As a user, I want to embed other objects inline using ![[wiki-link]] syntax.

**Acceptance Criteria:**

- [ ] Typing `![[` triggers embed suggestion menu
- [ ] Select object inserts embed block
- [ ] Embed fetches content via `window.typenoteAPI.resolveEmbed`
- [ ] Embed renders with title, excerpt, and type indicator
- [ ] Click embed opens target object
- [ ] Matches design system embed styling
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-037: Targeted Embeds (Heading/Block)

**Description:** As a user, I want to embed specific headings or blocks.

**Acceptance Criteria:**

- [ ] Syntax: `![[ObjectTitle#Heading]]` embeds heading section
- [ ] Syntax: `![[ObjectTitle^blockId]]` embeds specific block
- [ ] Targeted embeds show only relevant content
- [ ] Click navigates to specific heading/block
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-038: Embed Live Updates

**Description:** As a user, I want embedded content to update when the source changes.

**Acceptance Criteria:**

- [ ] Create `typenote:subscribeEmbed` IPC handler with event emitter
- [ ] Subscribe to embed target on mount
- [ ] Update embed content when source object changes
- [ ] Unsubscribe on unmount
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-039: Missing Embed Handling

**Description:** As a user, I want clear feedback when an embed target doesn't exist.

**Acceptance Criteria:**

- [ ] Missing embed shows error state (matches design system)
- [ ] Error message: "Object not found: [title]"
- [ ] Option to remove broken embed
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 14: Math Support

#### US-040: Inline Math

**Description:** As a user, I want to write inline math expressions using LaTeX syntax.

**Acceptance Criteria:**

- [ ] Markdown input rule: `$...$` creates inline math
- [ ] Math renders using KaTeX (matches design system)
- [ ] Edit math by clicking (opens input)
- [ ] Invalid syntax shows error indicator
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-041: Math Blocks

**Description:** As a user, I want to write display math blocks.

**Acceptance Criteria:**

- [ ] Markdown input rule: `$$` creates math block
- [ ] Slash command: `/math` creates math block
- [ ] Math block renders centered with KaTeX
- [ ] Edit by clicking math block
- [ ] Invalid syntax shows error message
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 15: Footnotes

#### US-042: Footnote Support

**Description:** As a user, I want to add footnotes to documents.

**Acceptance Criteria:**

- [ ] Slash command: `/footnote` inserts footnote reference
- [ ] Input rule: `[^id]` creates footnote ref
- [ ] Footnote definition: `[^id]: content` creates definition block
- [ ] Clicking ref scrolls to definition
- [ ] Clicking definition scrolls back to ref
- [ ] Footnotes render at document end (matches design system)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-043: Footnote Warnings

**Description:** As a user, I want warnings when footnote references/definitions are missing.

**Acceptance Criteria:**

- [ ] Warn if footnote ref has no definition
- [ ] Warn if footnote definition has no reference
- [ ] Warning styling matches design system
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 16: Read-Only Mode & Accessibility

#### US-044: Read-Only Editor Mode

**Description:** As a user, I want to view documents without accidentally editing them.

**Acceptance Criteria:**

- [ ] Pass `readOnly={true}` to Editor
- [ ] Editor disables editing (no cursor, no typing)
- [ ] Content renders identically to editable mode
- [ ] Refs, tags, links still clickable
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-045: Editor Focus Management

**Description:** As a user, I want the editor to focus automatically when opening a document.

**Acceptance Criteria:**

- [ ] Pass `autoFocus={true}` to Editor when opening document
- [ ] Cursor appears at start of document
- [ ] Focus works on new documents (empty content)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 17: Multi-Editor Support & Long Documents

#### US-046: Multiple Editor Instances

**Description:** As a developer, I want to support multiple Editor instances on the same page (e.g., split view).

**Acceptance Criteria:**

- [ ] Create two Editor instances in test page
- [ ] Each editor maintains independent state
- [ ] Copy/paste between editors works
- [ ] No state leakage or conflicts
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-047: Long Document Performance

**Description:** As a user, I want smooth editing performance even with large documents (1000+ blocks).

**Acceptance Criteria:**

- [ ] Create test document with 1000+ paragraphs
- [ ] Scrolling feels smooth (no jank)
- [ ] Typing has no lag
- [ ] Search/replace works on large documents
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### Phase 18: Testing & Polish

#### US-048: Integration Tests for All Editor Features

**Description:** As a developer, I need comprehensive tests to prevent regressions.

**Acceptance Criteria:**

- [ ] Vitest tests for format converters (NotateDoc ↔ TipTap)
- [ ] Playwright E2E tests for key workflows (create document, edit, save, load)
- [ ] Test all slash commands in E2E
- [ ] Test all markdown input rules in E2E
- [ ] Test refs, tags, embeds in E2E
- [ ] All tests pass
- [ ] Typecheck passes

#### US-049: Keyboard Shortcuts Documentation

**Description:** As a user, I want to know all available keyboard shortcuts.

**Acceptance Criteria:**

- [ ] Document all shortcuts in `docs/features/editor-shortcuts.md`
- [ ] Include: formatting, blocks, navigation, search
- [ ] Add shortcuts help modal in app (Cmd+/)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

#### US-050: Editor Styling Verification

**Description:** As a developer, I want to ensure Editor styling matches design system exactly across all features.

**Acceptance Criteria:**

- [ ] Side-by-side comparison with Ladle stories
- [ ] Verify typography (font sizes, weights, line heights)
- [ ] Verify spacing (margins, padding)
- [ ] Verify colors (text, backgrounds, borders)
- [ ] Verify all interactive states (hover, focus, active)
- [ ] Document any intentional deviations
- [ ] Verify in browser using dev-browser skill

---

**Note on Acceptance Criteria:**

Stories US-007 and US-010 show the **full expanded acceptance criteria template** with all quality gates. For brevity, other stories in this PRD use condensed criteria, but **ALL UI stories must meet the same gates**:

1. **TDD Gate**: Use TDD skill, write tests first, 80%+ coverage
2. **Visual Fidelity Gate**: Screenshot comparison + Chrome DevTools token inspection
3. **Behavioral Gate**: Playwright E2E tests for happy path + edge cases
4. **Chrome DevTools Verification**: Performance, no errors, accessibility
5. **Code Quality**: Typecheck, no `any`, ESLint passes

When implementing any story with UI changes, expand the criteria using US-007/US-010 as the template.

---

## Functional Requirements

### Core Editor

- FR-1: Editor must support TipTap JSONContent as input/output format
- FR-2: Editor must convert NotateDoc to/from TipTap JSONContent bidirectionally
- FR-3: Editor must debounce saves (300ms) to avoid excessive IPC calls
- FR-4: Editor must show save status indicator (saving/saved/error)

### Text Formatting

- FR-5: Support bold (Cmd+B, `**text**`)
- FR-6: Support italic (Cmd+I, `*text*`)
- FR-7: Support code (Cmd+E, `` `text` ``)
- FR-8: Support strikethrough (Cmd+Shift+X, `~~text~~`)
- FR-9: Support highlight with color picker (Cmd+Shift+H)

### Blocks

- FR-10: Support headings H1-H6 with markdown (`#`), slash commands, and keyboard shortcuts (Cmd+Opt+1-6)
- FR-11: Support task lists with checkboxes, nesting (Tab/Shift+Tab), and state persistence
- FR-12: Support code blocks with syntax highlighting and language selection
- FR-13: Support callouts with 4 types (info, warning, success, error) and nested content
- FR-14: Support tables with toolbar (add/delete rows/columns, merge cells)

### Links & Media

- FR-15: Support hyperlinks (Cmd+K, paste URL, `[text](url)`)
- FR-16: Support images with URL input, upload, resize, and drag-and-drop

### References

- FR-17: Support @mention refs with search (IPC: `typenote:searchObjects`)
- FR-18: Support [[wiki-link]] refs with identical behavior
- FR-19: Support aliased refs (`@Title|alias` or `[[Title|alias]]`)
- FR-20: Support creating new objects from refs (IPC: `typenote:createObject`)
- FR-21: Support heading refs (`@Title#Heading`)
- FR-22: Support block refs (`@Title^blockId`)
- FR-23: Refs must render with object type colors

### Tags

- FR-24: Support tags with # trigger (IPC: `typenote:searchTags`)
- FR-25: Support creating new tags (IPC: `typenote:createTag`)
- FR-26: Tags must render as colored pills

### Embeds

- FR-27: Support object embeds with `![[Title]]` syntax
- FR-28: Support targeted embeds (`![[Title#Heading]]`, `![[Title^blockId]]`)
- FR-29: Embeds must resolve via IPC (`typenote:resolveEmbed`)
- FR-30: Embeds must update live via IPC subscription (`typenote:subscribeEmbed`)
- FR-31: Embeds must handle missing objects gracefully

### Math & Footnotes

- FR-32: Support inline math with `$...$` syntax (KaTeX rendering)
- FR-33: Support math blocks with `$$` syntax or `/math` command
- FR-34: Support footnotes with `[^id]` refs and `[^id]: content` definitions
- FR-35: Show warnings for unmatched footnote refs/definitions

### Block IDs

- FR-36: Support block ID assignment via `/block-id` command or Cmd+Shift+I
- FR-37: Support copying block ID to clipboard

### Slash Commands

- FR-38: Typing `/` must show command menu with all available commands
- FR-39: Command menu must filter by typing (e.g., `/ta` filters to task, table)
- FR-40: Command menu must show icons for each command (use design system icon set)
- FR-41: Arrow keys navigate menu, Enter selects, Esc closes

### Modes & States

- FR-42: Support read-only mode (disables editing, keeps refs/links clickable)
- FR-43: Support auto-focus on document open
- FR-44: Support multiple independent Editor instances on same page

### Performance

- FR-45: Editing must remain smooth with documents up to 1000+ blocks
- FR-46: Scrolling must feel responsive with no jank

## Non-Goals (Out of Scope)

- **Collaborative editing**: Real-time multi-user editing is future work
- **Version history UI**: Undo/redo works, but version history viewer is separate
- **Custom themes**: Editor uses design system tokens, custom themes are future work
- **Mobile touch support**: Desktop-focused, mobile is future work
- **AI writing assistant**: Copilot features are future work
- **Export formats**: PDF/Markdown export is separate feature
- **Spell check**: Rely on browser native spell check
- **Grammar checking**: Out of scope

## Design Considerations

### Visual Fidelity

- **Exact match**: All styling (typography, spacing, colors, interactive states) must match Ladle stories pixel-perfect
- **Dark mode**: Ensure all features work correctly in dark mode
- **Icons**: Use design system icon set for slash commands, embeds, callouts, etc.

### Component Reuse

- Reuse existing design system primitives where possible:
  - Button, Input, Select, Popover, Tooltip
  - ScrollArea for long documents
  - Badge for tags and type indicators

### Layout Integration

- Editor must fit within existing document view layout
- Preserve sidebar, header, and footer during integration
- Respect responsive breakpoints

## Technical Considerations

### Format Conversion

- **Lossless conversion**: Round-trip conversion (NotateDoc ↔ TipTap ↔ NotateDoc) must preserve all data
- **Error handling**: Malformed content must not crash editor (show error state)
- **Performance**: Conversion must be fast (<50ms for typical documents)

### IPC Handlers

All IPC handlers must follow existing patterns:

- Return `{ success: true, result: T }` or `{ success: false, error: ApiError }`
- Use Zod schemas for request validation
- Handle database errors gracefully

### State Management

- Use TanStack Query for all IPC data fetching (refs, tags, embeds)
- Cache search results to reduce IPC calls
- Invalidate caches on mutations (create object, create tag, etc.)

### Dependencies

- **TipTap**: Already included in design system
- **KaTeX**: Already included in design system for math rendering
- **ProseMirror**: Peer dependency of TipTap
- **Lucide React**: For icons (already in design system)

### Testing Strategy

**Test-Driven Development (TDD):**

- Use `superpowers:test-driven-development` skill at start of every story
- Write failing tests BEFORE implementation code
- Red → Green → Refactor cycle
- Minimum 80% coverage for all new code

**Unit Tests (Vitest):**

- Converter functions: NotateDoc ↔ TipTap (bidirectional round-trip)
- All node/mark types and edge cases
- Error handling for malformed input
- Run in CI on every commit

**Integration Tests (Vitest):**

- IPC handlers with in-memory database
- Test success and error paths
- Validate request/response schemas
- Mock IPC layer for renderer tests

**E2E Tests (Playwright):**

- One E2E test per user story with UI
- Test happy path, edge cases, error states
- Test persistence (save → reload → verify)
- Run against both Electron and web builds
- Organize by feature: `editor-formatting.spec.ts`, `editor-tasks.spec.ts`, etc.

**Visual Regression Testing:**

- Screenshot comparison tool: Playwright screenshots vs Ladle screenshots
- Capture all interactive states: default, hover, focus, active, disabled
- Test both light and dark themes
- Store baseline screenshots in `tests/visual-baselines/`
- Fail build if visual diff exceeds threshold

**Chrome DevTools Verification:**

- **Performance panel**: Measure input latency, must be <50ms
- **Console**: Zero errors or warnings (strict enforcement)
- **Elements panel**: Inspect computed styles, verify design tokens
- **Lighthouse**: Accessibility score must be 95+ (no ARIA violations)
- **Memory profiler**: Heap snapshots before/after to detect leaks

**Screenshot Tooling:**

```bash
# Capture Ladle baseline (one-time setup)
pnpm --filter @typenote/design-system sandbox
# Navigate to story, capture screenshot

# Capture app screenshot (during testing)
pnpm dev:quick  # or pnpm dev for full build
# Navigate to feature, capture screenshot

# Compare side-by-side
# Manual review: Place screenshots side-by-side, verify pixel-perfect match
```

## Success Metrics

### Completion Criteria

- **Feature completeness**: 100% of Ladle story features implemented and working
- **Story completion**: All 50 user stories marked complete (all acceptance criteria ✓)
- **Quality gates**: Every UI story passes all 6 quality gates (TDD, Visual, Behavioral, DevTools, Code Quality, Design Alignment)

### Visual & Design

- **Pixel-perfect fidelity**: Side-by-side screenshot comparison shows no visual differences
- **Token compliance**: Chrome DevTools inspection shows 0 arbitrary values (100% design tokens)
- **Theme support**: All features work identically in light and dark themes
- **Responsive**: Editor works at all supported screen sizes

### Performance

- **Input latency**: <50ms measured in Chrome DevTools Performance panel
- **Large documents**: 1000-block document scrolls/edits smoothly (<16ms frame time)
- **Memory**: No memory leaks (heap size stable over 5-minute editing session)
- **Bundle size**: Editor adds <100KB to production bundle (gzipped)

### Quality & Stability

- **Test coverage**: 80%+ coverage for all new code (enforced by TDD)
- **E2E coverage**: Every user story with UI has passing Playwright test
- **Zero console errors**: No errors or warnings in Chrome Console during normal use
- **Accessibility**: Lighthouse score 95+ (no ARIA violations)
- **Stability**: Zero crashes or data loss during 100+ manual test sessions
- **CI**: All tests pass on every commit (typecheck, lint, unit, integration, E2E)

### Cross-Platform

- **Electron parity**: All features work identically in Electron app
- **Web parity**: All features work identically in web app (localhost:5173)
- **No regressions**: Existing features continue to work after integration

## Open Questions

1. **Autosave conflicts**: How should we handle conflicting edits if user opens same document in two windows?
   - **Proposed**: Show warning, offer reload or keep editing (similar to VS Code)

2. **Image storage**: Should we store images in filesystem or database?
   - **Proposed**: Filesystem (attachments directory), database stores metadata + path

3. **Ref type colors**: Should we fetch type metadata for every ref on render, or cache it?
   - **Proposed**: Cache type metadata globally (TanStack Query), invalidate on type updates

4. **Block ID generation**: Should block IDs be UUIDs or human-readable slugs?
   - **Proposed**: UUIDs for uniqueness, show shortened version in UI

5. **Embed depth limit**: Should we limit nested embeds (e.g., A embeds B which embeds C)?
   - **Proposed**: Limit to 2 levels deep, show "Embed too deep" error beyond that

## Implementation Notes

### Phased Rollout

Stories are grouped into phases for incremental implementation:

- **Phase 1-2**: Foundation (converters, basic editor integration)
- **Phase 3-7**: Core blocks (tasks, code, callouts, tables, slash commands)
- **Phase 8**: Media (links, images)
- **Phase 9-11**: References (refs, tags, heading/block refs)
- **Phase 12-13**: Advanced (block IDs, embeds)
- **Phase 14-15**: Math & footnotes
- **Phase 16-17**: Polish (read-only, long docs, multi-editor)
- **Phase 18**: Testing & verification

### Story Size

Each user story should take 1-3 hours to implement and verify. If a story grows beyond this, split it into smaller stories.

### Definition of Done

A story is **only** done when **ALL** criteria are met:

**For ALL stories:**

- [ ] TDD: Tests written FIRST (red → green → refactor)
- [ ] TDD: 80%+ code coverage achieved
- [ ] TDD: All unit tests pass
- [ ] Code Quality: Typecheck passes (`pnpm typecheck`)
- [ ] Code Quality: ESLint passes (`pnpm lint`)
- [ ] Code Quality: No `any` types (unless justified with comment)
- [ ] Code: Committed to git with clear conventional commit message

**Additional for UI stories:**

- [ ] Visual Gate: Screenshots captured (app vs Ladle, light/dark, Electron/web)
- [ ] Visual Gate: Screenshots show pixel-perfect match (or deviations documented)
- [ ] Visual Gate: Chrome DevTools inspection confirms 100% token usage (no arbitrary values)
- [ ] Visual Gate: Interactive states verified (hover, focus, active, disabled)
- [ ] Behavioral Gate: Playwright E2E test passes
- [ ] Behavioral Gate: Test covers happy path + edge cases + error states
- [ ] Behavioral Gate: Persistence tested (save → reload → verify)
- [ ] DevTools Gate: Performance measured (<50ms input latency)
- [ ] DevTools Gate: Zero console errors/warnings
- [ ] DevTools Gate: Lighthouse accessibility 95+
- [ ] DevTools Gate: No memory leaks
- [ ] Verified: Manual browser testing using dev-browser skill

### Quality Gate Automation

**CI Pipeline (run on every commit):**

```yaml
- pnpm typecheck # Fail if any type errors
- pnpm lint # Fail if any ESLint errors
- pnpm test # Fail if coverage <80% or any test fails
- pnpm test:e2e:quick # Fail if any E2E test fails
```

**Pre-Commit Hook (local enforcement):**

```bash
# .git/hooks/pre-commit
pnpm typecheck || exit 1
pnpm lint || exit 1
pnpm test --coverage --threshold=80 || exit 1
```

**Manual Checklist (per story):**
Use this checklist when marking a story complete:

1. ✓ Run `pnpm typecheck` → PASS
2. ✓ Run `pnpm lint` → PASS
3. ✓ Run `pnpm test --coverage` → 80%+ coverage, all tests PASS
4. ✓ Run `pnpm test:e2e -- editor-[feature].spec.ts` → PASS
5. ✓ Capture screenshots: Ladle vs App (Electron/Web, Light/Dark)
6. ✓ Compare screenshots → Pixel-perfect match (or document diffs)
7. ✓ Open Chrome DevTools → Elements → Inspect styles → All tokens ✓
8. ✓ Open Chrome DevTools → Console → Zero errors ✓
9. ✓ Open Chrome DevTools → Performance → Measure input latency <50ms ✓
10. ✓ Run Lighthouse → Accessibility score 95+ ✓
11. ✓ Test in Electron app → Feature works ✓
12. ✓ Test in web app → Feature works ✓
13. ✓ Git commit with conventional commit message
14. ✓ Story marked complete ✓

**Screenshot Storage:**

```
tests/
  visual-baselines/
    ladle/
      editor-formatting-allmarks-light.png
      editor-formatting-allmarks-dark.png
    app/
      electron/
        editor-formatting-allmarks-light.png
        editor-formatting-allmarks-dark.png
      web/
        editor-formatting-allmarks-light.png
        editor-formatting-allmarks-dark.png
```
