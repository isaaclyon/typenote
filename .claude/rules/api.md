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
export const ApplyBlockPatchInputSchema = z.object({
  apiVersion: z.literal('v1'),
  objectId: z.string().length(26), // ULID
  baseDocVersion: z.number().int().nonnegative().optional(),
  idempotencyKey: z.string().optional(),
  ops: z.array(BlockOpSchema),
  client: z
    .object({
      actorId: z.string().optional(),
      deviceId: z.string().optional(),
      appVersion: z.string().optional(),
      ts: z.string().datetime().optional(),
    })
    .optional(),
});

export type ApplyBlockPatchInput = z.infer<typeof ApplyBlockPatchInputSchema>;
```

## Complete Error Taxonomy

All errors use this canonical structure:

```typescript
export const ApiErrorCodeSchema = z.enum([
  'NOT_FOUND_OBJECT', // Object does not exist
  'NOT_FOUND_BLOCK', // Block does not exist
  'VALIDATION', // Schema/content invalid
  'CONFLICT_VERSION', // baseDocVersion mismatch
  'CONFLICT_ORDERING', // Order key collision (rare)
  'INVARIANT_CYCLE', // Move would create cycle
  'INVARIANT_CROSS_OBJECT', // Parent in different object
  'INVARIANT_PARENT_DELETED', // Parent block is deleted
  'IDEMPOTENCY_CONFLICT', // Idempotency key reused with different ops
  'INTERNAL', // Unexpected server error
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  apiVersion: z.literal('v1'),
  code: ApiErrorCodeSchema,
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
```

### Error Code Usage Guide

| Code                       | When to Use                                  | Example Details                                         |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `NOT_FOUND_OBJECT`         | Object ID doesn't exist                      | `{ objectId: '01HZX...' }`                              |
| `NOT_FOUND_BLOCK`          | Block ID doesn't exist or is deleted         | `{ blockId: '01HZY...' }`                               |
| `VALIDATION`               | Malformed request, invalid content schema    | `{ field: 'content', reason: 'Invalid heading level' }` |
| `CONFLICT_VERSION`         | `baseDocVersion` doesn't match current       | `{ expected: 5, actual: 7 }`                            |
| `CONFLICT_ORDERING`        | Order key collision (backend should resolve) | `{ orderKey: 'aaa', siblings: [...] }`                  |
| `INVARIANT_CYCLE`          | Move would create parent-child cycle         | `{ blockId: '...', wouldBeUnder: '...' }`               |
| `INVARIANT_CROSS_OBJECT`   | Parent block in different object             | `{ blockObjectId: '...', parentObjectId: '...' }`       |
| `INVARIANT_PARENT_DELETED` | Parent block is soft-deleted                 | `{ parentBlockId: '...' }`                              |
| `IDEMPOTENCY_CONFLICT`     | Same key, different operations               | `{ idempotencyKey: '...' }`                             |
| `INTERNAL`                 | Unexpected error (log details server-side)   | `{ requestId: '...' }`                                  |

### Creating Errors

```typescript
// Error factory functions
export function notFoundObject(objectId: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'NOT_FOUND_OBJECT',
    message: `Object not found: ${objectId}`,
    details: { objectId },
  };
}

export function validationError(field: string, reason: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'VALIDATION',
    message: `Validation failed: ${reason}`,
    details: { field, reason },
  };
}

export function versionConflict(expected: number, actual: number): ApiError {
  return {
    apiVersion: 'v1',
    code: 'CONFLICT_VERSION',
    message: `Version conflict: expected ${expected}, got ${actual}`,
    details: { expected, actual },
  };
}

export function cycleError(blockId: string, wouldBeUnder: string): ApiError {
  return {
    apiVersion: 'v1',
    code: 'INVARIANT_CYCLE',
    message: 'Move would create a cycle in the block tree',
    details: { blockId, wouldBeUnder },
  };
}
```

## Request/Response Envelopes

### Patch Response

```typescript
export const ApplyBlockPatchResultSchema = z.object({
  apiVersion: z.literal('v1'),
  objectId: z.string(),
  previousDocVersion: z.number(),
  newDocVersion: z.number(),
  applied: z.object({
    insertedBlockIds: z.array(z.string()),
    updatedBlockIds: z.array(z.string()),
    movedBlockIds: z.array(z.string()),
    deletedBlockIds: z.array(z.string()),
  }),
  warnings: z
    .array(
      z.object({
        code: z.string(),
        message: z.string(),
        details: z.unknown().optional(),
      })
    )
    .optional(),
});

export type ApplyBlockPatchResult = z.infer<typeof ApplyBlockPatchResultSchema>;
```

### Generic Response Wrapper (for IPC)

```typescript
// For IPC responses, wrap in success/error envelope
export const IpcResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: ApiErrorSchema,
    }),
  ]);
```

## Operation Schemas

```typescript
export const InsertBlockOpSchema = z.object({
  op: z.literal('block.insert'),
  blockId: z.string().length(26),
  parentBlockId: z.string().length(26).nullable(),
  orderKey: z.string().optional(),
  place: z
    .discriminatedUnion('where', [
      z.object({ where: z.literal('start') }),
      z.object({ where: z.literal('end') }),
      z.object({ where: z.literal('before'), siblingBlockId: z.string() }),
      z.object({ where: z.literal('after'), siblingBlockId: z.string() }),
    ])
    .optional(),
  blockType: z.string(),
  content: z.unknown(),
  meta: z.object({ collapsed: z.boolean().optional() }).optional(),
});

export const UpdateBlockOpSchema = z.object({
  op: z.literal('block.update'),
  blockId: z.string().length(26),
  patch: z.object({
    blockType: z.string().optional(),
    content: z.unknown().optional(),
    meta: z.object({ collapsed: z.boolean().optional() }).optional(),
  }),
});

export const MoveBlockOpSchema = z.object({
  op: z.literal('block.move'),
  blockId: z.string().length(26),
  newParentBlockId: z.string().length(26).nullable(),
  orderKey: z.string().optional(),
  place: z
    .discriminatedUnion('where', [
      z.object({ where: z.literal('start') }),
      z.object({ where: z.literal('end') }),
      z.object({ where: z.literal('before'), siblingBlockId: z.string() }),
      z.object({ where: z.literal('after'), siblingBlockId: z.string() }),
    ])
    .optional(),
  subtree: z.literal(true).optional(),
});

export const DeleteBlockOpSchema = z.object({
  op: z.literal('block.delete'),
  blockId: z.string().length(26),
  subtree: z.literal(true).optional(),
});

export const BlockOpSchema = z.discriminatedUnion('op', [
  InsertBlockOpSchema,
  UpdateBlockOpSchema,
  MoveBlockOpSchema,
  DeleteBlockOpSchema,
]);

export type BlockOp = z.infer<typeof BlockOpSchema>;
```

## No External Dependencies

The API package should only depend on:

- `zod` (validation)
- TypeScript built-ins

**Bad:** Importing Node or Electron modules

```typescript
// DON'T: Node dependency in API package
import { readFile } from 'fs';
import { app } from 'electron';
```

## Schema Naming Conventions

Follow these conventions for consistency:

| Type           | Naming Pattern                  | Example                                 |
| -------------- | ------------------------------- | --------------------------------------- |
| Input schemas  | `{Operation}InputSchema`        | `ApplyBlockPatchInputSchema`            |
| Result schemas | `{Operation}ResultSchema`       | `ApplyBlockPatchResultSchema`           |
| Entity schemas | `{Entity}Schema`                | `BlockSchema`, `ObjectSchema`           |
| Enum schemas   | `{Name}Schema`                  | `ApiErrorCodeSchema`, `BlockTypeSchema` |
| Inferred types | Same as schema without `Schema` | `ApplyBlockPatchInput`                  |
