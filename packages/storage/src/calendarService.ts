/**
 * Calendar Service
 *
 * Provides calendar-specific operations including:
 * - getCalendarTypes: Get calendar-enabled type metadata
 * - getEventsOnDate: Query items for a specific date
 * - getEventsInDateRange: Query items within a date range
 * - getUpcomingEvents: Query items in the next N days
 * - getAllCalendarItems: Unified query with filters
 */

import { and, eq, isNull, sql, or } from 'drizzle-orm';
import type { TypenoteDb } from './db.js';
import { objects } from './schema.js';
import { listObjectTypes } from './objectTypeService.js';

// ============================================================================
// Types
// ============================================================================

/**
 * Metadata about a calendar-enabled object type.
 */
export interface CalendarTypeMetadata {
  typeId: string;
  typeKey: string;
  primaryDateProp: string;
  secondaryDateProp?: string | undefined;
  isDateOnly: boolean;
}

/**
 * A calendar item with normalized date information.
 */
export interface CalendarItem {
  id: string;
  typeId: string;
  typeKey: string;
  title: string;
  dateInfo: {
    startDate: string;
    endDate?: string | undefined;
    allDay: boolean;
  };
  properties: Record<string, unknown>;
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for getAllCalendarItems query.
 */
export interface GetAllCalendarItemsOptions {
  typeKeys?: string[];
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Built-in Calendar Type Configurations
// ============================================================================

/**
 * Built-in calendar type configurations.
 * These define which property to use for calendar dates.
 */
const BUILT_IN_CALENDAR_CONFIGS: Record<
  string,
  { primaryDateProp: string; secondaryDateProp?: string | undefined; isDateOnly: boolean }
> = {
  Event: {
    primaryDateProp: 'start_date',
    secondaryDateProp: 'end_date',
    isDateOnly: false,
  },
  Task: {
    primaryDateProp: 'due_date',
    secondaryDateProp: undefined,
    isDateOnly: false,
  },
  DailyNote: {
    primaryDateProp: 'date_key',
    secondaryDateProp: undefined,
    isDateOnly: true,
  },
};

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Get start of day datetime string.
 */
function getStartOfDay(dateKey: string): string {
  return `${dateKey}T00:00:00.000Z`;
}

/**
 * Get end of day datetime string.
 */
function getEndOfDay(dateKey: string): string {
  return `${dateKey}T23:59:59.999Z`;
}

/**
 * Get today's date as YYYY-MM-DD.
 */
function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

/**
 * Convert database row to CalendarItem.
 */
function rowToCalendarItem(
  row: {
    id: string;
    typeId: string;
    title: string;
    properties: string | null;
    docVersion: number;
    createdAt: Date;
    updatedAt: Date;
  },
  typeKey: string,
  metadata: CalendarTypeMetadata
): CalendarItem | null {
  const properties: Record<string, unknown> = row.properties
    ? (JSON.parse(row.properties) as Record<string, unknown>)
    : {};

  const startDateValue = properties[metadata.primaryDateProp];
  if (typeof startDateValue !== 'string' || !startDateValue) {
    return null; // No date property, skip
  }

  let endDateValue: string | undefined;
  if (metadata.secondaryDateProp) {
    const rawEndDate = properties[metadata.secondaryDateProp];
    if (typeof rawEndDate === 'string') {
      endDateValue = rawEndDate;
    }
  }

  return {
    id: row.id,
    typeId: row.typeId,
    typeKey,
    title: row.title,
    dateInfo: {
      startDate: startDateValue,
      endDate: endDateValue,
      allDay: metadata.isDateOnly,
    },
    properties,
    docVersion: row.docVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get metadata for all calendar-enabled types.
 * Returns built-in types (Event, Task, DailyNote) and custom types with showInCalendar.
 */
export function getCalendarTypes(db: TypenoteDb): CalendarTypeMetadata[] {
  const allTypes = listObjectTypes(db);
  const calendarTypes: CalendarTypeMetadata[] = [];

  for (const type of allTypes) {
    // Check if it's a built-in calendar type
    const builtInConfig = BUILT_IN_CALENDAR_CONFIGS[type.key];
    if (builtInConfig) {
      calendarTypes.push({
        typeId: type.id,
        typeKey: type.key,
        primaryDateProp: builtInConfig.primaryDateProp,
        secondaryDateProp: builtInConfig.secondaryDateProp,
        isDateOnly: builtInConfig.isDateOnly,
      });
      continue;
    }

    // Check if custom type has showInCalendar enabled
    // Query using raw SQL to get calendar fields
    const rawResults = db.all<{
      id: string;
      show_in_calendar: number | null;
      calendar_date_property: string | null;
    }>(
      `SELECT id, show_in_calendar, calendar_date_property FROM object_types WHERE id = ? LIMIT 1`,
      [type.id]
    );
    const rawType = rawResults[0];

    if (rawType?.show_in_calendar && rawType.calendar_date_property) {
      calendarTypes.push({
        typeId: type.id,
        typeKey: type.key,
        primaryDateProp: rawType.calendar_date_property,
        secondaryDateProp: undefined,
        isDateOnly: false,
      });
    }
  }

  return calendarTypes;
}

/**
 * Get calendar items for a specific date.
 * Includes Events that overlap the date, Tasks due on date, DailyNotes for date.
 */
export function getEventsOnDate(db: TypenoteDb, dateKey: string): CalendarItem[] {
  const calendarTypes = getCalendarTypes(db);
  const items: CalendarItem[] = [];
  const startOfDay = getStartOfDay(dateKey);
  const endOfDay = getEndOfDay(dateKey);

  for (const metadata of calendarTypes) {
    const primaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.primaryDateProp})`;

    // Build date condition based on whether type has secondary date (range) or not
    let dateCondition;
    if (metadata.secondaryDateProp) {
      // For types with start/end dates (Events): check if date range overlaps with the day
      const secondaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.secondaryDateProp})`;
      // Event overlaps date if: start <= endOfDay AND (end >= startOfDay OR end IS NULL)
      dateCondition = and(
        sql`${primaryDateExpr} IS NOT NULL`,
        sql`${primaryDateExpr} <= ${endOfDay}`,
        or(sql`${secondaryDateExpr} >= ${startOfDay}`, sql`${secondaryDateExpr} IS NULL`)
      );
    } else if (metadata.isDateOnly) {
      // For date-only types (DailyNote): exact date match
      dateCondition = sql`${primaryDateExpr} = ${dateKey}`;
    } else {
      // For single datetime types (Task due_date): check if falls within day
      dateCondition = and(
        sql`${primaryDateExpr} IS NOT NULL`,
        sql`${primaryDateExpr} >= ${startOfDay}`,
        sql`${primaryDateExpr} <= ${endOfDay}`
      );
    }

    const rows = db
      .select({
        id: objects.id,
        typeId: objects.typeId,
        title: objects.title,
        properties: objects.properties,
        docVersion: objects.docVersion,
        createdAt: objects.createdAt,
        updatedAt: objects.updatedAt,
      })
      .from(objects)
      .where(and(eq(objects.typeId, metadata.typeId), isNull(objects.deletedAt), dateCondition))
      .all();

    for (const row of rows) {
      const item = rowToCalendarItem(row, metadata.typeKey, metadata);
      if (item) {
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Get calendar items within a date range.
 * Returns items sorted by start date ascending.
 */
export function getEventsInDateRange(
  db: TypenoteDb,
  startDate: string,
  endDate: string
): CalendarItem[] {
  const calendarTypes = getCalendarTypes(db);
  const items: CalendarItem[] = [];
  const rangeStart = getStartOfDay(startDate);
  const rangeEnd = getEndOfDay(endDate);

  for (const metadata of calendarTypes) {
    const primaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.primaryDateProp})`;

    // Build date condition based on type configuration
    let dateCondition;
    if (metadata.secondaryDateProp) {
      // For types with start/end dates: event overlaps range
      // Overlap condition: start <= rangeEnd AND (end >= rangeStart OR end IS NULL)
      const secondaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.secondaryDateProp})`;
      dateCondition = and(
        sql`${primaryDateExpr} IS NOT NULL`,
        sql`${primaryDateExpr} <= ${rangeEnd}`,
        or(sql`${secondaryDateExpr} >= ${rangeStart}`, sql`${secondaryDateExpr} IS NULL`)
      );
    } else if (metadata.isDateOnly) {
      // For date-only types: date within range (compare as strings)
      dateCondition = and(
        sql`${primaryDateExpr} IS NOT NULL`,
        sql`${primaryDateExpr} >= ${startDate}`,
        sql`${primaryDateExpr} <= ${endDate}`
      );
    } else {
      // For single datetime types: falls within range
      dateCondition = and(
        sql`${primaryDateExpr} IS NOT NULL`,
        sql`${primaryDateExpr} >= ${rangeStart}`,
        sql`${primaryDateExpr} <= ${rangeEnd}`
      );
    }

    const rows = db
      .select({
        id: objects.id,
        typeId: objects.typeId,
        title: objects.title,
        properties: objects.properties,
        docVersion: objects.docVersion,
        createdAt: objects.createdAt,
        updatedAt: objects.updatedAt,
      })
      .from(objects)
      .where(and(eq(objects.typeId, metadata.typeId), isNull(objects.deletedAt), dateCondition))
      .all();

    for (const row of rows) {
      const item = rowToCalendarItem(row, metadata.typeKey, metadata);
      if (item) {
        items.push(item);
      }
    }
  }

  // Sort by start date ascending
  items.sort((a, b) => a.dateInfo.startDate.localeCompare(b.dateInfo.startDate));

  return items;
}

/**
 * Get upcoming calendar items within the next N days from today.
 * Returns items sorted by start date ascending.
 */
export function getUpcomingEvents(db: TypenoteDb, days: number): CalendarItem[] {
  const today = getTodayDateKey();

  // Calculate end date
  const endDateObj = new Date();
  endDateObj.setDate(endDateObj.getDate() + days);
  const endDate = endDateObj.toISOString().split('T')[0] ?? '';

  return getEventsInDateRange(db, today, endDate);
}

/**
 * Get all calendar items with optional filtering.
 * Unified query that supports type filtering and date range filtering.
 */
export function getAllCalendarItems(
  db: TypenoteDb,
  options: GetAllCalendarItemsOptions
): CalendarItem[] {
  let calendarTypes = getCalendarTypes(db);

  // Filter by typeKeys if provided
  if (options.typeKeys && options.typeKeys.length > 0) {
    calendarTypes = calendarTypes.filter((t) => options.typeKeys?.includes(t.typeKey));
  }

  const items: CalendarItem[] = [];

  for (const metadata of calendarTypes) {
    const primaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.primaryDateProp})`;

    // Build base conditions
    const conditions = [
      eq(objects.typeId, metadata.typeId),
      isNull(objects.deletedAt),
      sql`${primaryDateExpr} IS NOT NULL`,
    ];

    // Add date range filter if provided
    if (options.startDate && options.endDate) {
      const rangeStart = getStartOfDay(options.startDate);
      const rangeEnd = getEndOfDay(options.endDate);

      if (metadata.secondaryDateProp) {
        // For types with start/end dates: event overlaps range
        const secondaryDateExpr = sql`json_extract(${objects.properties}, '$.' || ${metadata.secondaryDateProp})`;
        conditions.push(sql`${primaryDateExpr} <= ${rangeEnd}`);
        const orCondition = or(
          sql`${secondaryDateExpr} >= ${rangeStart}`,
          sql`${secondaryDateExpr} IS NULL`
        );
        if (orCondition) {
          conditions.push(orCondition);
        }
      } else if (metadata.isDateOnly) {
        // For date-only types
        conditions.push(sql`${primaryDateExpr} >= ${options.startDate}`);
        conditions.push(sql`${primaryDateExpr} <= ${options.endDate}`);
      } else {
        // For single datetime types
        conditions.push(sql`${primaryDateExpr} >= ${rangeStart}`);
        conditions.push(sql`${primaryDateExpr} <= ${rangeEnd}`);
      }
    }

    const rows = db
      .select({
        id: objects.id,
        typeId: objects.typeId,
        title: objects.title,
        properties: objects.properties,
        docVersion: objects.docVersion,
        createdAt: objects.createdAt,
        updatedAt: objects.updatedAt,
      })
      .from(objects)
      .where(and(...conditions))
      .all();

    for (const row of rows) {
      const item = rowToCalendarItem(row, metadata.typeKey, metadata);
      if (item) {
        items.push(item);
      }
    }
  }

  // Sort by start date ascending
  items.sort((a, b) => a.dateInfo.startDate.localeCompare(b.dateInfo.startDate));

  return items;
}
