# Example Feature

## Overview

Brief description of the feature. What problem does it solve? Who is it for?

## User Stories

### Story 1: [Title]

- As a [user type]
- I want to [action]
- So that [benefit]

**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Technical Notes:**

- Affected packages: packages/core, apps/desktop
- Database migrations: Yes/No
- UI components: Yes/No (if Yes, remember Ladle-first workflow)

### Story 2: [Title]

- As a [user type]
- I want to [action]
- So that [benefit]

**Acceptance Criteria:**

- [ ] Criterion 1
- [ ] Criterion 2

**Technical Notes:**

- Affected packages: [list]
- Database migrations: No
- UI components: No

## Out of Scope

- Feature X (will be addressed in future iteration)
- Edge case Y (not critical for MVP)

## Technical Considerations

### Package Boundaries

Remember TypeNote's strict architecture:

- `packages/api` → No internal imports
- `packages/core` → Imports api only
- `packages/storage` → Imports api, core
- `apps/desktop` → Imports all packages

### Quality Gates

Before each commit:

1. `pnpm typecheck` must pass
2. `pnpm test` must pass

---

**To convert this PRD to ralph's JSON format:**

1. Start a Claude Code session
2. Use the `/ralph` skill
3. Point it to this PRD file
