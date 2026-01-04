# Block Patch Operation Spec — v1 (Backend Contract)

## 0) Purpose

Define a transport-agnostic, versioned, transactional write contract for editing an Object’s primary document (tree of Blocks). This spec is the canonical backend API contract that any UI/editor adapter must conform to.

Goals:

- Transactional correctness (tree invariants, referential integrity)
- Incremental indexing (FTS + refs) within the same transaction
- Minimal write amplification (fractional ordering)
- Portable (usable from CLI, tests, IPC)
- Future-friendly (does not preclude sync, but does not implement it)

Non-goals (v1):

- Collaboration / CRDT / multi-writer conflict-free merging
- Full event sourcing (optional later)

---

## 1) Core Concepts

### 1.1 Object document

Each Object has one primary document represented as a **tree of Blocks**.

- A Block belongs to exactly one Object.
- Tree structure is encoded via `parent_block_id` (nullable for root).
- Sibling order is encoded via `order_key` (fractional/lexicographic).

### 1.2 Identifiers

- `object_id`, `block_id` are ULIDs.
- `order_key` is a lexicographic string generated via fractional indexing.

### 1.3 Versioning

Each Object document has an integer `doc_version`:

- Incremented by 1 per successful patch application.
- Used for optimistic concurrency.

---

## 2) API Surface

### 2.1 Function signature (logical)

`applyBlockPatch(input: ApplyBlockPatchInput): ApplyBlockPatchResult`

Transport notes:

- This contract must be usable in-process (unit tests/CLI) and over IPC later.

### 2.2 Request envelope

```ts
type ApplyBlockPatchInput = {
  apiVersion: 'v1';
  objectId: string; // ULID

  /**
   * Optimistic concurrency:
   * - If provided, patch must apply against this exact version.
   * - If omitted, backend applies as last-writer-wins (not recommended for UI).
   */
  baseDocVersion?: number;

  /**
   * Idempotency:
   * - Strongly recommended for UI.
   * - If the same key is re-submitted for the same objectId, backend returns the prior result.
   */
  idempotencyKey?: string;

  ops: BlockOp[];

  /** Optional: client context useful for audit/debug (not relied on for correctness). */
  client?: {
    actorId?: string;
    deviceId?: string;
    appVersion?: string;
    ts?: string; // ISO datetime
  };
};
```

### 2.3 Response envelope

```ts
type ApplyBlockPatchResult = {
  apiVersion: 'v1';
  objectId: string;
  previousDocVersion: number;
  newDocVersion: number;

  /**
   * Minimal change summary for the UI.
   * (UI should already know most changes; this is for confirmation/reconciliation.)
   */
  applied: {
    insertedBlockIds: string[];
    updatedBlockIds: string[];
    movedBlockIds: string[];
    deletedBlockIds: string[];
  };

  /** Optional warnings (non-fatal) */
  warnings?: Array<{ code: string; message: string; details?: unknown }>;
};
```

---

## 3) Operations

### 3.1 Operation union

```ts
type BlockOp = InsertBlockOp | UpdateBlockOp | MoveBlockOp | DeleteBlockOp;
```

### 3.2 Insert

Insert a new block under a parent (or at root) at a specific relative position.

```ts
type InsertBlockOp = {
  op: 'block.insert';
  blockId: string; // ULID (client-generated recommended)
  parentBlockId: string | null; // null = root

  /**
   * Ordering: provide either:
   * - explicit orderKey (advanced), OR
   * - placement hint (recommended): before/after sibling.
   */
  orderKey?: string;
  place?:
    | { where: 'start' }
    | { where: 'end' }
    | { where: 'before'; siblingBlockId: string }
    | { where: 'after'; siblingBlockId: string };

  blockType: string; // e.g., paragraph, heading, list_item, embed, etc.

  /**
   * Persisted block content in the app’s canonical schema.
   * Must be editor-agnostic (do not persist TipTap internal JSON as canonical).
   */
  content: unknown; // validated by backend per blockType

  meta?: {
    collapsed?: boolean;
  };
};
```

Backend behavior:

- Computes `order_key` if `place` provided.
- Validates parent exists and belongs to the same object.
- Validates content schema for `blockType`.

### 3.3 Update

Update content and/or metadata of an existing block.

```ts
type UpdateBlockOp = {
  op: 'block.update';
  blockId: string;

  /** Partial update. Omitted fields are unchanged. */
  patch: {
    blockType?: string; // allowed only if compatible; see invariants
    content?: unknown;
    meta?: {
      collapsed?: boolean;
    };
  };
};
```

Backend behavior:

- Validates block exists and belongs to object.
- Validates any changed `blockType` is allowed (default: disallow type change in v1 unless explicitly compatible).
- Rebuilds derived refs + FTS for that block.

### 3.4 Move

Move a block to a new parent and/or reorder among siblings.

```ts
type MoveBlockOp = {
  op: 'block.move';
  blockId: string;
  newParentBlockId: string | null;

  orderKey?: string;
  place?:
    | { where: 'start' }
    | { where: 'end' }
    | { where: 'before'; siblingBlockId: string }
    | { where: 'after'; siblingBlockId: string };

  /**
   * If true, move includes entire subtree (default true).
   * v1 default: always subtree move.
   */
  subtree?: true;
};
```

Backend behavior:

- Validates no cycles (cannot move a node under its own descendant).
- Updates only the moved block’s `parent_block_id` and `order_key`.
- Subtree structure remains intact.

### 3.5 Delete

Soft-delete a block (and its subtree).

```ts
type DeleteBlockOp = {
  op: 'block.delete';
  blockId: string;

  /** v1 default: true; always delete subtree. */
  subtree?: true;
};
```

Backend behavior:

- Sets `deleted_at` on the block and all descendants.
- Removes/updates derived refs and FTS entries for affected blocks.

---

## 4) Validation and Invariants (Hard Rules)

### 4.1 Tree integrity

- Every non-root block must have a `parent_block_id` that exists, is not deleted, and belongs to the same object.
- No cycles.
- A block belongs to exactly one object; cross-object parenting is forbidden.

### 4.2 Ordering

- Sibling ordering is determined by `order_key` lexicographic sort.
- `order_key` must be unique among siblings (backend ensures uniqueness; may rebalance).

### 4.3 Soft deletion

- Deleted blocks are excluded from reads, search, and backlinks by default.
- Descendant blocks inherit deletion when a parent is deleted.

### 4.4 Reference integrity (content-level)

- References inside `content` must be explicit ID-based nodes.
- Backend extracts refs from persisted content and maintains `refs` table transactionally.

### 4.5 Transactions

- A patch is all-or-nothing.
- Any invariant violation aborts the patch.

---

## 5) Derived Data Side Effects (Within the Same Transaction)

On any insert/update/delete affecting content:

1. **Reference extraction**
   - Parse block `content` for reference nodes.
   - Upsert/delete rows in `refs` for affected blocks.

2. **FTS update**
   - Extract plain text from content.
   - Update `fts_blocks` for affected blocks.

3. **Order key generation**
   - If `place` is provided, generate a fractional order key between neighbors.
   - If keys become too long, schedule or perform a rebalance of sibling keys.

---

## 6) Concurrency Model (v1)

### 6.1 Single-writer

- Backend processes patches per `objectId` in a single-writer queue.

### 6.2 Optimistic concurrency

- If `baseDocVersion` is provided and does not match current, reject with `CONFLICT_VERSION`.

### 6.3 Idempotency

- If `idempotencyKey` is provided:
  - Backend stores a mapping `(objectId, idempotencyKey) -> result`.
  - Replays return the stored result without reapplying ops.

---

## 7) Error Taxonomy

Errors are returned as structured objects:

```ts
type ApiError = {
  apiVersion: 'v1';
  code:
    | 'NOT_FOUND_OBJECT'
    | 'NOT_FOUND_BLOCK'
    | 'VALIDATION'
    | 'CONFLICT_VERSION'
    | 'CONFLICT_ORDERING'
    | 'INVARIANT_CYCLE'
    | 'INVARIANT_CROSS_OBJECT'
    | 'INVARIANT_PARENT_DELETED'
    | 'IDEMPOTENCY_CONFLICT'
    | 'INTERNAL';
  message: string;
  details?: unknown;
};
```

Guidance:

- **VALIDATION**: schema/content invalid for the blockType or op fields malformed.
- **CONFLICT_VERSION**: baseDocVersion mismatch.
- **INVARIANT_CYCLE**: attempted move creates cycle.
- **CONFLICT_ORDERING**: sibling orderKey collision that cannot be resolved (rare; backend should generally resolve).

---

## 8) Read Model Requirements (for completeness)

These are needed to support a UI/editor adapter but are separate endpoints:

- `getDocument(objectId)` returns the block tree (excluding deleted blocks).
- `getBlock(blockId)` returns a single block.
- `listChildren(objectId, parentBlockId)` returns ordered siblings.
- `backlinks(objectId)` returns inbound refs.

All reads must specify:

- whether to include deleted blocks (default false)
- whether to include derived fields (e.g., extracted text)

---

## 9) Examples

### 9.1 Create today’s DailyNote doc root blocks

```json
{
  "apiVersion": "v1",
  "objectId": "01HZX...",
  "baseDocVersion": 0,
  "idempotencyKey": "today-init-2026-01-04",
  "ops": [
    {
      "op": "block.insert",
      "blockId": "01HZY...",
      "parentBlockId": null,
      "place": { "where": "end" },
      "blockType": "heading",
      "content": { "text": "January 4, 2026" }
    },
    {
      "op": "block.insert",
      "blockId": "01HZZ...",
      "parentBlockId": null,
      "place": { "where": "end" },
      "blockType": "paragraph",
      "content": { "text": "" }
    }
  ]
}
```

### 9.2 Insert a paragraph after a specific sibling

```json
{
  "apiVersion": "v1",
  "objectId": "01HZX...",
  "baseDocVersion": 3,
  "ops": [
    {
      "op": "block.insert",
      "blockId": "01J0A...",
      "parentBlockId": null,
      "place": { "where": "after", "siblingBlockId": "01HZZ..." },
      "blockType": "paragraph",
      "content": { "text": "Follow up with Isaac" }
    }
  ]
}
```

### 9.3 Move a block under another block (nest)

```json
{
  "apiVersion": "v1",
  "objectId": "01HZX...",
  "baseDocVersion": 4,
  "ops": [
    {
      "op": "block.move",
      "blockId": "01J0A...",
      "newParentBlockId": "01HZY...",
      "place": { "where": "end" }
    }
  ]
}
```

---

## 10) Implementation Notes (SQLite/Drizzle)

- Apply patches within a single SQLite transaction.
- Maintain indexes:
  - `blocks(object_id, parent_block_id, order_key)` for ordered sibling reads
  - `refs(to_object_id, to_block_id)` for backlinks
  - `fts_blocks` for search

- Store `doc_version` on `objects` table (or a dedicated `object_docs` table).
- Idempotency table: `idempotency(object_id, key, result_json, created_at)`.

---

## 11) Canonical Content Schema (NotateDoc v1)

The goal is to support an **Obsidian-like Markdown feature set** (core Markdown + common Obsidian-flavored conveniences), while keeping the persisted format editor-agnostic and stable.

Important boundary:

- “Everything Obsidian does” is interpreted as **Obsidian core editing syntax**, not the full plugin ecosystem.
- **No rich media** in v1: no images/audio/video embeds or binary attachment rendering. Plain links and text transclusions are allowed.

### 11.1 Inline node model

```ts
type Mark = 'em' | 'strong' | 'code' | 'strike' | 'highlight';

type InlineNode =
  | { t: 'text'; text: string; marks?: Mark[] }
  | { t: 'hard_break' }
  | { t: 'link'; href: string; children: InlineNode[] }
  | {
      t: 'ref';
      mode: 'link' | 'embed'; // embed = transclusion (text-only in v1)
      target:
        | { kind: 'object'; objectId: string }
        | { kind: 'block'; objectId: string; blockId: string };
      alias?: string; // display text override
    }
  | { t: 'tag'; value: string }
  | { t: 'math_inline'; latex: string }
  | { t: 'footnote_ref'; key: string };
```

Reference extraction rule:

- Any `InlineNode` with `t:"ref"` produces/updates a `refs` edge row for the owning block.

FTS extraction rule (minimum viable):

- Concatenate `text`, `tag.value`, and `alias` (if present) plus link text from `link.children`.
- Do **not** include target object titles by default (avoid hidden coupling); titles can be searched via object search.

### 11.2 Block types

Blocks are stored as records and arranged into a tree via `parent_block_id`. Some block types are **containers** (their meaning is expressed primarily through children).

```ts
type BlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'list_item'
  | 'blockquote'
  | 'callout'
  | 'code_block'
  | 'thematic_break'
  | 'table'
  | 'math_block'
  | 'footnote_def';
```

### 11.3 Block content schemas

```ts
type ParagraphContent = { inline: InlineNode[] };

type HeadingContent = { level: 1 | 2 | 3 | 4 | 5 | 6; inline: InlineNode[] };

// Container. Children are list_item blocks.
type ListContent = { kind: 'bullet' | 'ordered' | 'task'; start?: number; tight?: boolean };

// The first line of a list item is stored as `inline`. Any additional content lives in child blocks.
type ListItemContent = { inline: InlineNode[]; checked?: boolean };

// Container. Children are regular blocks.
type BlockquoteContent = {};

// Container. Children are regular blocks.
type CalloutContent = { kind: string; title?: string; collapsed?: boolean };

type CodeBlockContent = { language?: string; code: string };

type ThematicBreakContent = {};

// Basic Markdown tables. v1 supports inline content in cells; no row/col spans.
type TableContent = {
  align?: Array<'left' | 'center' | 'right' | null>;
  rows: Array<{ cells: InlineNode[][] }>; // rows[r].cells[c] is InlineNode[]
};

type MathBlockContent = { latex: string };

// Definition content may be represented either as inline-only or as child blocks.
// v1 default: inline-only, with optional child blocks for richer structure.
type FootnoteDefContent = { key: string; inline?: InlineNode[] };

type BlockContentByType = {
  paragraph: ParagraphContent;
  heading: HeadingContent;
  list: ListContent;
  list_item: ListItemContent;
  blockquote: BlockquoteContent;
  callout: CalloutContent;
  code_block: CodeBlockContent;
  thematic_break: ThematicBreakContent;
  table: TableContent;
  math_block: MathBlockContent;
  footnote_def: FootnoteDefContent;
};
```

### 11.4 Obsidian syntax mapping (import/export guidance)

- `[[Page]]`, `[[Page|Alias]]` → `InlineNode {t:"ref", target: objectId, alias}`
- `[[Page#Heading]]` → resolve to objectId + a blockId (heading block) if available; otherwise object ref with alias
- Block refs like `^block` → store as explicit block target `{kind:"block", objectId, blockId}`
- `![[Page]]` / transclusions → `mode:"embed"` (text-only render in v1)
- `#tag` → `InlineNode {t:"tag"}`
- `- [ ] task` / `- [x] task` → `list(kind:"task")` + `list_item(checked)`
- Callouts `> [!NOTE]`… → `callout(kind:"NOTE")` container
- Fenced code blocks → `code_block`
- Tables → `table`
- `$$...$$` → `math_block`; `$...$` → `math_inline`

### 11.5 contentblock property semantics

- `contentblock` stores an **inline block reference** (target blockId + objectId).
- Referencing behavior is soft:
  - If target block is deleted, the property becomes dangling and resolves to “missing” until repaired.
  - Provide a repair tool later (e.g., re-point to nearest surviving block).

---

## 12) Follow-on Specs (Next)

1. **BlockPatch implementation details**
   - order-key generation algorithm + rebalance strategy
   - subtree delete rules and performance considerations

2. **Import/export**
   - deterministic JSON export and Markdown export rules
   - resolving wiki-links to IDs on import (disambiguation policy)

3. **Relations semantics**
   - cardinality, referential integrity on delete, allowed target types

4. **DailyNote endpoints**
   - getOrCreateToday, getByDate, neighbors, templates
