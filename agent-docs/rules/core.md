---
paths: packages/core/**/*.ts
---

# Core Package Rules

The `@typenote/core` package contains pure TypeScript domain logic. It must have no side effects and no external I/O.

## Required Patterns

### Pure Functions

**Bad:** Functions with side effects

```typescript
// DON'T: Side effects in core
export function createBlock(content: string): Block {
  console.log('Creating block'); // Side effect!
  return { id: generateId(), content };
}
```

**Good:** Pure transformation functions

```typescript
// DO: Pure function
export function createBlock(id: string, content: string): Block {
  return { id, content };
}
```

### ULID Generation

Use the `ulid` package for all ID generation:

```typescript
import { ulid } from 'ulid';

export function generateId(): string {
  return ulid();
}

export function isValidUlid(id: string): boolean {
  return /^[0-9A-HJKMNP-TV-Z]{26}$/.test(id);
}
```

### Content Schema Types

Content schemas are **defined in `@typenote/api`** and **re-exported from core**. This follows the architecture: api is the foundation, core imports from api.

```typescript
// Core re-exports schemas from api (packages/core/src/index.ts)
export {
  InlineNodeSchema,
  BlockTypeSchema,
  ParagraphContentSchema,
  HeadingContentSchema,
  // ... other content schemas
  getContentSchemaForBlockType,
} from '@typenote/api';
```

**Do NOT redefine schemas in core** — import them from api instead.

The actual schema uses `'t'` as the discriminant (not `'type'`):

```typescript
// Inline nodes use 't' discriminant (from @typenote/api)
type InlineNode =
  | { t: 'text'; text: string; marks?: Mark[] }
  | { t: 'hard_break' }
  | { t: 'link'; href: string; children: InlineNode[] }
  | { t: 'ref'; mode: 'link' | 'embed'; target: RefTarget; alias?: string }
  | { t: 'tag'; value: string }
  | { t: 'math_inline'; latex: string }
  | { t: 'footnote_ref'; key: string };
```

### No Database or Filesystem

**Bad:** Importing storage or Node modules

```typescript
// DON'T: Database access in core
import { db } from '@typenote/storage';
import { readFile } from 'fs';
```

**Good:** Accept data as parameters, return transformed data

```typescript
// DO: Pure transformation
export function extractReferences(content: InlineNode[]): Reference[] {
  return content
    .filter((node): node is ObjectRefNode => node.type === 'objectRef')
    .map((node) => ({ targetId: node.objectId }));
}
```

## Validation Functions

Validation approaches depend on the use case:

### Simple Checks: Return Boolean

```typescript
// For simple validity checks, return boolean
export function isValidUlid(id: string): boolean {
  return ULID_REGEX.test(id);
}
```

### Parsing: Throw on Invalid Input

```typescript
// For parsing that extracts data, throw with descriptive message
export function parseUlid(id: string): { timestamp: Date } {
  if (!isValidUlid(id)) {
    throw new Error(`Invalid ULID: ${id}`);
  }
  return { timestamp: new Date(decodeTime(id)) };
}
```

### Complex Validation: Return Structured Results

For complex validation (like patch operations), use structured results:

```typescript
export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; errors: ValidationError[] };

export function validatePatchOps(ops: unknown): ValidationResult<Operation[]> {
  const result = OperationsSchema.safeParse(ops);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, errors: formatZodErrors(result.error) };
}
```

## Immutability Patterns

Core functions should be **immutable** and use **referential equality optimization**:

```typescript
// Return same reference when nothing changed (important for React)
function processInlineNodes(nodes: InlineNode[]): InlineNode[] {
  let changed = false;
  const result = nodes.map((node) => {
    const processed = processNode(node);
    if (processed !== node) changed = true;
    return processed;
  });
  return changed ? result : nodes; // Return original if unchanged
}
```

This pattern:

- Prevents unnecessary React re-renders
- Reduces memory allocation
- Enables shallow equality checks (`===`)
