# TypeNote development commands
# Run `just` or `just --list` to see all available recipes

# Default recipe - show help
default:
    @just --list

# ─────────────────────────────────────────────────
# Development – Desktop
# ─────────────────────────────────────────────────

# Start Electron desktop app with full rebuild
dev:
    pnpm dev

# Start Electron desktop app quickly (skip rebuild)
dq:
    pnpm dev:quick

# ─────────────────────────────────────────────────
# Development – Web
# ─────────────────────────────────────────────────

# Start HTTP API server (port 3000)
server:
    pnpm --filter @typenote/http-server dev

# Start web frontend dev server (port 5173)
web:
    pnpm --filter @typenote/desktop dev:web

# Start HTTP server + web frontend together
web-dev:
    pnpm dev:all

# ─────────────────────────────────────────────────
# Development – Design System
# ─────────────────────────────────────────────────

# Start Ladle component sandbox
ladle:
    pnpm --filter @typenote/design-system sandbox

# Build Ladle for static hosting
ladle-build:
    pnpm --filter @typenote/design-system sandbox:build

# ─────────────────────────────────────────────────
# Quality
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
integration:
    pnpm test:integration

# Run all unit + integration tests (no E2E)
test-all:
    pnpm test:all

# Run E2E tests (rebuilds desktop app)
e2e:
    pnpm test:e2e

# Run E2E tests quickly (skip rebuild)
e2e-quick:
    pnpm test:e2e:quick

# Run E2E tests with visible browser
e2e-headed:
    pnpm test:e2e:headed

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
# Utilities
# ─────────────────────────────────────────────────

# Run command in specific package (e.g., just pkg api test)
pkg package *args:
    pnpm --filter @typenote/{{package}} {{args}}

# Audit design system migration status
audit-design-system:
    pnpm exec tsx scripts/audit-design-system.ts

