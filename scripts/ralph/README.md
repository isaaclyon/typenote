# Ralph Autonomous Agent Loop

Self-contained ralph setup for TypeNote experimentation.

Ralph is an autonomous AI coding loop that implements features from PRD documents by running Claude Code in iterative loops with quality gates.

## Quick Start

### 1. Generate a PRD

Start a Claude Code session and use the `/prd` skill:

```bash
claude
# Then in the session:
# /prd
```

This will guide you through creating a structured PRD document.

### 2. Convert PRD to JSON

Use the `/ralph` skill to convert your markdown PRD to ralph's JSON format:

```bash
# In Claude Code session:
# /ralph
# Point it to your PRD file in scripts/ralph/prds/
```

This creates `scripts/ralph/prd.json` with structured user stories.

### 3. Run Ralph

```bash
just ralph 10  # Run with max 10 iterations
```

### 4. Monitor Progress

```bash
just ralph-progress  # View learnings log
just ralph-status    # View current PRD status
```

## Files

| File           | Purpose                                          |
| -------------- | ------------------------------------------------ |
| `ralph.sh`     | Main loop script (iterates Claude Code sessions) |
| `CLAUDE.md`    | Prompt template for each iteration               |
| `prd.json`     | Active task tracking (generated, gitignored)     |
| `progress.txt` | Learnings log (generated, gitignored)            |
| `prds/`        | Source PRD documents (tracked in git)            |
| `skills/`      | Local skills for PRD generation                  |
| `archive/`     | Previous run artifacts (gitignored)              |

## Quality Gates

Before each commit, ralph runs:

1. `pnpm typecheck` - TypeScript strict mode
2. `pnpm test` - Unit tests

If either fails, the commit is aborted. This ensures ralph never breaks the build.

## Justfile Recipes

```bash
just ralph [max_iterations]  # Run ralph (default: 10 iterations)
just ralph-progress          # View progress log
just ralph-status            # View PRD JSON status
just ralph-prd               # Info on creating PRDs
just ralph-clean             # Clean runtime files (keep archives)
```

## How It Works

1. **ralph.sh** loops through iterations, calling Claude Code each time
2. **CLAUDE.md** instructs Claude to:
   - Read `prd.json` for pending user stories
   - Pick the highest priority story where `passes: false`
   - Implement it following TypeNote's architecture rules
   - Run quality gates
   - Commit if passing
   - Update `prd.json` and `progress.txt`
3. Loop continues until all stories have `passes: true`

## TypeNote Integration

Ralph is configured to respect TypeNote's:

- **Package boundaries** - api → core → storage → apps
- **Strict TypeScript** - No `any`, no non-null assertions
- **Ladle-first workflow** - UI components in design-system first
- **IPC patterns** - Renderer never imports storage directly

## Maintenance

### Clean runtime files

```bash
just ralph-clean
```

This removes `prd.json`, `progress.txt`, and `.last-branch` but preserves archives.

### Remove ralph entirely

```bash
rm -rf scripts/ralph/
rm .claude/skills/prd .claude/skills/ralph
```

Then remove the ralph recipes from `justfile` and the gitignore entries.

## Troubleshooting

### "No PRD loaded"

Run `/ralph` skill in Claude Code to convert your PRD to JSON format.

### Ralph keeps working on the same story

Check `progress.txt` for errors. The story's `passes` flag may not be updating correctly.

### Quality gates keep failing

Run `pnpm typecheck` and `pnpm test` manually to see the errors. Ralph can't commit until these pass.

## Learn More

- [snarktank/ralph](https://github.com/snarktank/ralph) - Upstream ralph repository
- `scripts/ralph/prds/example.prd.md` - Example PRD template
- `scripts/ralph/skills/` - PRD and ralph skills documentation
