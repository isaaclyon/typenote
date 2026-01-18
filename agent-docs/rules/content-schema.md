---
paths: packages/core/**/*.ts, packages/api/**/*.ts
---

# NotateDoc v1 Content Schema Rules

The canonical content schema for block documents. This schema is **editor-agnostic** — do not persist TipTap/ProseMirror internal JSON as canonical format.

## Design Principles

1. **Obsidian-like feature set** — Core Markdown + Obsidian conveniences
2. **No rich media in v1** — No images/audio/video embeds
3. **Stable IDs** — References use ULIDs, not titles
4. **Editor-agnostic** — Adapters convert to/from editor format

## Inline Node Model

All text content uses inline nodes:

```typescript
type Mark = 'em' | 'strong' | 'code' | 'strike' | 'highlight';

type InlineNode =
  | { t: 'text'; text: string; marks?: Mark[] }
  | { t: 'hard_break' }
  | { t: 'link'; href: string; children: InlineNode[] }
  | {
      t: 'ref';
      mode: 'link' | 'embed';
      target:
        | { kind: 'object'; objectId: string }
        | { kind: 'block'; objectId: string; blockId: string };
      alias?: string;
    }
  | { t: 'tag'; value: string }
  | { t: 'math_inline'; latex: string }
  | { t: 'footnote_ref'; key: string };
```

### Reference Nodes (`t: 'ref'`)

**Critical for backlinks and navigation:**

```typescript
// Object reference (wiki-link)
{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: '01HZX...' } }

// Block reference (specific block)
{ t: 'ref', mode: 'link', target: { kind: 'block', objectId: '01HZX...', blockId: '01HZY...' } }

// Transclusion (embed content, text-only in v1)
{ t: 'ref', mode: 'embed', target: { kind: 'object', objectId: '01HZX...' } }

// With display alias
{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: '01HZX...' }, alias: 'My Note' }
```

### Tag Nodes (`t: 'tag'`)

```typescript
// #project-alpha becomes:
{ t: 'tag', value: 'project-alpha' }
```

## Block Types

```typescript
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

### Content by Block Type

```typescript
// Paragraph — basic text block
type ParagraphContent = { inline: InlineNode[] };

// Heading — h1-h6
type HeadingContent = { level: 1 | 2 | 3 | 4 | 5 | 6; inline: InlineNode[] };

// List — container for list_item children
type ListContent = {
  kind: 'bullet' | 'ordered' | 'task';
  start?: number; // for ordered lists
  tight?: boolean;
};

// List Item — first line inline, additional content as child blocks
type ListItemContent = {
  inline: InlineNode[];
  checked?: boolean; // for task lists
};

// Blockquote — container, children are regular blocks
type BlockquoteContent = {};

// Callout — Obsidian-style callout container
type CalloutContent = {
  kind: string; // 'NOTE', 'WARNING', 'TIP', etc.
  title?: string;
  collapsed?: boolean;
};

// Code Block
type CodeBlockContent = { language?: string; code: string };

// Thematic Break (horizontal rule)
type ThematicBreakContent = {};

// Table — GFM-style tables
type TableContent = {
  align?: Array<'left' | 'center' | 'right' | null>;
  rows: Array<{ cells: InlineNode[][] }>;
};

// Math Block (display math)
type MathBlockContent = { latex: string };

// Footnote Definition
type FootnoteDefContent = { key: string; inline?: InlineNode[] };
```

## Container Blocks

Some blocks are **containers** — their content is expressed through child blocks:

| Block Type   | Container? | Children                    |
| ------------ | ---------- | --------------------------- |
| `paragraph`  | No         | —                           |
| `heading`    | No         | —                           |
| `list`       | Yes        | `list_item` blocks          |
| `list_item`  | Yes        | Any blocks (nested content) |
| `blockquote` | Yes        | Any blocks                  |
| `callout`    | Yes        | Any blocks                  |
| `table`      | No         | —                           |

## Reference Extraction Rules

**Extract refs from content for the `refs` table:**

```typescript
function extractRefs(content: unknown, blockType: BlockType): RefTarget[] {
  const refs: RefTarget[] = [];

  function walkInline(nodes: InlineNode[]) {
    for (const node of nodes) {
      if (node.t === 'ref') {
        refs.push(node.target);
      }
      if (node.t === 'link' && node.children) {
        walkInline(node.children);
      }
    }
  }

  // Extract from inline content based on block type
  if ('inline' in content) {
    walkInline(content.inline);
  }

  // Tables have inline content in cells
  if (blockType === 'table' && 'rows' in content) {
    for (const row of content.rows) {
      for (const cell of row.cells) {
        walkInline(cell);
      }
    }
  }

  return refs;
}
```

## FTS Extraction Rules

**Extract plain text for full-text search:**

```typescript
function extractPlainText(content: unknown, blockType: BlockType): string {
  const parts: string[] = [];

  function walkInline(nodes: InlineNode[]) {
    for (const node of nodes) {
      switch (node.t) {
        case 'text':
          parts.push(node.text);
          break;
        case 'tag':
          parts.push(node.value);
          break;
        case 'ref':
          if (node.alias) parts.push(node.alias);
          break;
        case 'link':
          walkInline(node.children);
          break;
        // Skip: hard_break, math_inline, footnote_ref
      }
    }
  }

  if ('inline' in content) {
    walkInline(content.inline);
  }
  if ('code' in content) {
    parts.push(content.code);
  }

  return parts.join(' ');
}
```

**Do NOT include:**

- Target object titles (avoid hidden coupling)
- Math LaTeX content
- Code block syntax tokens

## Obsidian Syntax Mapping

For import/export compatibility:

| Obsidian Syntax    | NotateDoc Representation                                           |
| ------------------ | ------------------------------------------------------------------ |
| `[[Page]]`         | `{ t: 'ref', mode: 'link', target: { kind: 'object', objectId } }` |
| `[[Page\|Alias]]`  | `{ t: 'ref', ..., alias: 'Alias' }`                                |
| `[[Page#Heading]]` | `{ t: 'ref', target: { kind: 'block', objectId, blockId } }`       |
| `![[Page]]`        | `{ t: 'ref', mode: 'embed', ... }`                                 |
| `#tag`             | `{ t: 'tag', value: 'tag' }`                                       |
| `- [ ] task`       | `list(kind: 'task')` + `list_item(checked: false)`                 |
| `- [x] done`       | `list_item(checked: true)`                                         |
| `> [!NOTE]`        | `callout(kind: 'NOTE')`                                            |
| `` `code` ``       | `{ t: 'text', text: 'code', marks: ['code'] }`                     |
| `**bold**`         | `{ t: 'text', text: 'bold', marks: ['strong'] }`                   |
| `*italic*`         | `{ t: 'text', text: 'italic', marks: ['em'] }`                     |
| `~~strike~~`       | `{ t: 'text', text: 'strike', marks: ['strike'] }`                 |
| `==highlight==`    | `{ t: 'text', text: 'highlight', marks: ['highlight'] }`           |
| `$math$`           | `{ t: 'math_inline', latex: 'math' }`                              |
| `$$display$$`      | `math_block(latex: 'display')`                                     |

## Validation Rules

### Content Must Match Block Type

```typescript
const ContentSchemaByType = {
  paragraph: ParagraphContentSchema,
  heading: HeadingContentSchema,
  list: ListContentSchema,
  list_item: ListItemContentSchema,
  blockquote: BlockquoteContentSchema,
  callout: CalloutContentSchema,
  code_block: CodeBlockContentSchema,
  thematic_break: ThematicBreakContentSchema,
  table: TableContentSchema,
  math_block: MathBlockContentSchema,
  footnote_def: FootnoteDefContentSchema,
};

function validateBlockContent(blockType: BlockType, content: unknown): ValidationResult {
  const schema = ContentSchemaByType[blockType];
  return schema.safeParse(content);
}
```

### Block Type Changes

**v1 default: Disallow block type changes in updates**

```typescript
// In UpdateBlockOp validation
if (patch.blockType !== undefined && patch.blockType !== existingBlock.blockType) {
  throw new PatchError('VALIDATION', {
    message: 'Block type change not allowed in v1',
    field: 'blockType',
  });
}
```

## Anti-Patterns

### Editor-Specific Content

**Bad:** Storing TipTap/ProseMirror JSON directly

```typescript
// DON'T: Editor-specific format
{
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }]
}
```

**Good:** Store in canonical NotateDoc format

```typescript
// DO: Editor-agnostic format
{
  inline: [{ t: 'text', text: 'Hello' }];
}
```

### Title-Based References

**Bad:** References by title string

```typescript
// DON'T: Fragile, breaks on rename
{ t: 'ref', title: 'My Note' }
```

**Good:** References by stable ID

```typescript
// DO: Stable reference
{ t: 'ref', target: { kind: 'object', objectId: '01HZX...' }, alias: 'My Note' }
```
