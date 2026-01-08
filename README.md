# TypeNote

A local-first desktop knowledge management app where typed objects are the core unit. Each object contains a block-based document editor. Think "Notion meets Obsidian" but fully local with SQLite storage.

## Key Features

- **Objects over pages** — Everything is a typed object (DailyNote, Page, Person, Event, Place, Task)
- **Block-based editing** — Documents are trees of blocks with stable IDs
- **Bidirectional linking** — Wiki-links (`[[...]]`) and mentions (`@...`) with automatic backlink indexing
- **Full-text search** — SQLite FTS5 for fast searching across all content
- **Local-first** — All data in SQLite, offline-capable, no cloud dependency
- **Type inheritance** — Capacities-style object type inheritance (2-level max)
- **Global tags** — Tag objects with colored, searchable tags
- **Templates** — Per-type default templates applied on object creation
- **Attachments** — Content-addressed storage with global deduplication
- **Export/Import** — Git/Syncthing-friendly JSON export format

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Runtime    | Electron                 |
| Language   | TypeScript (strict mode) |
| Database   | SQLite + Drizzle ORM     |
| Search     | SQLite FTS5              |
| Editor     | TipTap/ProseMirror       |
| Packages   | pnpm workspaces          |
| Testing    | Vitest + Stryker         |
| Validation | Zod                      |

## Project Structure

```
packages/
├── api/        # API contracts, Zod schemas, error taxonomy
├── core/       # Pure TS domain logic, content schemas, validation
└── storage/    # SQLite schema, Drizzle migrations, services

apps/
├── cli/        # Backend testing CLI (31 commands)
└── desktop/    # Electron + React + Vite
    ├── main/       # Main process (DB access)
    ├── preload/    # Context bridge (IPC)
    └── renderer/   # React UI
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/isaaclyon/typenote.git
cd typenote

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Running the Desktop App

```bash
# Development mode
pnpm --filter @typenote/desktop dev

# Production build
pnpm --filter @typenote/desktop build
```

### Using the CLI

```bash
# Create an object
pnpm --filter @typenote/cli dev create Page "My First Page"

# List all objects
pnpm --filter @typenote/cli dev list

# Add a block to an object
pnpm --filter @typenote/cli dev patch-insert <object-id> paragraph "Hello, world!"

# Search content
pnpm --filter @typenote/cli dev search "hello"

# Export vault
pnpm --filter @typenote/cli dev export ./backup

# See all commands
pnpm --filter @typenote/cli dev --help
```

## Development

### Commands

```bash
pnpm typecheck     # Type check all packages
pnpm lint          # Lint all packages
pnpm test          # Run all tests (800+ tests)
pnpm build         # Build all packages
pnpm format        # Format all files with Prettier
pnpm mutate        # Run mutation testing (Stryker)
pnpm deps:check    # Check architecture boundaries
```

### Package-Specific Commands

```bash
# Run tests for a specific package
pnpm --filter @typenote/api test
pnpm --filter @typenote/core test
pnpm --filter @typenote/storage test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e
```

## Architecture

### Design Principles

- **Backend-first** — Stable API and persistence before UI work
- **Single transaction per patch** — Atomicity guaranteed for all writes
- **Renderer isolation** — Renderer has no direct DB access, uses IPC
- **Content schema is editor-agnostic** — NotateDoc v1 not tied to TipTap
- **Soft delete** — Blocks marked deleted, not removed (compaction later)

### Package Boundaries

| Package   | Can Import                      | Cannot Import         |
| --------- | ------------------------------- | --------------------- |
| `api`     | zod                             | electron, node fs, db |
| `core`    | `api`, zod, ulid                | electron, node fs, db |
| `storage` | `api`, `core`, drizzle, sqlite3 | electron              |
| `cli`     | All packages, commander         | electron              |
| `desktop` | All packages, electron, react   | (renderer: no db)     |

### Domain Model

- **ObjectType** — Definition of a type (e.g., Person, Book, Meeting)
- **Object** — Instance of a type with properties and a primary document
- **Block** — Typed unit inside an object's document (tree structure)
- **Reference** — Directed link between objects/blocks (backlinks)
- **Attachment** — Local binary in content-addressed store
- **Tag** — Global tag that can be applied to any object

### Built-in Object Types

- `DailyNote` — One per day, keyed by date (auto-created)
- `Page` — General-purpose notes
- `Person` — Contact/person records
- `Event` — Calendar events
- `Place` — Location records
- `Task` — Task items with status tracking

## Current Status

The backend is feature-complete with:

- Object CRUD with type inheritance
- Block-based document editing via patch operations
- Reference extraction and backlink indexing
- Full-text search (FTS5)
- Global tags system
- Per-type templates
- Export/import functionality
- 31 CLI commands for backend testing
- 800+ unit/integration tests
- Mutation testing with Stryker

Desktop app has basic UI with TipTap editor, wiki-link autocomplete, and IPC integration.

## License

MIT
