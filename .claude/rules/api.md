---
paths: packages/api/**/*.ts
---

# API Package Rules

The `@typenote/api` package defines all contracts between layers. It must remain pure and transport-agnostic.

## Required Patterns

### Zod Schemas for All Types

**Bad:** Plain TypeScript interfaces without runtime validation

```typescript
// DON'T: No runtime validation
export interface BlockPatchRequest {
  objectId: string;
  operations: Operation[];
}
```

**Good:** Zod schema with inferred type

```typescript
// DO: Schema + inferred type
export const BlockPatchRequestSchema = z.object({
  objectId: z.string().ulid(),
  baseDocVersion: z.number().int().nonnegative(),
  operations: z.array(OperationSchema),
});

export type BlockPatchRequest = z.infer<typeof BlockPatchRequestSchema>;
```

### Error Taxonomy

**Bad:** Generic error types

```typescript
// DON'T: Vague errors
throw new Error('Something went wrong');
```

**Good:** Typed error codes with structured data

```typescript
// DO: Structured error taxonomy
export const ApiErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VERSION_CONFLICT: 'VERSION_CONFLICT',
  TREE_INTEGRITY_ERROR: 'TREE_INTEGRITY_ERROR',
} as const;

export interface ApiError {
  code: keyof typeof ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}
```

### No External Dependencies

The API package should only depend on:

- `zod` (validation)
- TypeScript built-ins

**Bad:** Importing Node or Electron modules

```typescript
// DON'T: Node dependency in API package
import { readFile } from 'fs';
```

## Request/Response Envelope Pattern

All API operations should use consistent envelopes:

```typescript
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ApiErrorSchema,
});
```
