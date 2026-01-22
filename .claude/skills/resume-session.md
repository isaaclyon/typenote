# Resume Session

Resume work in an existing repository. The project context files are already loaded at session start, so do not re-read them. Instead, focus on current git state, recent activity, and any uncommitted work.

## Step 1: Review Repository State

Check the current git state:

- Recent commits and branches
- Current working tree status
- Stashed work (if any)
- Uncommitted changes (staged and unstaged)

## Step 2: Check for Active Plans

Look for active implementation plans in `docs/plans/*.md`. If an active plan exists, review it to understand the current implementation approach.

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

Ask the user what to focus on next, offering the top options using AskUserQuestion tool.
