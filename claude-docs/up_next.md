# Up Next

## Workstream: Phase 5 — Object Types + Daily Notes

Status: **Ready to Start**

**Goal:** Make types and Daily Notes first-class at the backend.

### Tasks

- [ ] Implement `ObjectTypeService` (create/list/update/delete)
- [ ] Implement property validation per type schema
- [ ] Implement DailyNote API (`getOrCreateTodayDailyNote()`, `getOrCreateDailyNoteByDate()`, `listDailyNotes()`)
- [ ] Enforce uniqueness constraint on `DailyNote.date_key`
- [ ] Implement slug mapping for DailyNotes
- [ ] Add tests for object types and daily notes

### Exit Criteria

- DailyNotes created on access
- Type validation enforced
- Built-in types seeded (DailyNote, Page, Person, Event, Place)

---

## Backlog

- [ ] Phase 6: Export/Import
- [ ] Phase 7: Wire Desktop Shell
