# TypeNote development commands
# Run `just` or `just --list` to see all available recipes

# Default recipe - show help
default:
    @just --list

# ─────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────

# Start desktop app with full rebuild (use after pulling changes)
dev:
    pnpm dev

# Start desktop app quickly (skip package rebuild)
dq:
    pnpm dev:quick

# Start Ladle component sandbox
ladle:
    pnpm --filter @typenote/design-system sandbox

# Build Ladle for static hosting
ladle-build:
    pnpm --filter @typenote/design-system sandbox:build

# ─────────────────────────────────────────────────
# Quality checks
# ─────────────────────────────────────────────────

# Run all quality checks (typecheck + lint)
check:
    pnpm typecheck && pnpm lint

# Type check all packages
typecheck:
    pnpm typecheck

# Lint all packages
lint:
    pnpm lint

# Format all files
format:
    pnpm format

# Check formatting without fixing
format-check:
    pnpm format:check

# Check dependency architecture rules
deps:
    pnpm deps:check

# ─────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────

# Run unit tests
test:
    pnpm test

# Run unit tests in watch mode for a package
test-watch package:
    pnpm --filter @typenote/{{package}} test:watch

# Run integration tests
test-int:
    pnpm test:integration

# Run E2E tests (rebuilds desktop app)
test-e2e:
    pnpm test:e2e

# Run E2E tests quickly (skip rebuild)
test-e2e-quick:
    pnpm test:e2e:quick

# Run E2E tests with visible browser
test-e2e-headed:
    pnpm test:e2e:headed

# Run all tests (unit + integration, excludes E2E)
test-all:
    pnpm test:all

# ─────────────────────────────────────────────────
# Building
# ─────────────────────────────────────────────────

# Build all packages
build:
    pnpm build

# Clean all build artifacts
clean:
    pnpm clean

# Rebuild native modules for Electron
rebuild:
    pnpm rebuild:electron

# ─────────────────────────────────────────────────
# Package-specific
# ─────────────────────────────────────────────────

# Run command in specific package (e.g., just pkg api test)
pkg package *args:
    pnpm --filter @typenote/{{package}} {{args}}

# ─────────────────────────────────────────────────
# Git shortcuts
# ─────────────────────────────────────────────────

# Quick status
st:
    git status -sb

# Show recent commits
log:
    git log --oneline -15
