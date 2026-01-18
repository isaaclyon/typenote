# Resume Session Context Loading

Review project documentation and git history to quickly understand the current state and pick up where we left off.

---

## Step 1: Load Project Context

Read all claude-docs files to understand the project and current work:

```bash
# These files contain essential context
cat claude-docs/current_project.md   # Project overview & phase status
cat claude-docs/up_next.md           # Active workstreams & tasks
cat claude-docs/recent_work.md       # Recent session history
```

Read each file and internalize:

- What is this project about?
- What phase are we in?
- What was worked on recently?
- What's currently in progress vs blocked vs completed?

---

## Step 2: Review Recent Git Activity

Check what has happened in the repository recently:

```bash
# Recent commits (last 20)
git log --oneline -20

# Current branch and status
git branch -v
git status

# Any stashed work?
git stash list

# Uncommitted changes (work in progress)
git diff --stat
git diff --cached --stat
```

Pay attention to:

- **Uncommitted changes**: What was being worked on but not committed?
- **Recent commits**: What was completed in the last session(s)?
- **Branch context**: Are we on main or a feature branch?
- **Stashed work**: Is there paused work that might be relevant?

---

## Step 3: Check for Active Plans

Look for any in-progress implementation plans:

```bash
# List active plans (non-archived)
ls -la docs/plans/*.md 2>/dev/null || echo "No active plans"

# Check .claude/plans for Claude Code plans
ls -la .claude/plans/*.md 2>/dev/null || echo "No Claude plans"
```

If an active plan exists, review it to understand the current implementation approach.

---

## Step 4: Synthesize Current State

After gathering context, create a mental model of:

### Project Status

- Overall project phase and goals
- Key architecture decisions made

### Current Workstreams

- What's actively being worked on
- What's blocked and why
- What's ready to start

### Immediate Context

- Files that were recently modified
- Any uncommitted work that needs attention
- The logical "next step" based on recent work

---

## Step 5: Present Session Summary

Provide a concise summary to the user covering:

### Quick Status

```
Project: [name/description]
Phase: [current phase]
Branch: [current git branch]
```

### Recent Activity

- Last session's work (from recent_work.md)
- Any uncommitted changes found

### Active Workstreams

List from up_next.md:

- [ ] In progress tasks
- [ ] Blocked items (with blockers)
- [ ] Ready to start

### Suggested Next Steps

Based on up_next.md and recent work, suggest 1-3 logical next actions.

---

## Step 6: Ask for Direction

After presenting the summary, ask the user:

> "Based on this context, what would you like to work on? I can continue with [suggested task] or help with something else."

Use the AskUserQuestion tool to let them choose:

- Continue with the most logical next task
- Pick a different task from up_next.md
- Start something new

---

## Output Format

Structure your response as:

```markdown
## Session Resumed

**Project:** [brief description]
**Branch:** `[branch name]` | **Status:** [clean/dirty]

### Last Session

[Brief summary of recent_work.md latest entry]

### Uncommitted Changes

[List any uncommitted files, or "None - working directory clean"]

### Active Work

[List active tasks from up_next.md with status]

### Suggested Next Steps

1. [Most logical continuation]
2. [Alternative option]

---

What would you like to focus on?
```
