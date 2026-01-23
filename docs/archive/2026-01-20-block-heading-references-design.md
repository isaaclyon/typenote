# Block & Heading References Design

## Goal

Enable linking to specific blocks or headings within objects, following Obsidian's UX patterns.

## Syntax

| Syntax               | Target           | Example                |
| -------------------- | ---------------- | ---------------------- |
| `[[Page]]`           | Whole object     | Existing RefNode       |
| `[[Page#Heading]]`   | Specific heading | New: heading reference |
| `[[Page#^block-id]]` | Specific block   | New: block reference   |

## User Flow

### Heading Reference (`#` without caret)

```
1. Type [[My Page#
2. Suggestion popup switches to heading search mode
3. Shows all headings in "My Page" with level indicators (H1, H2, etc.)
4. Select heading → inserts [[My Page#Heading Text]]
```

### Block Reference (`#^`)

```
1. Type [[My Page#^
2. Suggestion popup switches to block search mode
3. Shows all blocks, searchable by text content
4. Each result shows: [type icon] truncated preview... (^alias if exists)
5. Select block:
   - If block has ^alias → insert [[My Page#^alias]]
   - If no alias → generate 6-char ID, insert [[My Page#^abc123]]
     AND insert BlockIdNode at end of source block
```

## RefNode Extension

### Current Attributes

```typescript
{
  objectId: string
  objectType: ObjectType
  title: string
  alias?: string
}
```

### New Attributes

```typescript
{
  objectId: string
  objectType: ObjectType
  title: string
  alias?: string
  // New
  headingText?: string   // For [[Page#Heading]]
  blockId?: string       // For [[Page#^id]]
}
```

### Display Logic

| State                   | Display                                  |
| ----------------------- | ---------------------------------------- |
| `title` only            | `My Page`                                |
| `title` + `alias`       | `alias text`                             |
| `title` + `headingText` | `My Page > Heading` or `My Page#Heading` |
| `title` + `blockId`     | `My Page#^abc123`                        |
| All with alias          | Use alias instead                        |

## RefSuggestion State Machine

```
IDLE
  ↓ (detect [[ or @)
OBJECT_SEARCH
  ↓ (select object OR type "Object#")
  ├─→ (no # typed) → INSERT RefNode → IDLE
  ├─→ (# typed, no ^) → HEADING_SEARCH
  └─→ (#^ typed) → BLOCK_SEARCH

HEADING_SEARCH
  ↓ (select heading)
  INSERT RefNode with headingText → IDLE

BLOCK_SEARCH
  ↓ (select block)
  ├─→ (block has alias) → INSERT RefNode with blockId=alias → IDLE
  └─→ (no alias) → GENERATE 6-char ID
                 → INSERT RefNode with blockId
                 → CALL onBlockIdInsert callback
                 → IDLE
```

## New Editor Callbacks

```typescript
interface EditorProps {
  // Existing
  onRefSearch: (query: string) => Promise<RefSearchResult[]>;
  onRefCreate: (title: string, type: ObjectType) => Promise<RefSearchResult>;

  // New for heading/block references
  onHeadingSearch?: (objectId: string) => Promise<HeadingSearchResult[]>;
  onBlockSearch?: (objectId: string, query: string) => Promise<BlockSearchResult[]>;
  onBlockIdInsert?: (objectId: string, blockKsuid: string, alias: string) => void;
}

interface HeadingSearchResult {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

interface BlockSearchResult {
  ksuid: string; // Internal block ID
  alias?: string; // Existing ^alias if present
  preview: string; // Truncated text content (first ~50 chars)
  blockType: BlockType; // paragraph, heading, blockquote, etc.
}
```

## Auto-Generated Block ID

When user selects a block without an existing alias:

1. Generate 6-char alphanumeric ID: `[a-z0-9]{6}`
2. Check for collisions within document (regenerate if collision)
3. Insert `[[Page#^abc123]]` at cursor
4. Call `onBlockIdInsert(objectId, blockKsuid, "abc123")`
5. Backend inserts `BlockIdNode` at end of source block

### ID Generation

```typescript
function generateBlockId(existingIds: Set<string>): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id: string;
  do {
    id = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (existingIds.has(id));
  return id;
}
```

## UI Design

### Heading Search Results

```
┌─────────────────────────────────────┐
│ H1  Introduction                    │
│ H2  Getting Started                 │
│ H2  Configuration                   │
│ H3  Advanced Options                │
│ H2  Conclusion                      │
└─────────────────────────────────────┘
```

### Block Search Results

```
┌─────────────────────────────────────┐
│ ¶  This is the first paragraph...  │
│ H1 Introduction                     │
│ ¶  Some important definition... ^def│
│ >  A memorable quote worth...       │
│ ¶  Final thoughts on the topic...   │
└─────────────────────────────────────┘
```

Type indicators:

- `¶` paragraph
- `H1`-`H6` headings
- `>` blockquote
- `•` list item
- `☑` task item
- `</>`code block

## Implementation Phases

### Phase 1: Extend RefNode

- Add `headingText` and `blockId` attributes
- Update `RefNodeView` to display suffixes
- Update `renderHTML` for serialization

### Phase 2: Heading Search Mode

- Detect `#` after object in RefSuggestion
- New state: `HEADING_SEARCH`
- Call `onHeadingSearch` callback
- Render heading results with level indicators
- Insert RefNode with `headingText` on selection

### Phase 3: Block Search Mode

- Detect `#^` after object in RefSuggestion
- New state: `BLOCK_SEARCH`
- Call `onBlockSearch` callback
- Render block results with type indicators + preview
- Insert RefNode with `blockId` on selection

### Phase 4: Auto-Insert BlockIdNode

- `generateBlockId()` utility function
- On block selection without alias:
  - Generate ID
  - Insert RefNode with new ID
  - Call `onBlockIdInsert` callback

## Mock Data for Ladle

```typescript
const mockHeadingSearch = async (objectId: string): Promise<HeadingSearchResult[]> => [
  { level: 1, text: 'Introduction' },
  { level: 2, text: 'Getting Started' },
  { level: 2, text: 'Configuration' },
  { level: 3, text: 'Advanced Options' },
];

const mockBlockSearch = async (objectId: string, query: string): Promise<BlockSearchResult[]> => [
  { ksuid: '2NxK7vPq...', preview: 'This is the opening paragraph...', blockType: 'paragraph' },
  { ksuid: '2NxK7vPr...', preview: 'Introduction', blockType: 'heading' },
  {
    ksuid: '2NxK7vPs...',
    alias: 'def',
    preview: 'A key definition worth noting...',
    blockType: 'paragraph',
  },
  { ksuid: '2NxK7vPt...', preview: 'A memorable quote', blockType: 'blockquote' },
];
```

## Files to Create/Modify

| File                              | Action                                         |
| --------------------------------- | ---------------------------------------------- |
| `RefNode.ts`                      | Modify — add headingText, blockId attrs        |
| `RefNodeView.tsx`                 | Modify — display suffixes                      |
| `RefSuggestion.ts`                | Modify — state machine for heading/block modes |
| `block-id-utils.ts`               | Create — generateBlockId utility               |
| `stories/Editor.refs.stories.tsx` | Modify — add heading/block ref stories         |

## Acceptance Criteria

- [ ] `[[Page#Heading]]` syntax works with heading autocomplete
- [ ] `[[Page#^id]]` syntax works with block autocomplete
- [ ] Headings show level indicators (H1, H2, etc.)
- [ ] Blocks show type indicators and text preview
- [ ] Selecting block without alias generates 6-char ID
- [ ] `onBlockIdInsert` called with correct params
- [ ] RefNode displays heading/block suffixes correctly
- [ ] Ladle stories demonstrate all flows
