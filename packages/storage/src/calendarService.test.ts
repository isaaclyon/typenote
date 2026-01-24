/**
 * Calendar Service Tests
 *
 * TDD: Write tests first, then implement calendarService to make them pass.
 * Tests cover calendar type resolution, date queries, range queries, and unified queries.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes, createObjectType, updateObjectType } from './objectTypeService.js';
import { createObject } from './objectService.js';
import {
  getCalendarTypes,
  getEventsOnDate,
  getEventsInDateRange,
  getUpcomingEvents,
  getAllCalendarItems,
  type CalendarTypeMetadata,
  type CalendarItem,
} from './calendarService.js';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Create an Event object for testing.
 */
function createEvent(
  db: TypenoteDb,
  title: string,
  properties: Record<string, unknown>
): { id: string; title: string } {
  const result = createObject(db, 'Event', title, properties);
  return { id: result.id, title: result.title };
}

/**
 * Create a Task object for testing.
 */
function createTask(
  db: TypenoteDb,
  title: string,
  properties: Record<string, unknown>
): { id: string; title: string } {
  const result = createObject(db, 'Task', title, properties);
  return { id: result.id, title: result.title };
}

/**
 * Create a DailyNote object for testing.
 */
function createDailyNote(
  db: TypenoteDb,
  title: string,
  properties: Record<string, unknown>
): { id: string; title: string } {
  const result = createObject(db, 'DailyNote', title, properties);
  return { id: result.id, title: result.title };
}

/**
 * Get a date key (YYYY-MM-DD) offset from a base date.
 */
function getDateKey(daysFromBase: number, baseDate: Date = new Date()): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + daysFromBase);
  // Use local timezone to match getTodayDateKey() in the service
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a date key to a datetime string (ISO 8601).
 */
function toDatetime(dateKey: string, time = '12:00:00.000Z'): string {
  return `${dateKey}T${time}`;
}

// ============================================================================
// Tests
// ============================================================================

describe('CalendarService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ==========================================================================
  // getCalendarTypes()
  // ==========================================================================

  describe('getCalendarTypes', () => {
    it('should return Event as a calendar type with start_date/end_date properties', () => {
      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const eventType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'Event');
      expect(eventType).toBeDefined();
      expect(eventType?.primaryDateProp).toBe('start_date');
      expect(eventType?.secondaryDateProp).toBe('end_date');
      expect(eventType?.isDateOnly).toBe(false);
    });

    it('should return Task as a calendar type with due_date property', () => {
      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const taskType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'Task');
      expect(taskType).toBeDefined();
      expect(taskType?.primaryDateProp).toBe('due_date');
      expect(taskType?.secondaryDateProp).toBeUndefined();
      expect(taskType?.isDateOnly).toBe(false);
    });

    it('should return DailyNote as a calendar type with date_key property', () => {
      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const dailyNoteType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'DailyNote');
      expect(dailyNoteType).toBeDefined();
      expect(dailyNoteType?.primaryDateProp).toBe('date_key');
      expect(dailyNoteType?.secondaryDateProp).toBeUndefined();
      expect(dailyNoteType?.isDateOnly).toBe(true);
    });

    it('should include custom types with showInCalendar flag set', () => {
      // Create a custom type with calendar config
      const customType = createObjectType(db, {
        key: 'Meeting',
        name: 'Meeting',
        schema: {
          properties: [
            { key: 'scheduled_at', name: 'Scheduled At', type: 'datetime', required: false },
          ],
        },
      });

      // Enable calendar display
      updateObjectType(db, customType.id, {
        showInCalendar: true,
        calendarDateProperty: 'scheduled_at',
      });

      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const meetingType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'Meeting');
      expect(meetingType).toBeDefined();
      expect(meetingType?.primaryDateProp).toBe('scheduled_at');
    });

    it('should NOT include custom types without showInCalendar flag', () => {
      // Create a custom type without calendar config
      createObjectType(db, {
        key: 'Project',
        name: 'Project',
        schema: {
          properties: [{ key: 'deadline', name: 'Deadline', type: 'datetime', required: false }],
        },
      });

      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const projectType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'Project');
      expect(projectType).toBeUndefined();
    });

    it('should NOT include Page type (no date properties)', () => {
      const types: CalendarTypeMetadata[] = getCalendarTypes(db);

      const pageType = types.find((t: CalendarTypeMetadata) => t.typeKey === 'Page');
      expect(pageType).toBeUndefined();
    });
  });

  // ==========================================================================
  // getEventsOnDate()
  // ==========================================================================

  describe('getEventsOnDate', () => {
    it('should find Event starting on specific date', () => {
      createEvent(db, 'Morning Meeting', {
        start_date: '2024-01-15T10:00:00.000Z',
        end_date: '2024-01-15T11:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Morning Meeting');
    });

    it('should find Event ending on specific date', () => {
      // Event starts on Jan 14, ends on Jan 15
      createEvent(db, 'Multi-Day Event', {
        start_date: '2024-01-14T18:00:00.000Z',
        end_date: '2024-01-15T09:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Multi-Day Event');
    });

    it('should find Event spanning across date', () => {
      // Event starts Jan 14, ends Jan 16 - should appear on Jan 15
      createEvent(db, 'Week Conference', {
        start_date: '2024-01-14T08:00:00.000Z',
        end_date: '2024-01-16T18:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Week Conference');
    });

    it('should NOT find Event before the date', () => {
      createEvent(db, 'Past Event', {
        start_date: '2024-01-13T10:00:00.000Z',
        end_date: '2024-01-13T11:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(0);
    });

    it('should NOT find Event after the date', () => {
      createEvent(db, 'Future Event', {
        start_date: '2024-01-16T10:00:00.000Z',
        end_date: '2024-01-16T11:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(0);
    });

    it('should find Task due on date', () => {
      createTask(db, 'Important Task', {
        status: 'Todo',
        due_date: '2024-01-15T17:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Important Task');
    });

    it('should find DailyNote for date', () => {
      createDailyNote(db, 'Daily Note 2024-01-15', {
        date_key: '2024-01-15',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Daily Note 2024-01-15');
    });

    it('should handle Event with start_date but no end_date', () => {
      createEvent(db, 'Open-Ended Event', {
        start_date: '2024-01-15T14:00:00.000Z',
        // No end_date
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Open-Ended Event');
    });

    it('should NOT include Task with no due_date', () => {
      createTask(db, 'Undated Task', {
        status: 'Todo',
        // No due_date
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(0);
    });

    it('should exclude soft-deleted objects', () => {
      const event = createEvent(db, 'Deleted Event', {
        start_date: '2024-01-15T10:00:00.000Z',
      });

      // Soft delete the object
      db.run(`UPDATE objects SET deleted_at = ? WHERE id = ?`, [Date.now(), event.id]);

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(0);
    });

    it('should return items from multiple calendar types on same date', () => {
      createEvent(db, 'Morning Event', {
        start_date: '2024-01-15T09:00:00.000Z',
        end_date: '2024-01-15T10:00:00.000Z',
      });
      createTask(db, 'Daily Task', {
        status: 'Todo',
        due_date: '2024-01-15T17:00:00.000Z',
      });
      createDailyNote(db, 'Daily Note', {
        date_key: '2024-01-15',
      });

      const items: CalendarItem[] = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(3);
    });
  });

  // ==========================================================================
  // getEventsInDateRange()
  // ==========================================================================

  describe('getEventsInDateRange', () => {
    it('should find events within range (starts before, ends within)', () => {
      createEvent(db, 'Early Start', {
        start_date: '2024-01-14T20:00:00.000Z',
        end_date: '2024-01-16T10:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Early Start');
    });

    it('should find events within range (starts within, ends within)', () => {
      createEvent(db, 'Middle Event', {
        start_date: '2024-01-16T10:00:00.000Z',
        end_date: '2024-01-18T15:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Middle Event');
    });

    it('should find events within range (starts within, ends after)', () => {
      createEvent(db, 'Late End', {
        start_date: '2024-01-19T08:00:00.000Z',
        end_date: '2024-01-22T18:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Late End');
    });

    it('should find events within range (spans entire range)', () => {
      createEvent(db, 'Spanning Event', {
        start_date: '2024-01-10T08:00:00.000Z',
        end_date: '2024-01-25T18:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Spanning Event');
    });

    it('should NOT find events completely before range', () => {
      createEvent(db, 'Before Event', {
        start_date: '2024-01-10T10:00:00.000Z',
        end_date: '2024-01-14T18:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(0);
    });

    it('should NOT find events completely after range', () => {
      createEvent(db, 'After Event', {
        start_date: '2024-01-21T10:00:00.000Z',
        end_date: '2024-01-22T18:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(0);
    });

    it('should find tasks due within range', () => {
      createTask(db, 'Task in Range', {
        status: 'Todo',
        due_date: '2024-01-17T12:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Task in Range');
    });

    it('should find DailyNotes within range', () => {
      createDailyNote(db, 'Note 1', { date_key: '2024-01-16' });
      createDailyNote(db, 'Note 2', { date_key: '2024-01-18' });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(2);
    });

    it('should sort results by start date ascending', () => {
      createEvent(db, 'Third', {
        start_date: '2024-01-19T10:00:00.000Z',
      });
      createEvent(db, 'First', {
        start_date: '2024-01-15T10:00:00.000Z',
      });
      createEvent(db, 'Second', {
        start_date: '2024-01-17T10:00:00.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(3);
      expect(items[0]?.title).toBe('First');
      expect(items[1]?.title).toBe('Second');
      expect(items[2]?.title).toBe('Third');
    });

    it('should include events on boundary dates', () => {
      // Event on start boundary
      createEvent(db, 'Start Boundary', {
        start_date: '2024-01-15T00:00:00.000Z',
        end_date: '2024-01-15T01:00:00.000Z',
      });
      // Event on end boundary
      createEvent(db, 'End Boundary', {
        start_date: '2024-01-20T23:00:00.000Z',
        end_date: '2024-01-20T23:59:59.000Z',
      });

      const items: CalendarItem[] = getEventsInDateRange(db, '2024-01-15', '2024-01-20');

      expect(items).toHaveLength(2);
    });
  });

  // ==========================================================================
  // getUpcomingEvents()
  // ==========================================================================

  describe('getUpcomingEvents', () => {
    it('should find events in next N days from today', () => {
      const in3Days = getDateKey(3);

      createEvent(db, 'Upcoming Event', {
        start_date: toDatetime(in3Days),
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Upcoming Event');
    });

    it('should include events today', () => {
      const today = getDateKey(0);

      createEvent(db, 'Today Event', {
        start_date: toDatetime(today),
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Today Event');
    });

    it('should exclude past events', () => {
      const yesterday = getDateKey(-1);

      createEvent(db, 'Past Event', {
        start_date: toDatetime(yesterday),
        end_date: toDatetime(yesterday, '18:00:00.000Z'),
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(0);
    });

    it('should exclude events beyond N days', () => {
      const in10Days = getDateKey(10);

      createEvent(db, 'Far Future', {
        start_date: toDatetime(in10Days),
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(0);
    });

    it('should include tasks due in next N days', () => {
      const in5Days = getDateKey(5);

      createTask(db, 'Upcoming Task', {
        status: 'Todo',
        due_date: toDatetime(in5Days),
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Upcoming Task');
    });

    it('should include daily notes in next N days', () => {
      const in2Days = getDateKey(2);

      createDailyNote(db, 'Future Note', {
        date_key: in2Days,
      });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('Future Note');
    });

    it('should return items sorted by date', () => {
      const in5Days = getDateKey(5);
      const in2Days = getDateKey(2);
      const today = getDateKey(0);

      createEvent(db, 'Later', { start_date: toDatetime(in5Days) });
      createEvent(db, 'Soon', { start_date: toDatetime(in2Days) });
      createEvent(db, 'Now', { start_date: toDatetime(today) });

      const items: CalendarItem[] = getUpcomingEvents(db, 7);

      expect(items).toHaveLength(3);
      expect(items[0]?.title).toBe('Now');
      expect(items[1]?.title).toBe('Soon');
      expect(items[2]?.title).toBe('Later');
    });
  });

  // ==========================================================================
  // getAllCalendarItems()
  // ==========================================================================

  describe('getAllCalendarItems', () => {
    it('should return items from all calendar-enabled types', () => {
      createEvent(db, 'Event 1', {
        start_date: '2024-01-15T10:00:00.000Z',
      });
      createTask(db, 'Task 1', {
        status: 'Todo',
        due_date: '2024-01-16T10:00:00.000Z',
      });
      createDailyNote(db, 'Note 1', {
        date_key: '2024-01-17',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, {});

      expect(items).toHaveLength(3);
    });

    it('should filter by typeKeys', () => {
      createEvent(db, 'Event 1', {
        start_date: '2024-01-15T10:00:00.000Z',
      });
      createTask(db, 'Task 1', {
        status: 'Todo',
        due_date: '2024-01-16T10:00:00.000Z',
      });
      createDailyNote(db, 'Note 1', {
        date_key: '2024-01-17',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, { typeKeys: ['Event', 'Task'] });

      expect(items).toHaveLength(2);
      expect(items.map((i: CalendarItem) => i.typeKey).sort()).toEqual(['Event', 'Task']);
    });

    it('should include custom types with showInCalendar', () => {
      // Create a custom type with calendar config
      const customType = createObjectType(db, {
        key: 'Deadline',
        name: 'Deadline',
        schema: {
          properties: [{ key: 'due_at', name: 'Due At', type: 'datetime', required: false }],
        },
      });
      updateObjectType(db, customType.id, {
        showInCalendar: true,
        calendarDateProperty: 'due_at',
      });

      // Create instance
      createObject(db, 'Deadline', 'Project Deadline', {
        due_at: '2024-01-20T17:00:00.000Z',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, {});

      const deadlineItem = items.find((i: CalendarItem) => i.typeKey === 'Deadline');
      expect(deadlineItem).toBeDefined();
      expect(deadlineItem?.title).toBe('Project Deadline');
    });

    it('should filter by date range when provided', () => {
      createEvent(db, 'In Range', {
        start_date: '2024-01-17T10:00:00.000Z',
      });
      createEvent(db, 'Out of Range', {
        start_date: '2024-01-25T10:00:00.000Z',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, {
        startDate: '2024-01-15',
        endDate: '2024-01-20',
      });

      expect(items).toHaveLength(1);
      expect(items[0]?.title).toBe('In Range');
    });

    it('should return proper CalendarItem structure', () => {
      createEvent(db, 'Test Event', {
        start_date: '2024-01-15T10:00:00.000Z',
        end_date: '2024-01-15T11:00:00.000Z',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, {});

      expect(items).toHaveLength(1);
      const item = items[0];
      expect(item).toBeDefined();

      if (item) {
        expect(item.id).toBeDefined();
        expect(item.typeId).toBeDefined();
        expect(item.typeKey).toBe('Event');
        expect(item.title).toBe('Test Event');
        expect(item.dateInfo.startDate).toBe('2024-01-15T10:00:00.000Z');
        expect(item.dateInfo.endDate).toBe('2024-01-15T11:00:00.000Z');
        expect(item.dateInfo.allDay).toBe(false);
        expect(item.properties).toBeDefined();
        expect(item.docVersion).toBeDefined();
        expect(item.createdAt).toBeInstanceOf(Date);
        expect(item.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should mark DailyNote items as allDay', () => {
      createDailyNote(db, 'Daily Note', {
        date_key: '2024-01-15',
      });

      const items: CalendarItem[] = getAllCalendarItems(db, {});

      expect(items).toHaveLength(1);
      expect(items[0]?.dateInfo.allDay).toBe(true);
    });

    it('should NOT include items without date properties', () => {
      // Create a Task with no due_date
      createTask(db, 'Undated Task', {
        status: 'Todo',
      });

      // Create an Event with no start_date
      createObject(db, 'Event', 'Undated Event', {});

      const items: CalendarItem[] = getAllCalendarItems(db, {});

      expect(items).toHaveLength(0);
    });
  });
});
