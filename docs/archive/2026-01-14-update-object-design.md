# updateObject() Service Design

**Date:** 2026-01-14
**Status:** Approved

## Overview

Implement the missing `updateObject()` CRUD operation to allow modifying object metadata (title, properties) and changing object types with Capacities-style property migration.

## Scope

### Supported Operations

1. **Title update** — Change an object's display name
2. **Properties update** — Modify any property value (partial updates)
3. **Type change** — Change the object's type with property migration:
   - **Auto-mapping:** Properties with same key name transfer automatically
   - **Explicit mapping:** Caller specifies `{ oldKey: newKey }` for cross-name mapping
   - **Type-compatible:** Only same-type mappings work (text→text, date→date, etc.)
   - **Fallout:** Unmapped properties are discarded (returned in response)

### Not Supported (v1)

- Changing the object ID (immutable primary key)
- Undoing deletes (separate `restoreObject()` exists)
- Bulk updates (iterate single calls)

## API Contract

### Request Schema

```typescript
// packages/api/src/object.ts

export const UpdateObjectRequestSchema = z.object({
  objectId: z.string().length(26), // ULID

  /** Optional optimistic concurrency check */
  baseDocVersion: z.number().int().nonnegative().optional(),

  /** Partial updates - only provided fields are changed */
  patch: z.object({
    title: z.string().min(1).optional(),
    typeKey: z.string().optional(), // Change object type
    properties: z.record(z.unknown()).optional(), // Partial property updates
  }),

  /**
   * Property mapping for type changes.
   * Maps old property keys to new property keys.
   * Example: { "email": "contact_email" }
   */
  propertyMapping: z.record(z.string()).optional(),
});

export type UpdateObjectRequest = z.infer<typeof UpdateObjectRequestSchema>;
```

### Response Schema

```typescript
export const UpdateObjectResponseSchema = z.object({
  object: z.object({
    id: z.string().length(26),
    typeId: z.string().length(26),
    typeKey: z.string(),
    title: z.string(),
    properties: z.record(z.unknown()),
    docVersion: z.number().int().nonnegative(),
    updatedAt: z.string().datetime(),
  }),
  /** Properties that were dropped during type change (informational) */
  droppedProperties: z.array(z.string()).optional(),
});

export type UpdateObjectResponse = z.infer<typeof UpdateObjectResponseSchema>;
```

### Error Codes

| Code                     | When                                          |
| ------------------------ | --------------------------------------------- |
| `NOT_FOUND_OBJECT`       | Object doesn't exist or is soft-deleted       |
| `TYPE_NOT_FOUND`         | New typeKey doesn't exist                     |
| `VALIDATION`             | Property validation failed against new schema |
| `CONFLICT_VERSION`       | baseDocVersion doesn't match current          |
| `PROPERTY_TYPE_MISMATCH` | Mapping between incompatible property types   |

## Service Implementation

### Function Signature

```typescript
// packages/storage/src/objectService.ts

export type UpdateObjectErrorCode =
  | 'NOT_FOUND'
  | 'TYPE_NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'CONFLICT_VERSION'
  | 'PROPERTY_TYPE_MISMATCH';

export const UpdateObjectError = createServiceError<UpdateObjectErrorCode>('UpdateObjectError');

export interface UpdateObjectOptions {
  objectId: string;
  baseDocVersion?: number;
  patch: {
    title?: string;
    typeKey?: string;
    properties?: Record<string, unknown>;
  };
  propertyMapping?: Record<string, string>;
}

export interface UpdateObjectResult {
  id: string;
  typeId: string;
  typeKey: string;
  title: string;
  properties: Record<string, unknown>;
  docVersion: number;
  updatedAt: Date;
  droppedProperties?: string[];
}

export function updateObject(db: TypenoteDb, options: UpdateObjectOptions): UpdateObjectResult;
```

### Implementation Flow

1. **Fetch existing object** → NOT_FOUND if missing or soft-deleted
2. **Version check** (if baseDocVersion provided) → CONFLICT_VERSION if mismatch
3. **Resolve type** (if typeKey changing):
   - TYPE_NOT_FOUND if new type doesn't exist
   - Migrate properties using algorithm below
4. **Merge property updates** → `{ ...existing, ...patch.properties }`
5. **Validate final properties** against (new) type schema → VALIDATION_FAILED if invalid
6. **Update database row** → title, typeId, properties, updatedAt, docVersion+1
7. **Return updated object** + droppedProperties

### Property Migration Algorithm

When changing types:

1. Start with empty result properties
2. For each property in the **new** type's schema:
   - Check if `propertyMapping[oldKey] === newKey` (explicit mapping)
   - Else check if old properties has same key name (auto-mapping)
   - Verify type compatibility (text→text ✓, text→number ✗)
   - Copy value if compatible
3. Track which old properties weren't migrated → `droppedProperties`

Compatible type mappings:

- `text` ↔ `text`, `richtext`
- `number` ↔ `number`
- `boolean` ↔ `boolean`
- `date` ↔ `date`, `datetime`
- `datetime` ↔ `date`, `datetime`
- `select` ↔ `select` (options may differ)
- `multiselect` ↔ `multiselect`
- `ref` ↔ `ref`
- `refs` ↔ `refs`

## IPC Integration

### Handler

```typescript
// apps/desktop/src/main/ipc.ts

updateObject: (request: UpdateObjectRequest): UpdateObjectResponse => {
  const parsed = UpdateObjectRequestSchema.parse(request);

  const result = updateObject(db, {
    objectId: parsed.objectId,
    baseDocVersion: parsed.baseDocVersion,
    patch: parsed.patch,
    propertyMapping: parsed.propertyMapping,
  });

  return {
    object: {
      ...result,
      updatedAt: result.updatedAt.toISOString(),
    },
    droppedProperties: result.droppedProperties,
  };
};
```

### Preload

```typescript
// apps/desktop/src/preload/api.ts

updateObject: (request: UpdateObjectRequest) =>
  ipcRenderer.invoke('typenote:updateObject', request),
```

## Test Plan

| Category                       | Test Cases                                                  |
| ------------------------------ | ----------------------------------------------------------- |
| Happy path                     | Update title only, update properties only, update both      |
| Type change - auto mapping     | Same-named properties transfer, different types don't       |
| Type change - explicit mapping | `{ oldKey: newKey }` works for compatible types             |
| Type change - fallout          | Unmapped properties appear in `droppedProperties`           |
| Validation                     | Required property missing → error, wrong type → error       |
| Concurrency                    | baseDocVersion match → success, mismatch → CONFLICT_VERSION |
| Error cases                    | Object not found, type not found, property type mismatch    |
| Edge cases                     | Empty patch (no-op), null properties, soft-deleted object   |

## Files to Create/Modify

| File                                         | Action                           |
| -------------------------------------------- | -------------------------------- |
| `packages/api/src/object.ts`                 | Add UpdateObject schemas + types |
| `packages/storage/src/objectService.ts`      | Add `updateObject()` function    |
| `packages/storage/src/objectService.test.ts` | Add ~20 test cases               |
| `apps/desktop/src/main/ipc.ts`               | Add handler                      |
| `apps/desktop/src/preload/api.ts`            | Add preload binding              |

## Design Decisions

1. **Optional docVersion** — Matches existing block patch pattern for consistency
2. **Version bump on metadata changes** — Simple, consistent behavior
3. **Partial updates** — Only send what you're changing to prevent data loss
4. **droppedProperties in response** — UI can warn users before committing type changes
5. **Capacities-style migration** — Auto-map by name, explicit override, graceful fallout
