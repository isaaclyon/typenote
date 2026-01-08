/**
 * Calendar API contracts.
 *
 * Calendar items represent objects with date information that can be
 * displayed in calendar views. Any object type with showInCalendar=true
 * and a configured calendarDateProperty can appear in calendar queries.
 */

import { z } from 'zod';

// ============================================================================
// Date String Validation
// ============================================================================

/**
 * Date string that accepts either:
 * - ISO 8601 date-only format (YYYY-MM-DD) for all-day events
 * - ISO 8601 datetime format (YYYY-MM-DDTHH:mm:ss.sssZ) for timed events
 */
const DateStringSchema = z.string().refine(
  (val) => {
    // Allow date-only format (YYYY-MM-DD)
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateOnlyRegex.test(val)) {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }
    // Allow ISO datetime format
    const date = new Date(val);
    return !isNaN(date.getTime()) && val.includes('T');
  },
  {
    message: 'Date must be in YYYY-MM-DD or ISO 8601 datetime format',
  }
);

// ============================================================================
// CalendarDateInfo
// ============================================================================

/**
 * Date information for a calendar item.
 * Supports both all-day events (date-only) and timed events (datetime).
 */
export const CalendarDateInfoSchema = z.object({
  /** Start date/datetime of the calendar item */
  startDate: DateStringSchema,
  /** End date/datetime of the calendar item (optional for single-day/point-in-time events) */
  endDate: DateStringSchema.optional(),
  /** Whether this is an all-day event (uses date-only format) */
  allDay: z.boolean(),
});

export type CalendarDateInfo = z.infer<typeof CalendarDateInfoSchema>;

// ============================================================================
// CalendarItem
// ============================================================================

/**
 * A calendar item represents an object that appears in calendar views.
 * This is a projection of object data optimized for calendar display.
 */
export const CalendarItemSchema = z.object({
  /** Object ID (ULID) */
  id: z.string().length(26),
  /** Object type ID (ULID) */
  typeId: z.string().length(26),
  /** Object type key (e.g., 'Event', 'Task', 'DailyNote') */
  typeKey: z.string().min(1),
  /** Display title of the object */
  title: z.string(),
  /** Date information for calendar placement */
  dateInfo: CalendarDateInfoSchema,
  /** Object properties (typed based on object type schema) */
  properties: z.record(z.unknown()),
  /** Current document version */
  docVersion: z.number().int().nonnegative(),
  /** When the object was created */
  createdAt: z.date(),
  /** When the object was last updated */
  updatedAt: z.date(),
});

export type CalendarItem = z.infer<typeof CalendarItemSchema>;

// ============================================================================
// Query Options
// ============================================================================

/**
 * Options for querying calendar items within a date range.
 */
export const CalendarQueryOptionsSchema = z.object({
  /** Start of the date range to query (inclusive) */
  startDate: DateStringSchema,
  /** End of the date range to query (inclusive) */
  endDate: DateStringSchema,
  /** Filter by object type keys (optional, returns all calendar-enabled types if not specified) */
  typeKeys: z.array(z.string()).optional(),
});

export type CalendarQueryOptions = z.infer<typeof CalendarQueryOptionsSchema>;
