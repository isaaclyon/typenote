# Daily Notes API Endpoints — Design

**Date:** 2026-01-11
**Status:** Approved

## Overview

Add daily notes endpoints to the HTTP server for Raycast/Alfred quick capture integration.

## Endpoints

### POST /api/v1/daily-notes/today

Get or create today's daily note.

**Response:**

```json
{
  "success": true,
  "data": {
    "created": true,
    "dailyNote": {
      "id": "01HZX...",
      "typeId": "01ABC...",
      "title": "2026-01-11",
      "properties": { "date_key": "2026-01-11" },
      "docVersion": 0,
      "createdAt": "2026-01-11T...",
      "updatedAt": "2026-01-11T..."
    }
  }
}
```

**Status codes:**

- 201 Created — daily note was newly created
- 200 OK — existing daily note returned

### POST /api/v1/daily-notes/:dateKey

Get or create daily note for a specific date.

**Parameters:**

- `dateKey` — Date in YYYY-MM-DD format

**Response:** Same as above

**Error responses:**

- 400 Bad Request — Invalid date format (INVALID_DATE_FORMAT)

## Implementation

**Files:**

- `packages/http-server/src/routes/daily-notes.ts` — Route handlers
- `packages/http-server/src/routes/daily-notes.test.ts` — Tests
- `packages/http-server/src/router.ts` — Mount routes

**Dependencies:**

- `getOrCreateTodayDailyNote` from @typenote/storage
- `getOrCreateDailyNoteByDate` from @typenote/storage

## Test Cases

1. POST /today returns daily note (creates if not exists)
2. POST /today returns existing on second call (created: false)
3. POST /today returns 201 when created, 200 when existing
4. POST /:dateKey returns daily note for valid date
5. POST /:dateKey returns 400 for invalid format
6. POST /:dateKey returns 400 for malformed date
