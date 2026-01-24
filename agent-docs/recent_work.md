# Recent Work

## Latest Session (2026-01-24 - Commit & cleanup)

### What was accomplished

- **Committed pending work** — Organized and committed ~2,150 lines of uncommitted changes
- **Test fixes** — Fixed timezone flakes in dailyNote/calendar tests (UTC vs local time)
- **TypeScript fixes** — Fixed `exactOptionalPropertyTypes` issues in storage tests and routes
- **4 atomic commits** created covering: settings REST, test fixes, renderer hooks, docs

### Commits

- `f85eab1` feat(rest): add settings REST coverage
- `9e7ffd4` fix: resolve timezone flakes and typecheck issues
- `457cb46` refactor(renderer): modularize document hooks
- `f58e2dd` docs: update REST API coverage tracking

---

## Earlier Session (2026-01-23 - Document autosave robustness)

- Block patch ops — emit `block.move` on reorders, skip no-op updates
- Conflict handling — retry on `CONFLICT_VERSION`, update query cache
- Ref resolver caching — use TanStack Query cached objects for ref resolution
- Commits: uncommitted → now in `457cb46`

---

## Earlier Session (2026-01-24 - REST API Coverage Audit)

- Settings (5/5) — complete
- Pinned/Templates/Attachments — contracts + storage complete, routes added
- Commits: `afeea5d` feat(rest): finish pinned/templates/attachments coverage

---

## Historical — Collapsed

Editor wiring to NotesView (2026-01-23). REST API object types (2026-01-24). Export/attachments/calendar coverage (2026-01-24). AppShell renderer wiring (2026-01-23). PropertyList + ObjectDataGrid (2026-01-21).
