---
description: Prepare an atomic commit for current changes
argument-hint: Commit message
agent: build
---

Review the current working tree and prepare a single atomic commit for the relevant changes in this session.

## Current Status

!`git status`
!`git diff --stat`
!`git diff --cached --stat`
!`git log -5 --oneline`

## Instructions

- Decide which files belong in the atomic commit.
- Stage selectively as needed (do not assume `git add -A`).
- Inspect recent commit messages (`git log -5 --oneline`) to match repo conventions.
- If `$ARGUMENTS` is empty, craft a commit message that matches the repo style.
- Keep the message concise and focused on the why.
- Do not commit unrelated changes.

When ready, run the appropriate `git add` and `git commit` commands.
