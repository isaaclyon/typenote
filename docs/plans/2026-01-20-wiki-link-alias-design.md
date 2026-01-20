# Wiki Link Alias Design

**Status:** Approved
**Owner:** Design System
**Date:** 2026-01-20

## Goal

Add support for wiki link aliases (`[[Page|Alias]]`) to the TypeNote editor. This allows users to display custom text while linking to an object, matching Obsidian's syntax.

## Requirements

1. **Pipe syntax during insertion** — Type `[[Project Roadmap|roadmap docs]]` to insert a ref with custom display text
2. **Post-insertion editing** — Right-click a RefNode → "Edit alias..." to modify the alias
3. **Clean visual presentation** — Aliased refs look identical to non-aliased refs (no visual distinction)
4. **Reversible** — Clearing the alias reverts to the original title

## Data Model

### RefNode Attributes (Extended)

```typescript
interface RefNodeAttributes {
  objectId: string;
  objectType: string;
  displayTitle: string; // Original title at insertion time
  color?: string | null;
  alias?: string | null; // NEW: Custom display text (null = use displayTitle)
}
```

### Display Logic

- If `alias` is set and non-empty → show `alias`
- Otherwise → show `displayTitle`
- If both empty → show "Untitled"

### HTML Serialization

- Add `data-alias` attribute for persistence
- Markdown export: `[[Title|Alias]]` when alias exists, `[[Title]]` when not

## Entry Point 1: Pipe Syntax in Suggestion Flow

### Trigger Behavior

When user types `[[Project Roadmap|`, the pipe character triggers alias mode:

1. The text before `|` ("Project Roadmap") is the search query
2. The text after `|` becomes the alias
3. User continues typing the alias: `[[Project Roadmap|roadmap docs`
4. Selecting an item from the suggestion list inserts RefNode with:
   - `displayTitle`: "Project Roadmap" (from selected object)
   - `alias`: "roadmap docs" (from text after pipe)

### Edge Cases

- `[[|something]]` — Empty search, alias only → search with empty query, use "something" as alias
- `[[Page|]]` — Search "Page", empty alias → treat as no alias (null)
- Multiple pipes `[[A|B|C]]` — First pipe is separator, "B|C" is the alias

## Entry Point 2: Context Menu Editing

### Interaction Flow

1. User right-clicks a RefNode
2. Context menu appears with option: "Edit alias..."
3. Clicking opens a small popover anchored to the RefNode
4. Popover contains:
   - Input field (pre-filled with current alias or empty)
   - Placeholder: "Custom display text"
   - Enter to confirm, Escape to cancel
5. Saving updates the `alias` attribute on the node
6. Empty input = clear alias (revert to displayTitle)

## Implementation Plan

### Files to Modify

1. `RefNode.ts` — Add `alias` attribute to schema
2. `RefNodeView.tsx` — Display alias, add context menu, create popover
3. `RefSuggestion.ts` + `createDoubleBracketSuggestion` — Parse pipe syntax
4. `useRefSuggestion.ts` — Pass alias through suggestion flow (if needed)
5. `Editor.stories.tsx` — Add stories for aliases

### New Components

- `AliasEditPopover.tsx` — Small edit popover for alias editing (or inline in RefNodeView)

### Stories to Add

1. `WithAliasedRefs` — Pre-existing refs with aliases
2. `RefAliasViaPipe` — Demonstrates `[[Page|alias]]` syntax
3. `RefAliasEditing` — Shows context menu → edit flow

## Scope Exclusions (YAGNI)

- No tooltip showing original title (can add later if needed)
- No bulk alias editing
- No alias suggestions/autocomplete
- No visual distinction for aliased refs

## Testing Notes

- Verify pipe parsing handles edge cases (empty search, empty alias, multiple pipes)
- Verify alias persists in JSON export/import
- Verify clearing alias reverts display to original title
- Verify context menu appears on right-click and popover functions correctly
