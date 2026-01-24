/**
 * Calendar API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  CalendarDateInfoSchema,
  CalendarItemSchema,
  CalendarQueryOptionsSchema,
  CalendarTypeMetadataSchema,
  type CalendarDateInfo,
  type CalendarItem,
  type CalendarQueryOptions,
  type CalendarTypeMetadata,
} from './calendar.js';

// ============================================================================
// CalendarDateInfoSchema
// ============================================================================

describe('CalendarDateInfoSchema', () => {
  it('validates all-day event with only startDate', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15',
      allDay: true,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('2026-01-15');
      expect(result.data.allDay).toBe(true);
      expect(result.data.endDate).toBeUndefined();
    }
  });

  it('validates all-day event with startDate and endDate', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15',
      endDate: '2026-01-17',
      allDay: true,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('2026-01-15');
      expect(result.data.endDate).toBe('2026-01-17');
      expect(result.data.allDay).toBe(true);
    }
  });

  it('validates timed event with startDate datetime', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15T10:00:00.000Z',
      allDay: false,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.allDay).toBe(false);
    }
  });

  it('validates timed event with startDate and endDate datetimes', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15T10:00:00.000Z',
      endDate: '2026-01-15T12:00:00.000Z',
      allDay: false,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('2026-01-15T10:00:00.000Z');
      expect(result.data.endDate).toBe('2026-01-15T12:00:00.000Z');
    }
  });

  it('rejects missing startDate', () => {
    const dateInfo = {
      allDay: true,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(false);
  });

  it('rejects missing allDay', () => {
    const dateInfo = {
      startDate: '2026-01-15',
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = CalendarDateInfoSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid startDate format', () => {
    const dateInfo = {
      startDate: 'January 15, 2026',
      allDay: true,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(false);
  });

  it('rejects all-day events with datetime startDate', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15T10:00:00.000Z',
      allDay: true,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(false);
  });

  it('rejects timed events with date-only startDate', () => {
    const dateInfo: CalendarDateInfo = {
      startDate: '2026-01-15',
      allDay: false,
    };
    const result = CalendarDateInfoSchema.safeParse(dateInfo);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CalendarItemSchema
// ============================================================================

describe('CalendarItemSchema', () => {
  const validItem: CalendarItem = {
    id: '01HZXTEST00000000000000001',
    typeId: '01HZXTYPE00000000000000001',
    typeKey: 'Event',
    title: 'Team Meeting',
    dateInfo: {
      startDate: '2026-01-15T10:00:00.000Z',
      endDate: '2026-01-15T11:00:00.000Z',
      allDay: false,
    },
    properties: { location: 'Conference Room A' },
    docVersion: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('validates complete calendar item', () => {
    const result = CalendarItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('01HZXTEST00000000000000001');
      expect(result.data.typeId).toBe('01HZXTYPE00000000000000001');
      expect(result.data.typeKey).toBe('Event');
      expect(result.data.title).toBe('Team Meeting');
      expect(result.data.dateInfo.startDate).toBe('2026-01-15T10:00:00.000Z');
      expect(result.data.dateInfo.endDate).toBe('2026-01-15T11:00:00.000Z');
      expect(result.data.dateInfo.allDay).toBe(false);
      expect(result.data.docVersion).toBe(1);
    }
  });

  it('validates calendar item with all-day event', () => {
    const allDayItem: CalendarItem = {
      ...validItem,
      dateInfo: {
        startDate: '2026-01-15',
        allDay: true,
      },
    };
    const result = CalendarItemSchema.safeParse(allDayItem);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateInfo.allDay).toBe(true);
    }
  });

  it('validates calendar item with empty properties', () => {
    const itemWithEmptyProps: CalendarItem = {
      ...validItem,
      properties: {},
    };
    const result = CalendarItemSchema.safeParse(itemWithEmptyProps);
    expect(result.success).toBe(true);
  });

  it('validates calendar item with complex properties', () => {
    const itemWithProps: CalendarItem = {
      ...validItem,
      properties: {
        location: 'Conference Room A',
        priority: 'High',
        attendees: ['Alice', 'Bob'],
        recurring: true,
      },
    };
    const result = CalendarItemSchema.safeParse(itemWithProps);
    expect(result.success).toBe(true);
  });

  it('rejects invalid id length', () => {
    const invalidItem = {
      ...validItem,
      id: 'invalid-id',
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects invalid typeId length', () => {
    const invalidItem = {
      ...validItem,
      typeId: 'short',
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects empty typeKey', () => {
    const invalidItem = {
      ...validItem,
      typeKey: '',
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects missing title', () => {
    const invalidItem = {
      id: validItem.id,
      typeId: validItem.typeId,
      typeKey: validItem.typeKey,
      dateInfo: validItem.dateInfo,
      properties: validItem.properties,
      docVersion: validItem.docVersion,
      createdAt: validItem.createdAt,
      updatedAt: validItem.updatedAt,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects missing dateInfo', () => {
    const invalidItem = {
      id: validItem.id,
      typeId: validItem.typeId,
      typeKey: validItem.typeKey,
      title: validItem.title,
      properties: validItem.properties,
      docVersion: validItem.docVersion,
      createdAt: validItem.createdAt,
      updatedAt: validItem.updatedAt,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects invalid dateInfo structure', () => {
    const invalidItem = {
      ...validItem,
      dateInfo: {
        date: '2026-01-15', // wrong field name
      },
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects negative docVersion', () => {
    const invalidItem = {
      ...validItem,
      docVersion: -1,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer docVersion', () => {
    const invalidItem = {
      ...validItem,
      docVersion: 1.5,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects missing properties', () => {
    const invalidItem = {
      id: validItem.id,
      typeId: validItem.typeId,
      typeKey: validItem.typeKey,
      title: validItem.title,
      dateInfo: validItem.dateInfo,
      docVersion: validItem.docVersion,
      createdAt: validItem.createdAt,
      updatedAt: validItem.updatedAt,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects missing createdAt', () => {
    const invalidItem = {
      id: validItem.id,
      typeId: validItem.typeId,
      typeKey: validItem.typeKey,
      title: validItem.title,
      dateInfo: validItem.dateInfo,
      properties: validItem.properties,
      docVersion: validItem.docVersion,
      updatedAt: validItem.updatedAt,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });

  it('rejects missing updatedAt', () => {
    const invalidItem = {
      id: validItem.id,
      typeId: validItem.typeId,
      typeKey: validItem.typeKey,
      title: validItem.title,
      dateInfo: validItem.dateInfo,
      properties: validItem.properties,
      docVersion: validItem.docVersion,
      createdAt: validItem.createdAt,
    };
    const result = CalendarItemSchema.safeParse(invalidItem);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CalendarQueryOptionsSchema
// ============================================================================

describe('CalendarQueryOptionsSchema', () => {
  it('validates query with date-only format', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBe('2026-01-01');
      expect(result.data.endDate).toBe('2026-01-31');
    }
  });

  it('validates query with datetime format', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-01-31T23:59:59.000Z',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates query with typeKeys filter', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      typeKeys: ['Event', 'Task'],
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.typeKeys).toEqual(['Event', 'Task']);
    }
  });

  it('validates query with single typeKey', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      typeKeys: ['DailyNote'],
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates query with empty typeKeys array', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      typeKeys: [],
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.typeKeys).toEqual([]);
    }
  });

  it('validates query without typeKeys', () => {
    const options: CalendarQueryOptions = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.typeKeys).toBeUndefined();
    }
  });

  it('rejects missing startDate', () => {
    const options = {
      endDate: '2026-01-31',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects missing endDate', () => {
    const options = {
      startDate: '2026-01-01',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = CalendarQueryOptionsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid startDate format', () => {
    const options = {
      startDate: 'January 1, 2026',
      endDate: '2026-01-31',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects invalid endDate format', () => {
    const options = {
      startDate: '2026-01-01',
      endDate: 'invalid-date',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects non-array typeKeys', () => {
    const options = {
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      typeKeys: 'Event',
    };
    const result = CalendarQueryOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CalendarTypeMetadataSchema
// ============================================================================

describe('CalendarTypeMetadataSchema', () => {
  it('validates complete metadata', () => {
    const metadata: CalendarTypeMetadata = {
      typeId: '01HZXTYPE00000000000000001',
      typeKey: 'Event',
      primaryDateProp: 'start_date',
      secondaryDateProp: 'end_date',
      isDateOnly: false,
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.typeKey).toBe('Event');
      expect(result.data.secondaryDateProp).toBe('end_date');
      expect(result.data.isDateOnly).toBe(false);
    }
  });

  it('validates metadata without secondaryDateProp', () => {
    const metadata: CalendarTypeMetadata = {
      typeId: '01HZXTYPE00000000000000002',
      typeKey: 'Task',
      primaryDateProp: 'due_date',
      isDateOnly: false,
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secondaryDateProp).toBeUndefined();
    }
  });

  it('rejects invalid typeId length', () => {
    const metadata = {
      typeId: 'short',
      typeKey: 'Event',
      primaryDateProp: 'start_date',
      isDateOnly: false,
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });

  it('rejects empty typeKey', () => {
    const metadata = {
      typeId: '01HZXTYPE00000000000000003',
      typeKey: '',
      primaryDateProp: 'start_date',
      isDateOnly: false,
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });

  it('rejects missing primaryDateProp', () => {
    const metadata = {
      typeId: '01HZXTYPE00000000000000004',
      typeKey: 'Event',
      isDateOnly: false,
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean isDateOnly', () => {
    const metadata = {
      typeId: '01HZXTYPE00000000000000005',
      typeKey: 'DailyNote',
      primaryDateProp: 'date_key',
      isDateOnly: 'true',
    };
    const result = CalendarTypeMetadataSchema.safeParse(metadata);
    expect(result.success).toBe(false);
  });
});
