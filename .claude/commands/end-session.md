# End Session Documentation Update

Review and update the `claude-docs/` files to capture this session's work and prepare context for future sessions.

## Critical: Parallel Agent Safety

Before modifying any documentation, check for concurrent work that should be preserved:

### Detection Signals

Run these checks to identify in-flight work:

```bash
# Check for uncommitted changes (other agents may have work in progress)
git status --porcelain

# Check for other branches with recent commits (parallel workstreams)
git branch -v --sort=-committerdate | head -10

# Check for stash entries (paused work)
git stash list
```

### Safety Rules

1. **Never delete workstreams marked "Active" or "In Progress"** unless YOU completed them this session
2. **Never remove unchecked tasks** from `up_next.md` that you didn't work on
3. **Preserve completed checkmarks** `[x]` — another agent may have added them
4. **When uncertain, append rather than replace** — redundancy is safer than lost context

---

## Step 1: Read Current State

Read all claude-docs files to understand current context:

- `claude-docs/recent_work.md`
- `claude-docs/up_next.md`
- `claude-docs/current_project.md`

---

## Step 2: Summarize This Session

Create a session summary for `recent_work.md` with:

### Required Elements

- **Session header**: `## Latest Session (YYYY-MM-DD description)`
- **What was accomplished**: Brief description of completed work
- **Files changed**: Key new/modified files (if significant)
- **Commits made**: List commit hashes and messages from this session

### Format Example

```markdown
## Latest Session (2025-12-28 evening)

### [Feature/Fix/Refactor Name]

Brief description of what was done.

**Key changes:**

- `path/to/file.ts` — What changed
- `path/to/other.ts` — What changed

Commits:

- `abc1234 feat: description`
- `def5678 fix: description`
```

---

## Step 3: Update up_next.md

### Tasks YOU Completed

- Check off tasks `[x]` that you completed
- If a workstream is fully complete, mark it with `✅ COMPLETE` and add completion date
- Delete completed tasks ONLY if the workstream is complete AND no parallel work is ongoing

### New Tasks Discovered

- Add new tasks discovered during this session to appropriate workstreams
- Create new workstreams if needed (with `Status: Active`)
- Add any blockers discovered

### Workstream Status Updates

- Update status labels: `Active`, `Paused`, `Blocked (reason)`, `Complete`
- Add notes about what's blocking if relevant

---

## Step 4: Update current_project.md (If Needed)

Only update if:

- A major phase/milestone was completed
- Architecture decisions were made
- Project status fundamentally changed

Keep this file stable — it's project-level context, not session-level.

---

## Step 5: Compact Old Content (Carefully)

### In recent_work.md

- **Keep**: Last 3-4 detailed sessions
- **Collapse**: Older sessions to one-liners in "Completed Milestones" table
- **Delete**: Sessions older than ~2 weeks with no ongoing relevance

### In up_next.md

- **Keep**: All active/paused workstreams
- **Delete**: Completed workstreams ONLY if work is merged and documented elsewhere
- **Collapse**: Long completed task lists into summary

### Parallel Agent Check Before Deletion

Before deleting ANY content, verify:

```bash
# Are there uncommitted changes that might reference this content?
git diff --name-only

# Are there other recent commits from this session I didn't make?
git log --oneline --since="8 hours ago"
```

If you see unexpected changes or commits, **preserve the content** — another agent may need it.

---

## Step 6: Verify Changes

After making updates:

1. Re-read each modified file to verify coherence
2. Ensure no duplicate sections were created
3. Check that file lengths are reasonable (~100 lines max per file)
4. Verify links/references are still valid

---

## Output

After completing updates, summarize:

1. What was added to `recent_work.md`
2. What changed in `up_next.md`
3. Whether `current_project.md` was updated
4. Any content that was preserved due to parallel agent concerns
