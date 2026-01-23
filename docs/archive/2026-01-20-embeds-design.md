# Embeds Design

## Goal

Support Obsidian-style embeds using `![[...]]` syntax so users can transclude content from other objects in a read-only, framed block. Embeds should respect heading and block targets and stay aligned with the existing reference UX (`#` and `#^`).

## UX Decisions (Locked)

- **Render model:** Full inline content render inside a **block-level container** (not inline).
- **Editable:** Read-only in place with an **Open source** action.
- **Nested embeds:** **Depth capped at 1** (embeds inside embeds are suppressed or rendered as placeholders).
- **Targets:** Whole object, heading target (`#Heading`), and block target (`#^block-id`).
- **Cross-type:** Allowed across object types.
- **Missing target:** Warning state + raw `![[...]]` text preserved in the body.
- **Container:** Visible title bar + border; title uses **alias** when provided.
- **Collapse:** Default **collapsed** with fixed preview height (~6–8 lines). Expand/collapse is **UI-only** (not serialized).
- **Updates:** **Live** updates when source changes in-session (via subscription callback).
- **Insertion:** `![[...]]` trigger + `/embed` slash command.

## Syntax

- `![[Page]]`
- `![[Page|Alias]]`
- `![[Page#Heading]]`
- `![[Page#^block-id]]`

## Data Model

### New Node: `EmbedNode`

**Type:** block-level atom

**Attributes:**

```ts
{
  objectId: string;
  objectType: string;
  displayTitle: string; // Title at time of insert (or alias)
  alias?: string | null;
  headingText?: string | null; // For #Heading targets
  blockId?: string | null;     // For #^block-id targets
}
```

### Serialization

- Render wrapper: `div[data-embed-node]` with data attributes for `objectId`, `objectType`, etc.
- No embedded content stored in the document.
- No persisted expand/collapse state.

## Editor APIs (Design System)

```ts
interface EmbedTarget {
  objectId: string;
  objectType: string;
  displayTitle: string;
  alias?: string | null;
  headingText?: string | null;
  blockId?: string | null;
}

interface EditorProps {
  enableEmbeds?: boolean; // default true

  // Resolve embedded content as TipTap JSON
  onEmbedResolve?: (target: EmbedTarget) => Promise<JSONContent>;

  // Open the source object (navigation handled by app)
  onEmbedOpen?: (target: EmbedTarget) => void;

  // Optional live updates subscription
  onEmbedSubscribe?: (target: EmbedTarget, onUpdate: (content: JSONContent) => void) => () => void;
}
```

## Behavior & Data Flow

1. User types `![[` or `/embed`, suggestion list appears (object → heading → block modes).
2. On selection, insert `EmbedNode` with target attrs.
3. `EmbedNodeView` calls `onEmbedResolve(target)` and renders a **read-only** embedded editor.
4. If `onEmbedSubscribe` is provided, subscribe on mount and update content on push.
5. If resolve fails or target missing, show warning state + raw `![[...]]` text.
6. Suppress embed rendering at depth > 1 (render placeholder or keep raw text).

## Suggestion Flow

- `![[` triggers Embed suggestion (mirrors RefSuggestion parsing):
  - `Page` → object search
  - `Page#` → heading search
  - `Page#^` → block search
  - `|Alias` supported in any mode

Suggestion UI should reuse the existing list components to keep styling consistent.

## UI States

- **Collapsed (default):** title bar + fixed-height preview
- **Expanded:** title bar + full content
- **Loading:** skeleton/placeholder inside container body
- **Missing/Error:** warning banner + raw `![[...]]` text

## Slash Command

Add `/embed` item that inserts `![[` and opens the embed suggestion.

## Out of Scope

- Persisted embed collapse state
- Editing embedded content in place
- Cross-document analytics or backlink aggregation
- Markdown export/import behavior in core converters (separate workstream)

## Acceptance Criteria

- [ ] `![[...]]` inserts an EmbedNode (block-level)
- [ ] Heading and block targets resolve (`#Heading`, `#^block-id`)
- [ ] Embed container renders title bar + Open source action
- [ ] Default collapsed preview with fixed height
- [ ] Live updates via subscription callback
- [ ] Missing targets show warning + raw syntax
- [ ] `/embed` slash command inserts and opens suggestions
- [ ] Nested embeds capped at depth 1
- [ ] Ladle stories cover all states
