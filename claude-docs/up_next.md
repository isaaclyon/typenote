# Up Next

## Workstream: Phase 3 — applyBlockPatch() Implementation

Status: **Ready to Start**

**Goal:** Implement the core write pathway per the patch spec.

### Tasks

- [ ] Implement `getDocument(objectId)` returning ordered tree
- [ ] Implement order-key generation between siblings (fractional indexing)
- [ ] Implement insert/update/move/delete ops
- [ ] Implement cycle detection for move
- [ ] Implement idempotency table behavior
- [ ] Add application-level enforcement for root block order key uniqueness (SQLite NULL limitation)
- [ ] Add integration tests for all patch scenarios

### Exit Criteria

- 95%+ of patch spec behaviors covered by tests
- Patch service stable across restarts

---

## Backlog

- [ ] Phase 4: Indexing Side Effects (refs + FTS)
- [ ] Phase 5: Object Types + Daily Notes
- [ ] Phase 6: Export/Import
- [ ] Phase 7: Wire Desktop Shell
