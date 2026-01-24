import { Hono } from 'hono';
import { getTodayDateKey } from '@typenote/core';
import {
  GetTasksOptionsSchema,
  TaskPropertiesSchema,
  type GetTasksOptions,
  type TaskProperties,
  type TaskSummary,
} from '@typenote/api';
import {
  completeTask,
  getObject,
  getTasks,
  reopenTask,
  type ObjectDetails,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const tasks = new Hono<ServerContext>();

function parseNumberParam(value: string | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw {
      code: 'VALIDATION',
      message: `Query parameter "${name}" must be a number`,
      details: { name, value },
    };
  }
  return parsed;
}

function parseBooleanParam(value: string | undefined, name: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw {
    code: 'VALIDATION',
    message: `Query parameter "${name}" must be a boolean`,
    details: { name, value },
  };
}

function parseDateKey(value: string | undefined, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw {
      code: 'VALIDATION',
      message: `Query parameter "${name}" must be in YYYY-MM-DD format`,
      details: { name, value },
    };
  }
  return value;
}

function getStartOfDay(dateKey: string): string {
  return `${dateKey}T00:00:00.000Z`;
}

function getEndOfDay(dateKey: string): string {
  return `${dateKey}T23:59:59.999Z`;
}

function getDateKeyFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseBaseOptions(query: Record<string, string>): GetTasksOptions {
  const options: GetTasksOptions = {
    status: query.status,
    priority: query.priority,
    dueDateKey: parseDateKey(query.dueDateKey, 'dueDateKey'),
    dueBefore: query.dueBefore,
    dueAfter: query.dueAfter,
    completedAfter: query.completedAfter,
    completedBefore: query.completedBefore,
    includeCompleted: parseBooleanParam(query.includeCompleted, 'includeCompleted'),
    hasDueDate: parseBooleanParam(query.hasDueDate, 'hasDueDate'),
    limit: parseNumberParam(query.limit, 'limit'),
    offset: parseNumberParam(query.offset, 'offset'),
  };

  const parsed = GetTasksOptionsSchema.safeParse(options);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid task query options',
      details: parsed.error.flatten(),
    };
  }

  return parsed.data;
}

function parseTaskProperties(raw: Record<string, unknown>): TaskProperties {
  const result = TaskPropertiesSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  let fallback: TaskProperties = { status: 'Todo' };
  const dueDate = typeof raw['due_date'] === 'string' ? raw['due_date'] : undefined;
  if (dueDate) {
    const dueResult = TaskPropertiesSchema.safeParse({ status: 'Todo', due_date: dueDate });
    if (dueResult.success) {
      fallback = dueResult.data;
    }
  }

  const priority = typeof raw['priority'] === 'string' ? raw['priority'] : undefined;
  if (priority) {
    const priorityResult = TaskPropertiesSchema.safeParse({ ...fallback, priority });
    if (priorityResult.success) {
      fallback = priorityResult.data;
    }
  }

  return fallback;
}

function toTaskSummary(object: ObjectDetails): TaskSummary {
  return {
    id: object.id,
    title: object.title,
    typeId: object.typeId,
    typeKey: object.typeKey,
    updatedAt: object.updatedAt,
    properties: parseTaskProperties(object.properties),
  };
}

function parsePagination(query: Record<string, string>): Pick<GetTasksOptions, 'limit' | 'offset'> {
  return {
    limit: parseNumberParam(query.limit, 'limit'),
    offset: parseNumberParam(query.offset, 'offset'),
  };
}

// GET /tasks - Query tasks with filters
tasks.get('/', (c) => {
  const options = parseBaseOptions(c.req.query());
  const results = getTasks(c.var.db, options);
  return c.json({ success: true, data: results });
});

// GET /tasks/inbox - Tasks with no due date
tasks.get('/inbox', (c) => {
  const pagination = parsePagination(c.req.query());
  const results = getTasks(c.var.db, { ...pagination, hasDueDate: false, includeCompleted: false });
  return c.json({ success: true, data: results });
});

// GET /tasks/today - Tasks due today
tasks.get('/today', (c) => {
  const pagination = parsePagination(c.req.query());
  const today = getTodayDateKey();
  const results = getTasks(c.var.db, {
    ...pagination,
    dueDateKey: today,
    includeCompleted: false,
  });
  return c.json({ success: true, data: results });
});

// GET /tasks/overdue - Tasks due before today
tasks.get('/overdue', (c) => {
  const pagination = parsePagination(c.req.query());
  const today = getTodayDateKey();
  const results = getTasks(c.var.db, {
    ...pagination,
    dueBefore: getStartOfDay(today),
    includeCompleted: false,
  });
  return c.json({ success: true, data: results });
});

// GET /tasks/upcoming?days= - Tasks due within the next N days
tasks.get('/upcoming', (c) => {
  const query = c.req.query();
  const pagination = parsePagination(query);
  const daysParam = parseNumberParam(query.days, 'days');
  if (daysParam !== undefined && daysParam < 0) {
    throw {
      code: 'VALIDATION',
      message: 'Query parameter "days" must be a non-negative number',
      details: { name: 'days', value: query.days },
    };
  }

  const days = daysParam ?? 7;
  const today = getTodayDateKey();
  const endDateKey = getDateKeyFromToday(days);
  const results = getTasks(c.var.db, {
    ...pagination,
    dueAfter: getStartOfDay(today),
    dueBefore: getEndOfDay(endDateKey),
    includeCompleted: false,
  });
  return c.json({ success: true, data: results });
});

// GET /tasks/completed?from&to - Completed tasks filtered by updatedAt range
tasks.get('/completed', (c) => {
  const query = c.req.query();
  const pagination = parsePagination(query);
  const options: GetTasksOptions = {
    ...pagination,
    completedAfter: query.from,
    completedBefore: query.to,
  };

  const parsed = GetTasksOptionsSchema.safeParse(options);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid task query options',
      details: parsed.error.flatten(),
    };
  }

  const results = getTasks(c.var.db, parsed.data);
  return c.json({ success: true, data: results });
});

function ensureTaskObject(db: ServerContext['Variables']['db'], objectId: string): ObjectDetails {
  const object = getObject(db, objectId);
  if (!object) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${objectId}`,
      details: { objectId },
    };
  }
  if (object.typeKey !== 'Task') {
    throw {
      code: 'VALIDATION',
      message: 'Object is not a task',
      details: { objectId, typeKey: object.typeKey },
    };
  }
  return object;
}

// POST /tasks/:id/complete - Mark a task as done
tasks.post('/:id/complete', (c) => {
  const id = c.req.param('id');
  ensureTaskObject(c.var.db, id);

  completeTask(c.var.db, id);
  const updated = getObject(c.var.db, id);
  if (!updated) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  return c.json({ success: true, data: toTaskSummary(updated) });
});

// POST /tasks/:id/reopen - Mark a task as todo
tasks.post('/:id/reopen', (c) => {
  const id = c.req.param('id');
  ensureTaskObject(c.var.db, id);

  reopenTask(c.var.db, id);
  const updated = getObject(c.var.db, id);
  if (!updated) {
    throw {
      code: 'NOT_FOUND_OBJECT',
      message: `Object not found: ${id}`,
      details: { objectId: id },
    };
  }

  return c.json({ success: true, data: toTaskSummary(updated) });
});

export { tasks };
