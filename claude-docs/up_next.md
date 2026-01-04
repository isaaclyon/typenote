# Up Next

## Workstream: Phase 1 — Core Contracts

Status: **Ready to Start**

**Goal:** Establish canonical types/schemas used everywhere.

### Tasks

- [ ] Implement `core/ids` (ULID generation + parsing)
- [ ] Implement `api/errors` and shared `ApiError` shape
- [ ] Implement `api/blockPatch` request/response types + Zod validators
- [ ] Implement `core/notateDoc` (InlineNode, BlockType content schemas)
- [ ] Write unit tests for validation (valid/invalid patches)

### Exit Criteria

- Patch validator passes fixture tests
- Content schema types compile

---

## Backlog

- [ ] Phase 2: Storage Schema + Migrations
- [ ] Phase 3: applyBlockPatch() implementation
- [ ] Phase 4: Indexing Side Effects (refs + FTS)
- [ ] Phase 5: Object Types + Daily Notes
- [ ] Phase 6: Export/Import
- [ ] Phase 7: Wire Desktop Shell
