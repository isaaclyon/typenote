# Phase 6: Export/Import Design

**Date:** 2026-01-04
**Status:** Approved

## Overview

Deterministic JSON export suitable for Git/Syncthing, with import as full restore.

## Goals

- **Git-friendly**: Small edits produce minimal diffs
- **Portable**: Files work across database instances
- **Round-trip safe**: Export → Import produces identical data
- **Human-readable**: Nested JSON with readable formatting

## Folder Structure

```
export/
├── manifest.json
├── types/
│   ├── DailyNote.json
│   └── CustomType.json
└── objects/
    ├── DailyNote/
    │   └── 01ABC....json
    └── Page/
        └── 01DEF....json
```

## Object JSON Format

```json
{
  "$schema": "typenote/object/v1",
  "id": "01ABC...",
  "typeKey": "DailyNote",
  "title": "2026-01-04",
  "properties": { "date_key": "2026-01-04" },
  "docVersion": 5,
  "createdAt": "2026-01-04T10:30:00.000Z",
  "updatedAt": "2026-01-04T14:22:00.000Z",
  "blocks": [
    {
      "id": "01BLK...",
      "parentBlockId": null,
      "orderKey": "a0",
      "blockType": "heading",
      "content": { "level": 1, "inline": [...] },
      "meta": null,
      "children": [...]
    }
  ]
}
```

## Deterministic Serialization

- Sorted object keys (alphabetical)
- 2-space indentation
- ISO 8601 timestamps
- Children sorted by orderKey
- Trailing newline

## Import Behavior

- **Conflict handling**: Replace mode (delete existing, import new)
- **Type resolution**: `typeKey` → `typeId` lookup
- **Refs**: Re-extracted from block content after import
- **FTS**: Rebuilt after import

## API Surface

```typescript
// packages/storage/src/exportService.ts

exportObject(db, objectId): ExportedObject | null
exportObjectsByType(db, typeKey): ExportedObject[]
exportToFolder(db, folderPath): ExportManifest
importObject(db, data, options?): ImportObjectResult
importFromFolder(db, folderPath): ImportResult
```

## Types

```typescript
interface ExportedObject {
  $schema: 'typenote/object/v1';
  id: string;
  typeKey: string;
  title: string;
  properties: Record<string, unknown>;
  docVersion: number;
  createdAt: string;
  updatedAt: string;
  blocks: ExportedBlock[];
}

interface ExportedBlock {
  id: string;
  parentBlockId: string | null;
  orderKey: string;
  blockType: string;
  content: unknown;
  meta: { collapsed?: boolean } | null;
  children: ExportedBlock[];
}

interface ExportManifest {
  $schema: 'typenote/manifest/v1';
  exportedAt: string;
  typeCount: number;
  objectCount: number;
  blockCount: number;
}
```

## Manifest Format

```json
{
  "$schema": "typenote/manifest/v1",
  "exportedAt": "2026-01-04T15:00:00.000Z",
  "typeCount": 6,
  "objectCount": 142,
  "blockCount": 1847
}
```

## Type Export Format

```json
{
  "$schema": "typenote/type/v1",
  "key": "Project",
  "name": "Project",
  "icon": "folder",
  "builtIn": false,
  "schema": {
    "properties": [
      { "key": "status", "name": "Status", "type": "select", "options": ["active", "done"] }
    ]
  }
}
```

## Not in Scope (v1)

- Markdown export (future enhancement)
- Incremental/delta export
- Merge conflict resolution
- Encryption
