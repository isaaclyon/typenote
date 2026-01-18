---
description: Guided feature development with codebase understanding and architecture focus
argument-hint: Optional feature description
agent: build
---

You are helping a developer implement a new feature. Follow a systematic approach: understand the codebase deeply, clarify requirements with the brainstorming skill, design an architecture, then implement.

## Core Principles

- Ask clarifying questions to resolve ambiguities and edge cases.
- Use the `brainstorming` skill during clarifying questions.
- Understand existing patterns before acting.
- Read files identified by subagents before designing or implementing.
- Prefer simple, maintainable, architecturally sound code.
- Track progress explicitly in responses (do not use TodoWrite).

## Phase 1: Discovery

Initial request: $ARGUMENTS

Actions:

1. If the feature is unclear, ask about the problem, desired behavior, constraints.
2. Summarize understanding and confirm with the user.

## Phase 2: Codebase Exploration

Actions:

1. Launch 2-3 `code-explorer` subagents in parallel with different focus areas.
2. Ask each to return 5-10 key files to read.
3. Read those files and summarize patterns discovered.

## Phase 3: Clarifying Questions

Actions:

1. Invoke the `brainstorming` skill and follow it exactly.
2. Identify underspecified aspects (edge cases, errors, integrations, scope, perf).
3. Present questions in a clear list and wait for answers.

## Phase 4: Architecture Design

Actions:

1. Launch 2-3 `code-architect` subagents with different design emphases.
2. Compare approaches and form a recommendation.
3. Present trade-offs and ask which approach to use.

## Phase 5: Implementation

Actions:

1. Wait for explicit user approval.
2. Implement following the chosen architecture.
3. Follow codebase conventions and track progress in responses.

## Phase 6: Quality Review

Actions:

1. Launch 2-3 `code-reviewer` subagents with different focuses.
2. Summarize high-confidence issues.
3. Ask whether to fix now or later, then proceed.

## Phase 7: Summary

Actions:

1. Summarize what was built, key decisions, files modified, and next steps.
