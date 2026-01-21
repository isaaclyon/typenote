# Block ID Design

## Goal

Enable users to add unique identifiers to blocks, which can later be referenced via `[[Page#^block-id]]` syntax. This is the Obsidian-style block reference model.

## Markdown Syntax

```markdown
This is a paragraph with a block ID. ^my-id

> A blockquote with an ID ^quote-1

- List item with ID ^item-1
```

The `^block-id` appears at the end of a block, preceded by a space. The ID:

- Must start with a letter or underscore
- Contains only alphanumeric characters, hyphens, and underscores
- Is case-insensitive (normalized to lowercase)
- Maximum 64 characters

## Storage

Block IDs are already supported in the NotateDoc schema:

```typescript
// In packages/api/src/notateDoc.ts
export const BlockRefTargetSchema = z.object({
  kind: z.literal('block'),
  objectId: z.string(),
  blockId: z.string(), // <-- Already exists
});
```

The `blocks` table in SQLite likely uses KSUID as the primary key. A user-facing block ID would be a separate field — either:

1. **Option A:** Add `customId` field to blocks table
2. **Option B:** Store as an inline node at end of block content

We'll use **Option B** (inline node) for simplicity — no schema migration needed and it naturally appears at the end of the block.

## Editor Implementation

### New Inline Node: BlockIdNode

A non-editable inline atom that renders at the end of a block.

**Attributes:**

- `id`: The block ID string (without the `^` prefix)

**Rendering:**

- Small, muted pill showing `^block-id`
- Click to copy the full reference `[[Object Title#^block-id]]` to clipboard
- Right-click for context menu: Copy reference, Edit ID, Remove ID

**Input Rule:**

- Type ` ^` at end of a block followed by valid ID chars
- On space or Enter, convert to BlockIdNode

### TipTap Extension

```typescript
// extensions/BlockIdNode.ts
export const BlockIdNode = Node.create({
  name: 'blockId',
  group: 'inline',
  inline: true,
  atom: true,  // Non-editable
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      id: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-block-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-block-id': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockIdNodeView);
  },

  addInputRules() {
    return [
      new InputRule({
        // Match ` ^id` at end of line, followed by space/enter
        find: /\s\^([a-zA-Z_][a-zA-Z0-9_-]{0,63})$/,
        handler: /* ... */
      }),
    ];
  },
});
```

### NodeView Component

```tsx
// BlockIdNodeView.tsx
function BlockIdNodeView({ node, selected }: NodeViewProps) {
  const { id } = node.attrs;

  const handleClick = () => {
    // Copy full reference to clipboard
    const ref = `[[Current Object#^${id}]]`;
    navigator.clipboard.writeText(ref);
    toast.success('Reference copied');
  };

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        onClick={handleClick}
        className={cn(
          'text-xs text-muted-foreground font-mono',
          'px-1 py-0.5 rounded bg-muted/50',
          'cursor-pointer hover:bg-muted',
          selected && 'ring-1 ring-primary'
        )}
        title="Click to copy reference"
      >
        ^{id}
      </span>
    </NodeViewWrapper>
  );
}
```

## User Flow

1. **Adding a Block ID:**
   - Type ` ^my-id` at end of any block
   - Press Space or Enter to confirm
   - The text converts to a styled BlockIdNode

2. **Copying a Reference:**
   - Click the block ID pill
   - Full reference `[[Title#^my-id]]` copied to clipboard

3. **Editing/Removing:**
   - Select the block ID node
   - Press Backspace to delete
   - (Future: context menu for Edit/Remove)

## Ladle Stories

1. **Basic** — Show block ID at end of paragraph
2. **InputRule** — Demo typing `^my-id` and conversion
3. **Click to Copy** — Demo clipboard interaction
4. **Multiple Blocks** — Show various block types with IDs
5. **Validation** — Show invalid ID handling

## Files to Create/Modify

| File                                 | Action                             |
| ------------------------------------ | ---------------------------------- |
| `extensions/BlockIdNode.ts`          | Create — TipTap extension          |
| `extensions/BlockIdNodeView.tsx`     | Create — React NodeView            |
| `stories/Editor.blockId.stories.tsx` | Create — Ladle stories             |
| `Editor.tsx`                         | Modify — Add BlockIdNode extension |

## Out of Scope (Future)

- Block reference resolution (`[[Page#^id]]` → RefNode with block target)
- Auto-generated block IDs
- Block ID conflict detection across objects

## Acceptance Criteria

- [ ] `^valid-id` at end of block converts to BlockIdNode
- [ ] BlockIdNode renders as styled pill
- [ ] Click copies `[[Title#^id]]` to clipboard
- [ ] Backspace deletes the node
- [ ] Invalid IDs (starting with number, special chars) don't convert
- [ ] Ladle stories demonstrate all behaviors
