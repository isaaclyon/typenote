# Alias Mode UX Design

**Date:** 2026-01-20  
**Status:** Approved

## Problem

When typing `[[Reference|alias]]`, the current UX has several issues:

1. **No visual feedback** — Nothing indicates you've entered "alias mode"
2. **Confusing Create option** — Shows raw text with pipe (`"Getting Started Guide|Alias"`)
3. **Unclear what Enter does** — Ambiguous whether it uses alias or creates new object

## Design

### Core Behavior

When user types `|` after text that matches an existing item, enter "alias mode":

1. **Detect alias mode** — Parse query for `|`. If found AND pre-pipe text matches an item, enter alias mode.
2. **Collapse the list** — Show only the matched item (no other results, no "Create" option).
3. **Show alias preview** — Display live preview of how the reference will appear.
4. **Enter confirms** — Insert RefNode with the alias set.

**Edge case:** If pre-pipe text doesn't match anything, stay in normal mode.

### Visual Design

```
┌─────────────────────────────────────────┐
│  📄 Getting Started Guide         Page  │  ← Matched item (highlighted)
├─────────────────────────────────────────┤
│  → displays as "Alias"                  │  ← Live preview (muted text)
└─────────────────────────────────────────┘
```

- **Matched item row** — Same styling as selected item
- **Preview row** — Muted text, subtle separator above
- **Live updating** — Preview updates as user types after `|`
- **Empty alias** — Show `→ displays as ""` placeholder

### Keyboard Interactions

| Key                           | Action                                 |
| ----------------------------- | -------------------------------------- |
| **Enter**                     | Insert RefNode with alias, close popup |
| **Tab**                       | No-op (already have full title)        |
| **Escape**                    | Close popup, leave raw text            |
| **Backspace** (deleting `\|`) | Exit alias mode, return to search      |
| **Arrow keys**                | Disabled (only one item visible)       |

### Mouse Interactions

- **Click matched item** — Same as Enter
- **Click outside** — Close popup, leave raw text

## Implementation

### Files to Modify

1. **RefSuggestionList.tsx** — Add alias mode rendering
   - New prop: `aliasMode: { targetItem: RefSuggestionItem; alias: string } | null`
   - Render single item + preview row when set
   - Hide "Create" option in alias mode

2. **Editor.tsx** — Detect alias mode
   - Parse query with `parseQueryWithAlias()`
   - If `alias !== null` AND items contain exact match, set alias mode
   - Pass `aliasMode` prop to RefSuggestionList
   - Disable arrow keys in alias mode

### No Changes Needed

- `RefSuggestion.ts` — Parsing already handles `|`
- `RefNode.ts` — Alias attribute already supported
