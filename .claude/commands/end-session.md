---
name: end-session
description: Wrap up session and update agent-docs
---

# End Session

Wrap up work and update `agent-docs/` for the next session.

## Step 1: Read Current Context

Read the current state of these files before updating:

- `agent-docs/current_project.md` — Current phase, milestones, and focus
- `agent-docs/up_next.md` — Active workstreams, blockers, and tasks
- `agent-docs/recent_work.md` — Recent sessions and accomplishments

## Step 2: Safety Check for Parallel Work

Before updating context files, verify:

- Uncommitted changes (`git status --porcelain`)
- Other branches with recent commits
- Any git stashes
- Never delete workstreams marked Active/In Progress unless you completed them
- Never remove unchecked tasks that you did not work on
- Preserve completed checkmarks `[x]` — another agent may have added them
- When uncertain, append rather than replace

## Step 3: Summarize This Session

Update `agent-docs/recent_work.md` with:

- Session header: `## Latest Session (YYYY-MM-DD description)`
- What was accomplished
- Key files changed (if significant)
- Commits made (hash + message)

## Step 4: Update `agent-docs/up_next.md`

- Check off tasks you completed
- Add new tasks discovered
- Update workstream status (Active/Paused/Blocked/Complete)
- Note blockers clearly

## Step 5: Update `agent-docs/current_project.md` (If Needed)

Only update if a phase/milestone completed, or a major architecture decision was made.

## Step 6: Compact Old Content (Carefully)

- Keep 3-4 detailed sessions in `recent_work.md`
- Collapse older sessions into milestone summaries
- Keep all active workstreams in `up_next.md`
- Delete completed workstreams only if fully merged and documented elsewhere

## Step 7: Verify Updates

- Re-read modified files to ensure coherence
- Avoid duplicate sections
- Keep each file ~100 lines

## Output

Summarize:

- What you added to `agent-docs/recent_work.md`
- What changed in `agent-docs/up_next.md`
- Whether `agent-docs/current_project.md` changed
- Any content preserved due to parallel work
