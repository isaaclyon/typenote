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

NotateDoc v1 content schema should be defined with discriminated unions:

```typescript
// Block types as discriminated union
export type Block =
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'heading'; level: 1 | 2 | 3; content: InlineNode[] }
  | { type: 'bulletList'; items: Block[] }
  | { type: 'codeBlock'; language: string; code: string };

// Inline nodes as discriminated union
export type InlineNode =
  | { type: 'text'; text: string; marks?: Mark[] }
  | { type: 'objectRef'; objectId: string }
  | { type: 'blockRef'; objectId: string; blockId: string };
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

Validation functions should return structured results, not throw:

```typescript
export interface ValidationResult<T> {
  valid: true;
  data: T;
} | {
  valid: false;
  errors: ValidationError[];
}

export function validatePatchOps(ops: unknown): ValidationResult<Operation[]> {
  const result = OperationsSchema.safeParse(ops);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  return { valid: false, errors: formatZodErrors(result.error) };
}
```
