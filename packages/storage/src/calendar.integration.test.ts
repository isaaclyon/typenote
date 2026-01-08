/**
 * Calendar Integration Tests
 *
 * These tests verify end-to-end calendar workflows across multiple services:
 * - Custom calendar type workflows
 * - Mixed date format handling (date vs datetime)
 * - Type configuration changes and their effect on queries
 * - Migration verification for built-in types
 * - Multi-type unified queries
 * - Type filtering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import {
  seedBuiltInTypes,
  createObjectType,
  updateObjectType,
  getObjectTypeByKey,
} from './objectTypeService.js';
import { createObject } from './objectService.js';
import {
  getCalendarTypes,
  getEventsOnDate,
  getEventsInDateRange,
  getAllCalendarItems,
  type CalendarTypeMetadata,
  type CalendarItem,
} from './calendarService.js';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Convert a date key to a datetime string (ISO 8601).
 */
function toDatetime(dateKey: string, time = '12:00:00.000Z'): string {
  return `${dateKey}T${time}`;
}

// ============================================================================
// Integration Tests
// ============================================================================

describe('Calendar Integration', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  // ==========================================================================
  // Test 1: Custom calendar type workflow
  // ==========================================================================

  describe('custom calendar type workflow', () => {
    it('should create custom calendar type and query objects', () => {
      // 1. Create custom type with calendar config
      const meetingType = createObjectType(db, {
        key: 'Meeting',
        name: 'Meeting',
        schema: {
          properties: [
            { key: 'scheduled_at', name: 'Scheduled At', type: 'datetime', required: false },
            { key: 'location', name: 'Location', type: 'text', required: false },
          ],
        },
      });

      // Enable calendar display
      updateObjectType(db, meetingType.id, {
        showInCalendar: true,
        calendarDateProperty: 'scheduled_at',
      });

      // 2. Create objects of that type with date properties
      createObject(db, 'Meeting', 'Team Standup', {
        scheduled_at: '2024-01-15T09:00:00.000Z',
        location: 'Conference Room A',
      });

      createObject(db, 'Meeting', 'Project Review', {
        scheduled_at: '2024-01-15T14:00:00.000Z',
        location: 'Virtual',
      });

      createObject(db, 'Meeting', 'Future Meeting', {
        scheduled_at: '2024-01-20T10:00:00.000Z',
        location: 'Office',
      });

      // 3. Query calendar and verify objects appear
      const calendarTypes = getCalendarTypes(db);
      const meetingCalendarType = calendarTypes.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Meeting'
      );
      expect(meetingCalendarType).toBeDefined();
      expect(meetingCalendarType?.primaryDateProp).toBe('scheduled_at');

      // Query for specific date
      const jan15Items = getEventsOnDate(db, '2024-01-15');
      const meetingItems = jan15Items.filter((i: CalendarItem) => i.typeKey === 'Meeting');
      expect(meetingItems).toHaveLength(2);
      expect(meetingItems.map((i: CalendarItem) => i.title).sort()).toEqual([
        'Project Review',
        'Team Standup',
      ]);

      // Query date range
      const rangeItems = getEventsInDateRange(db, '2024-01-15', '2024-01-25');
      const allMeetings = rangeItems.filter((i: CalendarItem) => i.typeKey === 'Meeting');
      expect(allMeetings).toHaveLength(3);
    });

    it('should handle custom type with date-only property', () => {
      // Create a custom type that uses date-only (like DailyNote pattern)
      const holidayType = createObjectType(db, {
        key: 'Holiday',
        name: 'Holiday',
        schema: {
          properties: [
            { key: 'date', name: 'Date', type: 'date', required: true },
            { key: 'description', name: 'Description', type: 'text', required: false },
          ],
        },
      });

      updateObjectType(db, holidayType.id, {
        showInCalendar: true,
        calendarDateProperty: 'date',
      });

      // Create holidays
      createObject(db, 'Holiday', 'New Year', { date: '2024-01-01' });
      createObject(db, 'Holiday', 'MLK Day', { date: '2024-01-15' });

      // Query - custom types without isDateOnly flag use datetime comparison
      // so we need to use the proper date format
      const items = getAllCalendarItems(db, { typeKeys: ['Holiday'] });
      expect(items).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Test 2: Mixed date formats (date vs datetime)
  // ==========================================================================

  describe('mixed date format handling', () => {
    it('should handle mixed date formats (date vs datetime) on same day', () => {
      // 1. Create DailyNote (date format - YYYY-MM-DD)
      createObject(db, 'DailyNote', 'Daily Note 2024-01-15', {
        date_key: '2024-01-15',
      });

      // 2. Create Event (datetime format - ISO 8601)
      createObject(db, 'Event', 'Morning Meeting', {
        start_date: '2024-01-15T09:00:00.000Z',
        end_date: '2024-01-15T10:00:00.000Z',
      });

      // 3. Create Task with due_date (datetime format)
      createObject(db, 'Task', 'Complete Report', {
        status: 'Todo',
        due_date: '2024-01-15T17:00:00.000Z',
      });

      // 4. Query same date and verify all appear
      const items = getEventsOnDate(db, '2024-01-15');

      expect(items).toHaveLength(3);

      // Verify each type is present
      const typeKeys = items.map((i: CalendarItem) => i.typeKey).sort();
      expect(typeKeys).toEqual(['DailyNote', 'Event', 'Task']);

      // Verify DailyNote is marked as allDay
      const dailyNote = items.find((i: CalendarItem) => i.typeKey === 'DailyNote');
      expect(dailyNote?.dateInfo.allDay).toBe(true);

      // Verify Event and Task are NOT allDay
      const event = items.find((i: CalendarItem) => i.typeKey === 'Event');
      expect(event?.dateInfo.allDay).toBe(false);

      const task = items.find((i: CalendarItem) => i.typeKey === 'Task');
      expect(task?.dateInfo.allDay).toBe(false);
    });

    it('should correctly compare date-only vs datetime in range queries', () => {
      // Create DailyNote for Jan 15
      createObject(db, 'DailyNote', 'Note Jan 15', { date_key: '2024-01-15' });

      // Create Event starting at end of Jan 14 extending into Jan 15
      createObject(db, 'Event', 'Late Night Event', {
        start_date: '2024-01-14T23:00:00.000Z',
        end_date: '2024-01-15T02:00:00.000Z',
      });

      // Query for Jan 15
      const items = getEventsOnDate(db, '2024-01-15');

      // Both should appear
      expect(items).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Test 3: Type configuration changes
  // ==========================================================================

  describe('type configuration changes', () => {
    it('should update object type calendar config and reflect in queries', () => {
      // 1. Create custom type without calendar config
      const projectType = createObjectType(db, {
        key: 'Project',
        name: 'Project',
        schema: {
          properties: [{ key: 'deadline', name: 'Deadline', type: 'datetime', required: false }],
        },
      });

      // 2. Create objects
      createObject(db, 'Project', 'Website Redesign', {
        deadline: '2024-01-20T17:00:00.000Z',
      });

      createObject(db, 'Project', 'Mobile App', {
        deadline: '2024-01-25T17:00:00.000Z',
      });

      // 3. Verify NOT in calendar
      const typesBeforeEnable = getCalendarTypes(db);
      const projectTypeBefore = typesBeforeEnable.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Project'
      );
      expect(projectTypeBefore).toBeUndefined();

      const itemsBeforeEnable = getAllCalendarItems(db, { typeKeys: ['Project'] });
      expect(itemsBeforeEnable).toHaveLength(0);

      // 4. Update type to enable calendar
      updateObjectType(db, projectType.id, {
        showInCalendar: true,
        calendarDateProperty: 'deadline',
      });

      // 5. Query and verify objects now appear
      const typesAfterEnable = getCalendarTypes(db);
      const projectTypeAfter = typesAfterEnable.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Project'
      );
      expect(projectTypeAfter).toBeDefined();
      expect(projectTypeAfter?.primaryDateProp).toBe('deadline');

      const itemsAfterEnable = getAllCalendarItems(db, { typeKeys: ['Project'] });
      expect(itemsAfterEnable).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Test 4: Disable calendar for type
  // ==========================================================================

  describe('disable calendar for type', () => {
    it('should exclude objects when calendar disabled for type', () => {
      // 1. Create type with calendar enabled
      const appointmentType = createObjectType(db, {
        key: 'Appointment',
        name: 'Appointment',
        schema: {
          properties: [{ key: 'time', name: 'Time', type: 'datetime', required: true }],
        },
      });

      updateObjectType(db, appointmentType.id, {
        showInCalendar: true,
        calendarDateProperty: 'time',
      });

      // 2. Create objects
      createObject(db, 'Appointment', 'Doctor Visit', {
        time: '2024-01-15T10:00:00.000Z',
      });

      // 3. Verify in calendar
      const itemsBefore = getAllCalendarItems(db, { typeKeys: ['Appointment'] });
      expect(itemsBefore).toHaveLength(1);

      // 4. Disable calendar for type
      updateObjectType(db, appointmentType.id, {
        showInCalendar: false,
      });

      // 5. Query and verify objects excluded
      const typesAfterDisable = getCalendarTypes(db);
      const appointmentTypeAfter = typesAfterDisable.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Appointment'
      );
      expect(appointmentTypeAfter).toBeUndefined();

      const itemsAfter = getAllCalendarItems(db, { typeKeys: ['Appointment'] });
      expect(itemsAfter).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Test 5: Migration verification
  // ==========================================================================

  describe('migration verification', () => {
    it('should have correct calendar config for Event after migration', () => {
      const eventType = getObjectTypeByKey(db, 'Event');
      expect(eventType).not.toBeNull();
      // Note: showInCalendar might be set via migration but the calendar service
      // uses built-in config for Event type regardless

      const calendarTypes = getCalendarTypes(db);
      const eventCalendarType = calendarTypes.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Event'
      );
      expect(eventCalendarType).toBeDefined();
      expect(eventCalendarType?.primaryDateProp).toBe('start_date');
      expect(eventCalendarType?.secondaryDateProp).toBe('end_date');
      expect(eventCalendarType?.isDateOnly).toBe(false);
    });

    it('should have correct calendar config for Task after migration', () => {
      const taskType = getObjectTypeByKey(db, 'Task');
      expect(taskType).not.toBeNull();

      const calendarTypes = getCalendarTypes(db);
      const taskCalendarType = calendarTypes.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'Task'
      );
      expect(taskCalendarType).toBeDefined();
      expect(taskCalendarType?.primaryDateProp).toBe('due_date');
      expect(taskCalendarType?.secondaryDateProp).toBeUndefined();
      expect(taskCalendarType?.isDateOnly).toBe(false);
    });

    it('should have correct calendar config for DailyNote after migration', () => {
      const dailyNoteType = getObjectTypeByKey(db, 'DailyNote');
      expect(dailyNoteType).not.toBeNull();

      const calendarTypes = getCalendarTypes(db);
      const dailyNoteCalendarType = calendarTypes.find(
        (t: CalendarTypeMetadata) => t.typeKey === 'DailyNote'
      );
      expect(dailyNoteCalendarType).toBeDefined();
      expect(dailyNoteCalendarType?.primaryDateProp).toBe('date_key');
      expect(dailyNoteCalendarType?.secondaryDateProp).toBeUndefined();
      expect(dailyNoteCalendarType?.isDateOnly).toBe(true);
    });

    it('should NOT include Page, Note, or Collection in calendar types', () => {
      const calendarTypes = getCalendarTypes(db);
      const typeKeys = calendarTypes.map((t: CalendarTypeMetadata) => t.typeKey);

      expect(typeKeys).not.toContain('Page');
      expect(typeKeys).not.toContain('Note');
      expect(typeKeys).not.toContain('Collection');
    });
  });

  // ==========================================================================
  // Test 6: Multi-type unified query
  // ==========================================================================

  describe('multi-type unified query', () => {
    it('should query multiple calendar types in single call', () => {
      const testDate = '2024-02-01';

      // 1. Create Event, Task, DailyNote all on same date
      createObject(db, 'Event', 'Morning Event', {
        start_date: toDatetime(testDate, '09:00:00.000Z'),
        end_date: toDatetime(testDate, '10:00:00.000Z'),
      });

      createObject(db, 'Task', 'Due Today', {
        status: 'Todo',
        due_date: toDatetime(testDate, '17:00:00.000Z'),
      });

      createObject(db, 'DailyNote', `Daily Note ${testDate}`, {
        date_key: testDate,
      });

      // 2. Call getAllCalendarItems
      const items = getAllCalendarItems(db, {
        startDate: testDate,
        endDate: testDate,
      });

      // 3. Verify all three appear
      expect(items).toHaveLength(3);

      const typeKeys = items.map((i: CalendarItem) => i.typeKey).sort();
      expect(typeKeys).toEqual(['DailyNote', 'Event', 'Task']);

      // 4. Verify sorted by start date
      // DailyNote (allDay) has date_key as start
      // Event starts at 09:00
      // Task due at 17:00
      expect(items[0]?.typeKey).toBe('DailyNote'); // 2024-02-01 (date only, sorts first)
      expect(items[1]?.typeKey).toBe('Event'); // 2024-02-01T09:00
      expect(items[2]?.typeKey).toBe('Task'); // 2024-02-01T17:00
    });

    it('should return items sorted chronologically across types', () => {
      // Create items across multiple days with different types
      createObject(db, 'Event', 'First Event', {
        start_date: '2024-02-01T10:00:00.000Z',
      });

      createObject(db, 'Task', 'Early Task', {
        status: 'Todo',
        due_date: '2024-02-01T08:00:00.000Z',
      });

      createObject(db, 'Event', 'Second Event', {
        start_date: '2024-02-02T09:00:00.000Z',
      });

      createObject(db, 'DailyNote', 'Feb 1 Note', {
        date_key: '2024-02-01',
      });

      const items = getAllCalendarItems(db, {
        startDate: '2024-02-01',
        endDate: '2024-02-02',
      });

      expect(items).toHaveLength(4);

      // Should be sorted by start date
      // Feb 1 DailyNote, Feb 1 Task (08:00), Feb 1 Event (10:00), Feb 2 Event (09:00)
      expect(items[0]?.title).toBe('Feb 1 Note');
      expect(items[1]?.title).toBe('Early Task');
      expect(items[2]?.title).toBe('First Event');
      expect(items[3]?.title).toBe('Second Event');
    });
  });

  // ==========================================================================
  // Test 7: Type filtering
  // ==========================================================================

  describe('type filtering', () => {
    it('should filter calendar items by typeKeys', () => {
      const testDate = '2024-03-01';

      // 1. Create Event and Task on same date
      createObject(db, 'Event', 'Team Meeting', {
        start_date: toDatetime(testDate, '10:00:00.000Z'),
      });

      createObject(db, 'Task', 'Review PR', {
        status: 'Todo',
        due_date: toDatetime(testDate, '15:00:00.000Z'),
      });

      createObject(db, 'DailyNote', 'March 1 Note', {
        date_key: testDate,
      });

      // 2. Query with typeKeys: ['Event']
      const eventOnlyItems = getAllCalendarItems(db, {
        typeKeys: ['Event'],
        startDate: testDate,
        endDate: testDate,
      });

      // 3. Verify only Event appears
      expect(eventOnlyItems).toHaveLength(1);
      expect(eventOnlyItems[0]?.typeKey).toBe('Event');
      expect(eventOnlyItems[0]?.title).toBe('Team Meeting');
    });

    it('should filter by multiple typeKeys', () => {
      const testDate = '2024-03-15';

      createObject(db, 'Event', 'Conference', {
        start_date: toDatetime(testDate, '09:00:00.000Z'),
      });

      createObject(db, 'Task', 'Prepare Slides', {
        status: 'Todo',
        due_date: toDatetime(testDate, '08:00:00.000Z'),
      });

      createObject(db, 'DailyNote', 'Conference Day', {
        date_key: testDate,
      });

      // Query for Event and Task only
      const items = getAllCalendarItems(db, {
        typeKeys: ['Event', 'Task'],
        startDate: testDate,
        endDate: testDate,
      });

      expect(items).toHaveLength(2);
      const typeKeys = items.map((i: CalendarItem) => i.typeKey).sort();
      expect(typeKeys).toEqual(['Event', 'Task']);
    });

    it('should return empty array when filtering by non-calendar type', () => {
      createObject(db, 'Event', 'Some Event', {
        start_date: '2024-03-20T10:00:00.000Z',
      });

      // Page is not a calendar type
      const items = getAllCalendarItems(db, {
        typeKeys: ['Page'],
        startDate: '2024-03-20',
        endDate: '2024-03-20',
      });

      expect(items).toHaveLength(0);
    });

    it('should handle mix of calendar and non-calendar type filters', () => {
      createObject(db, 'Event', 'Event 1', {
        start_date: '2024-03-25T10:00:00.000Z',
      });

      // Filter by Event (calendar type) and Page (not calendar type)
      const items = getAllCalendarItems(db, {
        typeKeys: ['Event', 'Page'],
        startDate: '2024-03-25',
        endDate: '2024-03-25',
      });

      // Should return only Event items
      expect(items).toHaveLength(1);
      expect(items[0]?.typeKey).toBe('Event');
    });
  });

  // ==========================================================================
  // Test 8: Cross-service integration
  // ==========================================================================

  describe('cross-service integration', () => {
    it('should return calendar items matching CalendarItemSchema structure', () => {
      createObject(db, 'Event', 'Schema Test Event', {
        start_date: '2024-04-01T10:00:00.000Z',
        end_date: '2024-04-01T11:00:00.000Z',
      });

      const items = getAllCalendarItems(db, {});

      expect(items.length).toBeGreaterThan(0);
      const item = items.find((i: CalendarItem) => i.title === 'Schema Test Event');
      expect(item).toBeDefined();

      if (item) {
        // Verify structure matches CalendarItemSchema
        expect(typeof item.id).toBe('string');
        expect(item.id.length).toBe(26); // ULID length
        expect(typeof item.typeId).toBe('string');
        expect(item.typeId.length).toBe(26);
        expect(typeof item.typeKey).toBe('string');
        expect(typeof item.title).toBe('string');
        expect(item.dateInfo).toBeDefined();
        expect(typeof item.dateInfo.startDate).toBe('string');
        expect(typeof item.dateInfo.allDay).toBe('boolean');
        expect(typeof item.properties).toBe('object');
        expect(typeof item.docVersion).toBe('number');
        expect(item.createdAt).toBeInstanceOf(Date);
        expect(item.updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should handle objects with missing optional date property', () => {
      // Create Task without due_date
      createObject(db, 'Task', 'No Due Date Task', {
        status: 'Todo',
        // No due_date
      });

      // Create Event without end_date
      createObject(db, 'Event', 'Open Ended Event', {
        start_date: '2024-04-10T10:00:00.000Z',
        // No end_date
      });

      const items = getAllCalendarItems(db, {});

      // Task should NOT appear (no due_date)
      const taskItems = items.filter((i: CalendarItem) => i.title === 'No Due Date Task');
      expect(taskItems).toHaveLength(0);

      // Event should appear (has start_date)
      const eventItems = items.filter((i: CalendarItem) => i.title === 'Open Ended Event');
      expect(eventItems).toHaveLength(1);
      expect(eventItems[0]?.dateInfo.endDate).toBeUndefined();
    });

    it('should properly handle object type CRUD affecting calendar queries', () => {
      // Create a custom type
      const reminderType = createObjectType(db, {
        key: 'Reminder',
        name: 'Reminder',
        schema: {
          properties: [{ key: 'remind_at', name: 'Remind At', type: 'datetime', required: true }],
        },
      });

      // Not yet in calendar
      let calendarTypes = getCalendarTypes(db);
      expect(
        calendarTypes.find((t: CalendarTypeMetadata) => t.typeKey === 'Reminder')
      ).toBeUndefined();

      // Enable calendar
      updateObjectType(db, reminderType.id, {
        showInCalendar: true,
        calendarDateProperty: 'remind_at',
      });

      // Create some reminders
      createObject(db, 'Reminder', 'Call Mom', {
        remind_at: '2024-04-15T18:00:00.000Z',
      });

      // Now in calendar
      calendarTypes = getCalendarTypes(db);
      expect(
        calendarTypes.find((t: CalendarTypeMetadata) => t.typeKey === 'Reminder')
      ).toBeDefined();

      // Query
      let items = getAllCalendarItems(db, { typeKeys: ['Reminder'] });
      expect(items).toHaveLength(1);

      // Change the date property
      updateObjectType(db, reminderType.id, {
        calendarDateProperty: 'remind_at', // Same, but could be different
      });

      // Still works
      items = getAllCalendarItems(db, { typeKeys: ['Reminder'] });
      expect(items).toHaveLength(1);

      // Disable calendar
      updateObjectType(db, reminderType.id, {
        showInCalendar: false,
      });

      // No longer in calendar
      calendarTypes = getCalendarTypes(db);
      expect(
        calendarTypes.find((t: CalendarTypeMetadata) => t.typeKey === 'Reminder')
      ).toBeUndefined();

      items = getAllCalendarItems(db, { typeKeys: ['Reminder'] });
      expect(items).toHaveLength(0);
    });
  });

  // ==========================================================================
  // Test 9: Edge cases
  // ==========================================================================

  describe('edge cases', () => {
    it('should handle empty database (no objects)', () => {
      const items = getAllCalendarItems(db, {});
      expect(items).toHaveLength(0);
    });

    it('should handle date range with no matching items', () => {
      // Create event with explicit end_date (events without end_date are treated as ongoing)
      createObject(db, 'Event', 'January Event', {
        start_date: '2024-01-15T10:00:00.000Z',
        end_date: '2024-01-15T12:00:00.000Z',
      });

      // Query for dates with no events
      const items = getEventsInDateRange(db, '2024-06-01', '2024-06-30');
      // Should not include the January event
      const januaryEvent = items.find((i: CalendarItem) => i.title === 'January Event');
      expect(januaryEvent).toBeUndefined();
    });

    it('should treat events without end_date as ongoing (appears in future queries)', () => {
      // Note: Events without end_date are treated as ongoing/never-ending
      // This is intentional for events like "On Call Duty" or similar ongoing states
      createObject(db, 'Event', 'Ongoing Event', {
        start_date: '2024-01-01T00:00:00.000Z',
        // No end_date - treated as ongoing
      });

      // This event appears in future date ranges because it has no end_date
      const items = getEventsInDateRange(db, '2024-06-01', '2024-06-30');
      const ongoingEvent = items.find((i: CalendarItem) => i.title === 'Ongoing Event');
      expect(ongoingEvent).toBeDefined();
      expect(ongoingEvent?.dateInfo.endDate).toBeUndefined();
    });

    it('should handle very wide date range', () => {
      createObject(db, 'Event', 'Start of Year', {
        start_date: '2024-01-01T00:00:00.000Z',
      });

      createObject(db, 'Event', 'End of Year', {
        start_date: '2024-12-31T23:59:59.000Z',
      });

      const items = getEventsInDateRange(db, '2024-01-01', '2024-12-31');
      expect(items).toHaveLength(2);
    });

    it('should handle events spanning multiple days', () => {
      createObject(db, 'Event', 'Week-long Conference', {
        start_date: '2024-05-01T08:00:00.000Z',
        end_date: '2024-05-07T18:00:00.000Z',
      });

      // Should appear on each day in the range
      expect(getEventsOnDate(db, '2024-05-01')).toHaveLength(1);
      expect(getEventsOnDate(db, '2024-05-03')).toHaveLength(1);
      expect(getEventsOnDate(db, '2024-05-07')).toHaveLength(1);

      // Should not appear outside the range
      expect(getEventsOnDate(db, '2024-04-30')).toHaveLength(0);
      expect(getEventsOnDate(db, '2024-05-08')).toHaveLength(0);
    });

    it('should handle custom type with null calendarDateProperty', () => {
      const badType = createObjectType(db, {
        key: 'BadConfig',
        name: 'Bad Config',
        schema: {
          properties: [{ key: 'date', name: 'Date', type: 'datetime', required: false }],
        },
      });

      // Set showInCalendar but not calendarDateProperty
      // Using raw SQL since the service might protect against this
      db.run('UPDATE object_types SET show_in_calendar = 1 WHERE id = ?', [badType.id]);

      // Should not appear in calendar types (missing calendarDateProperty)
      const calendarTypes = getCalendarTypes(db);
      expect(
        calendarTypes.find((t: CalendarTypeMetadata) => t.typeKey === 'BadConfig')
      ).toBeUndefined();
    });

    it('should handle objects with missing date property', () => {
      // Create event with valid date
      createObject(db, 'Event', 'Valid Event', {
        start_date: '2024-06-01T10:00:00.000Z',
      });

      // Manually create object with no date property using raw SQL
      const now = new Date();
      db.run(
        `INSERT INTO objects (id, type_id, title, properties, doc_version, created_at, updated_at)
         SELECT ?, id, ?, ?, 0, ?, ? FROM object_types WHERE key = 'Event'`,
        [
          '01HZXXXXXXXXXXXXXXXXXXX001',
          'No Date Event',
          JSON.stringify({}), // No start_date property
          now.getTime(),
          now.getTime(),
        ]
      );

      // Query should still work, just skip the one without date
      const items = getAllCalendarItems(db, {});
      const validEvent = items.find((i: CalendarItem) => i.title === 'Valid Event');
      expect(validEvent).toBeDefined();

      // Object without date property should be skipped
      const noDateEvent = items.find((i: CalendarItem) => i.title === 'No Date Event');
      expect(noDateEvent).toBeUndefined();
    });
  });
});
