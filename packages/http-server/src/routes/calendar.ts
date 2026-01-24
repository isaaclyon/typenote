import { Hono } from 'hono';
import {
  getAllCalendarItems,
  getCalendarTypes,
  getEventsOnDate,
  getUpcomingEvents,
} from '@typenote/storage';
import { CalendarQueryOptionsSchema } from '@typenote/api';
import type { ServerContext } from '../types.js';

const calendar = new Hono<ServerContext>();

function normalizeDateKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const [dateKey] = value.split('T');
  return dateKey ?? value;
}

function parseDaysParam(value: string | undefined): number {
  if (value === undefined) return 7;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw {
      code: 'VALIDATION',
      message: 'Query parameter "days" must be a non-negative number',
      details: { name: 'days', value },
    };
  }
  return parsed;
}

/**
 * GET /calendar - Query calendar items within a date range.
 */
calendar.get('/', (c) => {
  const searchParams = new URL(c.req.url).searchParams;
  const startDate = searchParams.get('startDate') ?? undefined;
  const endDate = searchParams.get('endDate') ?? undefined;
  const typeKeys = searchParams.getAll('typeKeys[]');

  const parsed = CalendarQueryOptionsSchema.safeParse({
    startDate,
    endDate,
    typeKeys: typeKeys.length > 0 ? typeKeys : undefined,
  });

  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid calendar query options',
      details: parsed.error.flatten(),
    };
  }

  const normalizedStart = normalizeDateKey(parsed.data.startDate);
  const normalizedEnd = normalizeDateKey(parsed.data.endDate);

  const items = getAllCalendarItems(c.var.db, {
    startDate: normalizedStart,
    endDate: normalizedEnd,
    ...(parsed.data.typeKeys ? { typeKeys: parsed.data.typeKeys } : {}),
  });

  return c.json({ success: true, data: items });
});

/**
 * GET /calendar/day/:dateKey - Query calendar items on a specific date.
 */
calendar.get('/day/:dateKey', (c) => {
  const dateKey = c.req.param('dateKey');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid dateKey format',
      details: { dateKey },
    };
  }

  const items = getEventsOnDate(c.var.db, dateKey);
  return c.json({ success: true, data: items });
});

/**
 * GET /calendar/upcoming - Query calendar items for upcoming days.
 */
calendar.get('/upcoming', (c) => {
  const days = parseDaysParam(c.req.query('days'));
  const items = getUpcomingEvents(c.var.db, days);
  return c.json({ success: true, data: items });
});

/**
 * GET /calendar/types - List calendar-enabled types.
 */
calendar.get('/types', (c) => {
  const types = getCalendarTypes(c.var.db);
  return c.json({ success: true, data: types });
});

export { calendar };
