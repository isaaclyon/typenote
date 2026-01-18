# Claude Docs Guide

How to use and maintain the files in this folder.

## Files Overview

| File                 | Purpose                          | Update Frequency      |
| -------------------- | -------------------------------- | --------------------- |
| `current_project.md` | Project overview & architecture  | When milestones shift |
| `recent_work.md`     | Session history & completed work | End of each session   |
| `up_next.md`         | Active workstreams & tasks       | Start/end of sessions |

---

## `current_project.md`

**Purpose:** High-level project context for Claude to understand what we're building.

**Contains:**

- What the app is
- Tech stack
- Architecture decisions
- Phase progress table
- Quick commands

**Maintenance:**

- Update phase table when phases complete or are added
- Keep architecture decisions current
- Delete outdated sections (don't let it grow unbounded)
- Target length: ~100 lines max

---

## `recent_work.md`

**Purpose:** Session log so Claude can resume context quickly.

**Contains:**

- Latest session summary (commits, what was done)
- Previous session summaries (brief)

**Maintenance:**

- Add new session at top when starting significant work
- Keep only 3-4 recent sessions detailed
- Collapse older sessions to one-liners or delete
- Target length: ~100 lines max

---

## `up_next.md`

**Purpose:** Active task tracking across multiple workstreams.

**Structure:**

```markdown
# Up Next

## Workstream 1: [Name]

Status: Active | Paused | Blocked

### Tasks

- [ ] Task 1
- [ ] Task 2
- [x] Completed task (delete after session ends)

---

## Workstream 2: [Name]

Status: Blocked (waiting on X)

### Tasks

- [ ] Task 1
```

**Maintenance:**

- **Start of session:** Read file, pick workstream, mark tasks in progress
- **End of session:** Delete completed tasks, update status
- **Blocked workstreams:** Note what they're waiting on
- **Stale workstreams:** Delete if inactive for 3+ sessions
- Target: 2-4 active workstreams max

---

## General Rules

1. **Be concise** — These files are context for Claude, not documentation for humans
2. **Delete aggressively** — Old info causes confusion; remove when no longer relevant
3. **No duplication** — If it's in one file, don't repeat in another
4. **Timestamps optional** — Use dates only when they add clarity (session headers)

---

## When to Update

| Event                 | Update                                          |
| --------------------- | ----------------------------------------------- |
| Starting a session    | Read `up_next.md`, pick tasks                   |
| Completing a task     | Check off in `up_next.md`                       |
| Finishing a session   | Update `recent_work.md`, clean `up_next.md`     |
| Completing a phase    | Update `current_project.md` phase table         |
| Architecture decision | Add to `current_project.md`                     |
| New workstream        | Add section to `up_next.md`                     |
| Workstream complete   | Delete from `up_next.md`, note in `recent_work` |
