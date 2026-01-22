---
name: commit-session
description: Prepare an atomic commit for current changes
---

# Commit Session

Prepare an atomic commit for current changes.

## Current Status

Review the working tree:

- Current git status and staged/unstaged changes
- Recent commit messages to match repo conventions

## Instructions

- Decide which files belong in the atomic commit
- Stage selectively as needed (do not assume `git add -A`)
- Inspect recent commit messages to match repo style
- Craft a commit message that matches the repo conventions
- Keep the message concise and focused on the why
- Do not commit unrelated changes

## Execution

When ready:

1. Stage relevant files with `git add`
2. Create the commit with an appropriate message
3. Verify success with `git status` and `git log`
