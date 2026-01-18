---
paths: packages/storage/**/*.ts, packages/api/**/*.ts
---

# Block Patch Operation Rules

The `applyBlockPatch()` function is the core write pathway. All document mutations flow through this single transactional API.

## Operation Types

Four operations compose a patch:

```typescript
type BlockOp =
  | { op: 'block.insert'; blockId: string; parentBlockId: string | null; ... }
  | { op: 'block.update'; blockId: string; patch: { ... } }
  | { op: 'block.move'; blockId: string; newParentBlockId: string | null; ... }
  | { op: 'block.delete'; blockId: string; subtree?: true };
```

## Critical Invariants (Hard Rules)

These invariants must NEVER be violated. Any violation aborts the entire patch.

### 1. Tree Integrity

**Every non-root block must have a valid parent:**

```typescript
// INVARIANT: Parent must exist, not be deleted, and belong to same object
if (parentBlockId !== null) {
  const parent = await tx.query.blocks.findFirst({
    where: and(
      eq(blocks.id, parentBlockId),
      eq(blocks.objectId, objectId),
      isNull(blocks.deletedAt)
    ),
  });
  if (!parent) {
    throw new PatchError('INVARIANT_PARENT_DELETED');
  }
}
```

### 2. No Cycles

**A block cannot be moved under its own descendant:**

```typescript
// INVARIANT: Check for cycles before move
function wouldCreateCycle(blockId: string, newParentId: string | null): boolean {
  if (newParentId === null) return false;
  if (newParentId === blockId) return true;

  // Walk up from newParentId to root
  let current = newParentId;
  while (current !== null) {
    if (current === blockId) return true;
    current = getParentBlockId(current);
  }
  return false;
}

if (wouldCreateCycle(blockId, newParentBlockId)) {
  throw new PatchError('INVARIANT_CYCLE');
}
```

### 3. Same-Object Parenting

**Cross-object parenting is forbidden:**

```typescript
// INVARIANT: Block and parent must belong to same object
if (parent.objectId !== block.objectId) {
  throw new PatchError('INVARIANT_CROSS_OBJECT');
}
```

### 4. Unique Order Keys

**Sibling order keys must be unique:**

```typescript
// Order keys unique among siblings with same parent
// Backend MUST generate unique keys; collision = CONFLICT_ORDERING
```

## Transactional Requirements

### Single Transaction Per Patch

**Bad:** Multiple transactions

```typescript
// DON'T: Partial failure leaves inconsistent state
await db.insert(blocks).values(newBlock);
await db.update(refs).set(...);  // If this fails, we have orphaned block!
```

**Good:** All-or-nothing transaction

```typescript
// DO: Atomic patch application
await db.transaction(async (tx) => {
  // 1. Validate all ops
  for (const op of ops) {
    await validateOp(tx, op, objectId);
  }

  // 2. Apply all ops
  for (const op of ops) {
    await applyOp(tx, op, objectId);
  }

  // 3. Update derived data (refs, FTS)
  await updateRefs(tx, affectedBlockIds);
  await updateFTS(tx, affectedBlockIds);

  // 4. Increment doc version
  await tx
    .update(objects)
    .set({ docVersion: sql`doc_version + 1` })
    .where(eq(objects.id, objectId));
});
```

### Derived Data in Same Transaction

References and FTS updates MUST happen within the patch transaction:

```typescript
// REQUIRED: Update refs table within transaction
for (const blockId of affectedBlockIds) {
  const block = await tx.query.blocks.findFirst({ where: eq(blocks.id, blockId) });
  const refs = extractReferences(block.content);

  // Delete old refs for this block
  await tx.delete(refsTable).where(eq(refsTable.sourceBlockId, blockId));

  // Insert new refs
  if (refs.length > 0) {
    await tx.insert(refsTable).values(
      refs.map((ref) => ({
        sourceBlockId: blockId,
        sourceObjectId: objectId,
        targetObjectId: ref.targetObjectId,
        targetBlockId: ref.targetBlockId,
      }))
    );
  }
}
```

## Optimistic Concurrency

### Version Check Pattern

```typescript
// If baseDocVersion provided, validate it matches
if (input.baseDocVersion !== undefined) {
  const obj = await tx.query.objects.findFirst({
    where: eq(objects.id, objectId),
  });

  if (obj.docVersion !== input.baseDocVersion) {
    throw new PatchError('CONFLICT_VERSION', {
      expected: input.baseDocVersion,
      actual: obj.docVersion,
    });
  }
}
```

### Version Increment

```typescript
// ALWAYS increment version on successful patch
// newDocVersion = previousDocVersion + 1
```

## Idempotency

### Idempotency Key Handling

```typescript
// Check for replay
if (input.idempotencyKey) {
  const existing = await tx.query.idempotency.findFirst({
    where: and(eq(idempotency.objectId, objectId), eq(idempotency.key, input.idempotencyKey)),
  });

  if (existing) {
    // Return cached result without reapplying
    return JSON.parse(existing.resultJson);
  }
}

// ... apply patch ...

// Store result for idempotency
if (input.idempotencyKey) {
  await tx.insert(idempotency).values({
    objectId,
    key: input.idempotencyKey,
    resultJson: JSON.stringify(result),
    createdAt: new Date(),
  });
}
```

## Order Key Generation

### Fractional Indexing

Generate order keys between siblings:

```typescript
// Placement hints
type Place =
  | { where: 'start' }
  | { where: 'end' }
  | { where: 'before'; siblingBlockId: string }
  | { where: 'after'; siblingBlockId: string };

function generateOrderKey(siblings: Block[], place: Place): string {
  const sortedKeys = siblings.map((s) => s.orderKey).sort();

  switch (place.where) {
    case 'start':
      return generateKeyBefore(sortedKeys[0] ?? 'a');
    case 'end':
      return generateKeyAfter(sortedKeys[sortedKeys.length - 1] ?? 'a');
    case 'before': {
      const idx = siblings.findIndex((s) => s.id === place.siblingBlockId);
      const prev = sortedKeys[idx - 1];
      const curr = sortedKeys[idx];
      return generateKeyBetween(prev, curr);
    }
    case 'after': {
      const idx = siblings.findIndex((s) => s.id === place.siblingBlockId);
      const curr = sortedKeys[idx];
      const next = sortedKeys[idx + 1];
      return generateKeyBetween(curr, next);
    }
  }
}
```

### Key Length Growth

If keys become too long, schedule rebalancing:

```typescript
const MAX_KEY_LENGTH = 50;

if (newOrderKey.length > MAX_KEY_LENGTH) {
  // Option 1: Rebalance immediately within transaction
  await rebalanceSiblingKeys(tx, objectId, parentBlockId);

  // Option 2: Schedule async rebalance (simpler, but slight delay)
  await scheduleRebalance(objectId, parentBlockId);
}
```

## Soft Delete Semantics

### Cascade to Subtree

```typescript
// Soft delete includes all descendants
async function softDeleteSubtree(tx: Transaction, blockId: string): Promise<string[]> {
  const deletedIds: string[] = [];
  const now = new Date();

  async function deleteRecursive(id: string) {
    deletedIds.push(id);
    await tx.update(blocks).set({ deletedAt: now }).where(eq(blocks.id, id));

    const children = await tx.query.blocks.findMany({
      where: and(eq(blocks.parentBlockId, id), isNull(blocks.deletedAt)),
    });

    for (const child of children) {
      await deleteRecursive(child.id);
    }
  }

  await deleteRecursive(blockId);
  return deletedIds;
}
```

### Cleanup Derived Data

```typescript
// Remove refs and FTS entries for deleted blocks
await tx.delete(refs).where(inArray(refs.sourceBlockId, deletedIds));
await tx.delete(ftsBlocks).where(inArray(ftsBlocks.blockId, deletedIds));
```

## Validation Order

Apply validations in this order:

1. **Schema validation** (Zod) — malformed request
2. **Object existence** — NOT_FOUND_OBJECT
3. **Version check** (if baseDocVersion) — CONFLICT_VERSION
4. **Idempotency check** — return cached or continue
5. **Per-op validation:**
   - Block existence (for update/move/delete) — NOT_FOUND_BLOCK
   - Parent existence — INVARIANT_PARENT_DELETED
   - Cycle check (for move) — INVARIANT_CYCLE
   - Cross-object check — INVARIANT_CROSS_OBJECT
   - Content schema validation — VALIDATION
6. **Apply ops**
7. **Update derived data**
8. **Increment version**
9. **Store idempotency result**
