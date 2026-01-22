---
name: resume-session
description: Resume work with git context and session summary
---

# Resume Session

Resume work in an existing repository by reviewing project context and git state.

## Step 1: Read Project Context

Read these three files to understand the current state:

- `agent-docs/current_project.md` — Current phase, milestones, and focus
- `agent-docs/up_next.md` — Active workstreams, blockers, and tasks
- `agent-docs/recent_work.md` — Recent sessions and accomplishments

## Step 2: Review Repository State

Check the current git state:

- Recent commits and branches
- Current working tree status
- Stashed work (if any)
- Uncommitted changes (staged and unstaged)

## Step 3: Check for Active Plans

Look for active implementation plans in `docs/plans/*.md`. If an active plan exists, review it to understand the current implementation approach.

## Step 4: Synthesize Current State

Using the context files plus the git state, build a mental model of:

- Current project phase and goals
- Active workstreams and blockers
- Uncommitted work or in-flight changes
- The most logical next steps

## Step 5: Present Session Summary

Provide a concise summary to the user covering:

- Project name and phase (from context)
- Branch + working tree status
- Last session highlights (from context)
- Uncommitted changes summary (from git)
- Active workstreams (from context)
- Suggested next steps (1-3 options)

## Step 6: Ask for Direction

Ask the user what to focus on next, offering the top options using AskUserQuestion tool.
