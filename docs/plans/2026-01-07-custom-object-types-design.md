# Custom Object Types with Inheritance — TDD Implementation Plan

**Date**: 2026-01-07
**Author**: Claude + Isaac
**Status**: Ready for Implementation

## Overview

Implement Capacities-style custom object types with two-level inheritance, enabling users to create types like `Book` that inherit properties from `Media`.

### Goals

- Full property inheritance (child gets parent properties + adds own)
- Built-in types can be parents (e.g., `Person` → `Employee`)
- Maximum 2 levels (parent → child only, no grandchildren)
- Block deletion if children exist
- Rich metadata: `color`, `description`, `pluralName`

### Non-Goals (Deferred)

- Calendar integration settings (Phase 2)
- Property override semantics (child can add, not redefine)
- Deep hierarchy (3+ levels)

---

## Architecture: Pragmatic Balance

### Schema Changes

```sql
-- 0004_add_object_type_inheritance.sql
ALTER TABLE `object_types` ADD COLUMN `parent_type_id` TEXT REFERENCES `object_types`(`id`);
ALTER TABLE `object_types` ADD COLUMN `plural_name` TEXT;
ALTER TABLE `object_types` ADD COLUMN `color` TEXT;
ALTER TABLE `object_types` ADD COLUMN `description` TEXT;

CREATE INDEX `object_types_parent_type_id_idx` ON `object_types` (`parent_type_id`);
```

### Resolution Strategy

Runtime resolution with in-memory cache:

- Cache built lazily on first `getResolvedSchema()` call
- Cache invalidated (set to `null`) on any type mutation
- Next read rebuilds entire cache from DB
- Max 2 levels = predictable performance (1-2 lookups)

---

## Test-Driven Implementation Sequence

### Phase 1: API Contracts (Tests First)

**File**: `packages/api/src/objectType.test.ts` (if exists) or inline validation tests

```typescript
// Test: ObjectTypeSchema accepts new fields
describe('ObjectTypeSchema', () => {
  it('should accept parentTypeId as nullable string', () => {
    const result = ObjectTypeSchema.safeParse({
      id: '01HZXTEST...',
      key: 'Book',
      name: 'Book',
      parentTypeId: '01HZXPARENT...', // NEW
      pluralName: 'Books', // NEW
      color: '#3B82F6', // NEW
      description: 'A book type', // NEW
      // ... other required fields
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid color format', () => {
    const result = ObjectTypeSchema.safeParse({
      // ... with color: 'not-a-hex'
    });
    expect(result.success).toBe(false);
  });
});

// Test: CreateObjectTypeInputSchema validates parentTypeId
describe('CreateObjectTypeInputSchema', () => {
  it('should accept parentTypeId', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'Book',
      name: 'Book',
      parentTypeId: '01HZXMEDIA...',
    });
    expect(result.success).toBe(true);
  });
});
```

**Implementation**: Update `packages/api/src/objectType.ts`

```typescript
// Add to ObjectTypeSchema (~line 91)
parentTypeId: z.string().length(26).nullable(),
pluralName: z.string().max(128).nullable(),
color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
description: z.string().max(1024).nullable(),

// Add error codes (~line 157)
'TYPE_INHERITANCE_CYCLE',
'TYPE_INHERITANCE_DEPTH',
'TYPE_HAS_CHILDREN',
```

---

### Phase 2: Database Schema (Tests First)

**File**: `packages/storage/src/schema.test.ts` (or migration test)

```typescript
describe('object_types schema', () => {
  it('should have parent_type_id column', async () => {
    const db = createTestDb();
    seedBuiltInTypes(db);

    // Insert type with parent
    const media = getObjectTypeByKey(db, 'Page')!;
    db.insert(objectTypes)
      .values({
        id: generateId(),
        key: 'CustomChild',
        name: 'Custom Child',
        parentTypeId: media.id, // Should work
        builtIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .run();

    const child = getObjectTypeByKey(db, 'CustomChild');
    expect(child?.parentTypeId).toBe(media.id);

    closeDb(db);
  });

  it('should have index on parent_type_id', async () => {
    // Verify index exists via PRAGMA index_list
  });
});
```

**Implementation**:

1. Update `packages/storage/src/schema.ts`
2. Create `packages/storage/drizzle/0004_add_object_type_inheritance.sql`

---

### Phase 3: Inheritance Validation (Tests First)

**File**: `packages/storage/src/objectTypeService.test.ts`

```typescript
describe('inheritance validation', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('createObjectType with parent', () => {
    it('should allow creating child of built-in type', () => {
      const person = getObjectTypeByKey(db, 'Person')!;

      const employee = createObjectType(db, {
        key: 'Employee',
        name: 'Employee',
        parentTypeId: person.id,
        schema: {
          properties: [{ key: 'department', name: 'Department', type: 'text', required: false }],
        },
      });

      expect(employee.parentTypeId).toBe(person.id);
    });

    it('should reject non-existent parent', () => {
      expect(() => {
        createObjectType(db, {
          key: 'Orphan',
          name: 'Orphan',
          parentTypeId: '01HZXNONEXISTENT000000000',
        });
      }).toThrow(ObjectTypeError);
      // Verify error code is TYPE_NOT_FOUND
    });

    it('should reject grandchild (max 2 levels)', () => {
      // Create parent
      const media = createObjectType(db, {
        key: 'Media',
        name: 'Media',
      });

      // Create child
      const book = createObjectType(db, {
        key: 'Book',
        name: 'Book',
        parentTypeId: media.id,
      });

      // Attempt grandchild - should fail
      expect(() => {
        createObjectType(db, {
          key: 'Ebook',
          name: 'Ebook',
          parentTypeId: book.id, // book already has parent
        });
      }).toThrow(ObjectTypeError);
      // Verify error code is TYPE_INHERITANCE_DEPTH
    });

    it('should reject self as parent', () => {
      const media = createObjectType(db, { key: 'Media', name: 'Media' });

      expect(() => {
        updateObjectType(db, media.id, { parentTypeId: media.id });
      }).toThrow(ObjectTypeError);
      // Verify error code is TYPE_INHERITANCE_CYCLE
    });
  });

  describe('deleteObjectType with children', () => {
    it('should reject deletion when children exist', () => {
      const parent = createObjectType(db, { key: 'Parent', name: 'Parent' });
      createObjectType(db, { key: 'Child', name: 'Child', parentTypeId: parent.id });

      expect(() => {
        deleteObjectType(db, parent.id);
      }).toThrow(ObjectTypeError);
      // Verify error code is TYPE_HAS_CHILDREN
    });

    it('should allow deletion after children removed', () => {
      const parent = createObjectType(db, { key: 'Parent', name: 'Parent' });
      const child = createObjectType(db, { key: 'Child', name: 'Child', parentTypeId: parent.id });

      deleteObjectType(db, child.id); // Remove child first
      deleteObjectType(db, parent.id); // Now parent can be deleted

      expect(getObjectType(db, parent.id)).toBeNull();
    });
  });
});
```

**Implementation**: Add `validateInheritance()` to `objectTypeService.ts`

---

### Phase 4: Schema Resolution (Tests First)

**File**: `packages/storage/src/objectTypeService.test.ts` (continued)

```typescript
describe('schema resolution', () => {
  it('should merge parent and child properties', () => {
    const parent = createObjectType(db, {
      key: 'Media',
      name: 'Media',
      schema: {
        properties: [
          { key: 'creator', name: 'Creator', type: 'text', required: false },
          { key: 'year', name: 'Year', type: 'number', required: false },
        ],
      },
    });

    const child = createObjectType(db, {
      key: 'Book',
      name: 'Book',
      parentTypeId: parent.id,
      schema: {
        properties: [
          { key: 'author', name: 'Author', type: 'text', required: true },
          { key: 'isbn', name: 'ISBN', type: 'text', required: false },
        ],
      },
    });

    const resolved = getResolvedSchema(db, child.id);

    // Should have all 4 properties
    expect(resolved.properties).toHaveLength(4);
    expect(resolved.properties.map((p) => p.key)).toEqual([
      'creator',
      'year', // From parent
      'author',
      'isbn', // From child
    ]);
    expect(resolved.inheritedFrom).toEqual(['Media']);
  });

  it('should return only child properties when no parent', () => {
    const standalone = createObjectType(db, {
      key: 'Standalone',
      name: 'Standalone',
      schema: {
        properties: [{ key: 'field1', name: 'Field 1', type: 'text', required: false }],
      },
    });

    const resolved = getResolvedSchema(db, standalone.id);

    expect(resolved.properties).toHaveLength(1);
    expect(resolved.inheritedFrom).toEqual([]);
  });

  it('should handle types with no schema', () => {
    const empty = createObjectType(db, {
      key: 'Empty',
      name: 'Empty',
      // No schema
    });

    const resolved = getResolvedSchema(db, empty.id);

    expect(resolved.properties).toEqual([]);
  });

  it('should cache resolved schemas', () => {
    const type = createObjectType(db, { key: 'Cached', name: 'Cached' });

    // First call builds cache
    const first = getResolvedSchema(db, type.id);
    // Second call should hit cache (we can't easily verify, but it shouldn't error)
    const second = getResolvedSchema(db, type.id);

    expect(first).toEqual(second);
  });

  it('should invalidate cache on type mutation', () => {
    const parent = createObjectType(db, {
      key: 'CacheParent',
      name: 'Cache Parent',
      schema: { properties: [{ key: 'old', name: 'Old', type: 'text', required: false }] },
    });

    const child = createObjectType(db, {
      key: 'CacheChild',
      name: 'Cache Child',
      parentTypeId: parent.id,
    });

    // Get initial resolved schema
    const before = getResolvedSchema(db, child.id);
    expect(before.properties.map((p) => p.key)).toContain('old');

    // Update parent schema
    updateObjectType(db, parent.id, {
      schema: { properties: [{ key: 'new', name: 'New', type: 'text', required: false }] },
    });

    // Cache should be invalidated, new resolution should have 'new' not 'old'
    const after = getResolvedSchema(db, child.id);
    expect(after.properties.map((p) => p.key)).toContain('new');
    expect(after.properties.map((p) => p.key)).not.toContain('old');
  });
});
```

**Implementation**: Add cache + `resolveTypeSchema()` + `getResolvedSchema()` to `objectTypeService.ts`

---

### Phase 5: Property Validation with Inheritance (Tests First)

**File**: `packages/storage/src/propertyValidation.test.ts`

```typescript
describe('validatePropertiesForType', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  it('should validate against inherited properties', () => {
    const parent = createObjectType(db, {
      key: 'MediaV',
      name: 'Media',
      schema: {
        properties: [{ key: 'creator', name: 'Creator', type: 'text', required: true }],
      },
    });

    const child = createObjectType(db, {
      key: 'BookV',
      name: 'Book',
      parentTypeId: parent.id,
      schema: {
        properties: [{ key: 'isbn', name: 'ISBN', type: 'text', required: false }],
      },
    });

    // Missing required inherited property
    const result = validatePropertiesForType(db, child.id, {
      isbn: '123-456',
      // Missing 'creator' from parent
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0]?.propertyKey).toBe('creator');
  });

  it('should pass when all inherited required properties present', () => {
    const parent = createObjectType(db, {
      key: 'MediaV2',
      name: 'Media',
      schema: {
        properties: [{ key: 'creator', name: 'Creator', type: 'text', required: true }],
      },
    });

    const child = createObjectType(db, {
      key: 'BookV2',
      name: 'Book',
      parentTypeId: parent.id,
    });

    const result = validatePropertiesForType(db, child.id, {
      creator: 'Author Name',
    });

    expect(result.valid).toBe(true);
  });
});
```

**Implementation**: Add `validatePropertiesForType()` to `propertyValidation.ts`

---

### Phase 6: Integration Tests (Tests First)

**File**: `packages/storage/src/objectService.test.ts`

```typescript
describe('object creation with inherited types', () => {
  it('should validate object properties against resolved schema', () => {
    const media = createObjectType(db, {
      key: 'MediaInt',
      name: 'Media',
      schema: {
        properties: [{ key: 'year', name: 'Year', type: 'number', required: true }],
      },
    });

    const book = createObjectType(db, {
      key: 'BookInt',
      name: 'Book',
      parentTypeId: media.id,
      schema: {
        properties: [{ key: 'pages', name: 'Pages', type: 'number', required: false }],
      },
    });

    // Should require 'year' from parent
    expect(() => {
      createObject(db, 'BookInt', 'My Book', { pages: 300 });
    }).toThrow(); // Missing 'year'

    // Should succeed with inherited property
    const obj = createObject(db, 'BookInt', 'My Book', {
      year: 2024,
      pages: 300,
    });
    expect(obj).toBeDefined();
  });
});
```

**Implementation**: Update `objectService.ts` to use `getResolvedSchema()`

---

## Implementation Checklist

### Day 1: Foundation

- [ ] Write API schema tests
- [ ] Implement API schema changes (`packages/api/src/objectType.ts`)
- [ ] Update Drizzle schema (`packages/storage/src/schema.ts`)
- [ ] Generate migration SQL
- [ ] Run `pnpm typecheck` — verify types compile

### Day 2: Service Layer

- [ ] Write inheritance validation tests
- [ ] Implement `validateInheritance()` helper
- [ ] Write schema resolution tests
- [ ] Implement cache infrastructure
- [ ] Implement `resolveTypeSchema()` and `getResolvedSchema()`
- [ ] Update CRUD functions with validation + cache invalidation
- [ ] Run tests — all should pass

### Day 3: Integration

- [ ] Write property validation tests with inheritance
- [ ] Implement `validatePropertiesForType()`
- [ ] Write object creation integration tests
- [ ] Update `objectService.ts` to use resolved schema
- [ ] Run full test suite

### Day 4: Polish

- [ ] Update built-in types with pluralName/color defaults
- [ ] Add CLI commands for testing inheritance
- [ ] Manual testing via CLI
- [ ] Run `pnpm typecheck && pnpm lint && pnpm test && pnpm build`

---

## File Change Summary

| File                                                            | Lines    | Type   |
| --------------------------------------------------------------- | -------- | ------ |
| `packages/api/src/objectType.ts`                                | ~30      | Modify |
| `packages/storage/src/schema.ts`                                | ~10      | Modify |
| `packages/storage/drizzle/0004_add_object_type_inheritance.sql` | ~10      | New    |
| `packages/storage/src/objectTypeService.ts`                     | ~200     | Modify |
| `packages/storage/src/propertyValidation.ts`                    | ~20      | Modify |
| `packages/storage/src/objectService.ts`                         | ~20      | Modify |
| `packages/storage/src/objectTypeService.test.ts`                | ~300     | Modify |
| `packages/storage/src/propertyValidation.test.ts`               | ~100     | Modify |
| **Total**                                                       | **~690** |        |

---

## Key Design Decisions

1. **Runtime resolution with cache** — Simple invalidation (clear all), no cascade updates
2. **Max 2 levels enforced at creation** — Prevents complexity, matches Capacities
3. **Child adds, doesn't override** — No property key conflicts allowed
4. **Calendar settings deferred** — Phase 2 after core inheritance works
5. **Built-in types can be parents** — Maximum flexibility for users

---

## Test Coverage Targets

- Inheritance validation: 5 tests
- Schema resolution: 5 tests
- Cache behavior: 2 tests
- Property validation: 3 tests
- Integration: 2 tests
- **Total: ~17 new tests**

---

## Related Files to Read Before Implementation

1. `packages/api/src/objectType.ts` — Current API contracts
2. `packages/storage/src/objectTypeService.ts` — Service to modify
3. `packages/storage/src/propertyValidation.ts` — Validation to extend
4. `packages/storage/src/tagService.ts` — Reference for patterns (color, metadata)
5. `packages/storage/drizzle/0003_add_tags.sql` — Migration pattern reference
