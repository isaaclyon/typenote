# Calendar Routes Design

**Status:** Draft
**Owner:** Backend/API

## Goal

Expose calendar queries via REST in `packages/http-server` using existing storage services and
API contracts, following the established `{ success, data }` response envelope.

## Scope

Add the following endpoints under `/api/v1`:

- `GET /calendar?startDate&endDate&typeKeys[]`
- `GET /calendar/day/:dateKey`
- `GET /calendar/upcoming?days`
- `GET /calendar/types`

## API Contracts

Introduce a new `CalendarTypeMetadataSchema` in `@typenote/api`:

```ts
{
  typeId: string (ULID),
  typeKey: string,
  primaryDateProp: string,
  secondaryDateProp?: string,
  isDateOnly: boolean
}
```

Export the schema and type from `packages/api/src/index.ts`.

## Route Behavior

### GET /calendar

- Parse query params with `URLSearchParams` to support `typeKeys[]`.
- Validate with `CalendarQueryOptionsSchema`.
- Accept date-only or datetime inputs; normalize by taking the leading `YYYY-MM-DD` for
  `startDate` and `endDate` before calling storage.
- Call `getAllCalendarItems(db, { startDate, endDate, typeKeys })`.

### GET /calendar/day/:dateKey

- Validate `dateKey` using `YYYY-MM-DD` regex.
- Call `getEventsOnDate(db, dateKey)`.

### GET /calendar/upcoming?days

- Parse `days` as non-negative integer; default to `7`.
- Call `getUpcomingEvents(db, days)`.

### GET /calendar/types

- Return `getCalendarTypes(db)`.

## Error Handling

- Use service-style errors with `code: 'VALIDATION'` for invalid params or failed schema validation.
- Delegate to existing error middleware for HTTP status mapping.

## Tests

### API

- Extend `packages/api/src/calendar.test.ts` to cover `CalendarTypeMetadataSchema` validation.

### HTTP Server

Add `packages/http-server/src/routes/calendar.test.ts` with tests for:

- Range queries (`/calendar`) with `typeKeys[]` filtering.
- Date-only and datetime query inputs normalization.
- Day query (`/calendar/day/:dateKey`).
- Upcoming query (`/calendar/upcoming`) with validation on negative days.
- Types list (`/calendar/types`) includes built-ins.

## Open Questions

None. Follow the existing plan and storage services without additional filters.
