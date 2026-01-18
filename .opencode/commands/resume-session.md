---
description: Resume session with git context
---

You are resuming work in an existing repository. The project context files are already loaded at session start, so do not re-read them. Instead, focus on current git state, recent activity, and any uncommitted work.

## Step 1: Review Repository State

Recent commits:
!`git log --oneline -20`

Branch and status:
!`git branch -v`
!`git status`

Stashed work:
!`git stash list`

Uncommitted changes:
!`git diff --stat`
!`git diff --cached --stat`

## Step 2: Check for Active Plans

Active plans:
!`ls -la docs/plans/*.md 2>/dev/null || echo "No active plans"`

If an active plan exists, review it to understand the current implementation approach.

## Step 3: Synthesize Current State

Using the auto-loaded context files plus the git state, build a mental model of:

- Current project phase and goals
- Active workstreams and blockers
- Uncommitted work or in-flight changes
- The most logical next steps

## Step 4: Present Session Summary

Provide a concise summary to the user covering:

- Project name and phase (from context)
- Branch + working tree status
- Last session highlights (from context)
- Uncommitted changes summary (from git)
- Active workstreams (from context)
- Suggested next steps (1-3 options)

## Step 5: Ask for Direction

Ask the user what to focus on next, offering the top options. Use the AskUserQuestion tool.
