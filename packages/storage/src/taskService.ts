/**
 * Task Service
 *
 * Provides Task-specific operations including:
 * - getTodaysTasks: Get tasks due today
 * - getOverdueTasks: Get tasks past due date
 * - getTasksByStatus: Filter tasks by status
 * - getUpcomingTasks: Get tasks due within N days
 * - getInboxTasks: Get tasks with no due date
 * - getTasksByPriority: Filter tasks by priority
 * - getCompletedTasks: Get completed tasks
 * - getTasksByDueDate: Get tasks due on a specific date (Daily Note integration)
 * - completeTask / reopenTask: Convenience mutations
 */

import { and, desc, eq, isNull, sql, gte, lte, lt } from 'drizzle-orm';
import { getTodayDateKey } from '@typenote/core';
import type {
  GetTasksOptions,
  TaskPriority,
  TaskStatus,
  TaskSummary,
  TaskProperties,
} from '@typenote/api';
import { TaskPropertiesSchema } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { objects } from './schema.js';
import { getObjectTypeByKey } from './objectTypeService.js';

// ============================================================================
// Types
// ============================================================================

export interface TaskObject {
  id: string;
  typeId: string;
  title: string;
  properties: {
    status: TaskStatus;
    due_date?: string;
    priority?: TaskPriority;
  };
  docVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompletedTasksOptions {
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Get the Task type ID, throwing if not found.
 */
function getTaskTypeId(db: TypenoteDb): string {
  const taskType = getObjectTypeByKey(db, 'Task');
  if (!taskType) {
    throw new Error('Task type not found. Ensure seedBuiltInTypes() was called.');
  }
  return taskType.id;
}

/**
 * Convert database row to TaskObject entity.
 */
function rowToTaskObject(row: typeof objects.$inferSelect): TaskObject {
  return {
    id: row.id,
    typeId: row.typeId,
    title: row.title,
    properties: row.properties ? JSON.parse(row.properties) : { status: 'Todo' },
    docVersion: row.docVersion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function parseTaskProperties(raw: string | null): TaskProperties {
  let parsed: unknown = {};
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
  }

  const result = TaskPropertiesSchema.safeParse(parsed);
  if (result.success) {
    return result.data;
  }

  let fallback: TaskProperties = { status: 'Todo' };
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const dueDate = typeof record['due_date'] === 'string' ? record['due_date'] : undefined;
    if (dueDate) {
      const dueResult = TaskPropertiesSchema.safeParse({ status: 'Todo', due_date: dueDate });
      if (dueResult.success) {
        fallback = dueResult.data;
      }
    }

    const priority = typeof record['priority'] === 'string' ? record['priority'] : undefined;
    if (priority) {
      const priorityResult = TaskPropertiesSchema.safeParse({ ...fallback, priority });
      if (priorityResult.success) {
        fallback = priorityResult.data;
      }
    }
  }

  return fallback;
}

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

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get tasks due today (excludes completed).
 */
export function getTodaysTasks(db: TypenoteDb): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const today = getTodayDateKey();
  const startOfDay = getStartOfDay(today);
  const endOfDay = getEndOfDay(today);

  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${statusExpr} != 'Done'`,
        sql`${dueDateExpr} >= ${startOfDay}`,
        sql`${dueDateExpr} <= ${endOfDay}`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get overdue tasks (due before today, not completed).
 */
export function getOverdueTasks(db: TypenoteDb): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const today = getTodayDateKey();
  const startOfToday = getStartOfDay(today);

  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${statusExpr} != 'Done'`,
        sql`${dueDateExpr} IS NOT NULL`,
        sql`${dueDateExpr} < ${startOfToday}`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get tasks by status.
 */
export function getTasksByStatus(db: TypenoteDb, status: TaskStatus): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(eq(objects.typeId, taskTypeId), isNull(objects.deletedAt), sql`${statusExpr} = ${status}`)
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get upcoming tasks (due within N days from today, excludes completed and overdue).
 */
export function getUpcomingTasks(db: TypenoteDb, days: number): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const today = getTodayDateKey();
  const startOfToday = getStartOfDay(today);

  // Calculate end date
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  const endDateKey = endDate.toISOString().split('T')[0] ?? '';
  const endOfRange = getEndOfDay(endDateKey);

  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${statusExpr} != 'Done'`,
        sql`${dueDateExpr} IS NOT NULL`,
        sql`${dueDateExpr} >= ${startOfToday}`,
        sql`${dueDateExpr} <= ${endOfRange}`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get inbox tasks (no due date, not completed).
 */
export function getInboxTasks(db: TypenoteDb): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${statusExpr} != 'Done'`,
        sql`(${dueDateExpr} IS NULL OR ${dueDateExpr} = '')`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get tasks by priority.
 */
export function getTasksByPriority(db: TypenoteDb, priority: TaskPriority): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const priorityExpr = sql`json_extract(${objects.properties}, '$.priority')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${priorityExpr} = ${priority}`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get completed tasks, optionally filtered by date range.
 */
export function getCompletedTasks(db: TypenoteDb, options?: CompletedTasksOptions): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;

  const conditions = [
    eq(objects.typeId, taskTypeId),
    isNull(objects.deletedAt),
    sql`${statusExpr} = 'Done'`,
  ];

  // Filter by updatedAt date range if provided
  if (options?.startDate) {
    conditions.push(gte(objects.updatedAt, new Date(options.startDate)));
  }
  if (options?.endDate) {
    const endDate = new Date(options.endDate);
    endDate.setDate(endDate.getDate() + 1); // Include the end date
    conditions.push(lt(objects.updatedAt, endDate));
  }

  const rows = db
    .select()
    .from(objects)
    .where(and(...conditions))
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get tasks due on a specific date (for Daily Note integration).
 * Includes completed tasks for history view.
 */
export function getTasksByDueDate(db: TypenoteDb, dateKey: string): TaskObject[] {
  const taskTypeId = getTaskTypeId(db);
  const startOfDay = getStartOfDay(dateKey);
  const endOfDay = getEndOfDay(dateKey);

  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;

  const rows = db
    .select()
    .from(objects)
    .where(
      and(
        eq(objects.typeId, taskTypeId),
        isNull(objects.deletedAt),
        sql`${dueDateExpr} >= ${startOfDay}`,
        sql`${dueDateExpr} <= ${endOfDay}`
      )
    )
    .all();

  return rows.map(rowToTaskObject);
}

/**
 * Get tasks using flexible query options.
 */
export function getTasks(db: TypenoteDb, options: GetTasksOptions): TaskSummary[] {
  const taskTypeId = getTaskTypeId(db);
  const conditions = [eq(objects.typeId, taskTypeId), isNull(objects.deletedAt)];
  const dueDateExpr = sql`json_extract(${objects.properties}, '$.due_date')`;
  const statusExpr = sql`json_extract(${objects.properties}, '$.status')`;
  const priorityExpr = sql`json_extract(${objects.properties}, '$.priority')`;

  if (options.status) {
    conditions.push(sql`${statusExpr} = ${options.status}`);
  }

  if (options.priority) {
    conditions.push(sql`${priorityExpr} = ${options.priority}`);
  }

  if (options.dueDateKey) {
    const startOfDay = getStartOfDay(options.dueDateKey);
    const endOfDay = getEndOfDay(options.dueDateKey);
    conditions.push(sql`${dueDateExpr} >= ${startOfDay}`);
    conditions.push(sql`${dueDateExpr} <= ${endOfDay}`);
  }

  if (options.dueAfter) {
    conditions.push(sql`${dueDateExpr} IS NOT NULL`);
    conditions.push(sql`${dueDateExpr} >= ${options.dueAfter}`);
  }

  if (options.dueBefore) {
    conditions.push(sql`${dueDateExpr} IS NOT NULL`);
    conditions.push(sql`${dueDateExpr} <= ${options.dueBefore}`);
  }

  if (options.hasDueDate === true) {
    conditions.push(sql`${dueDateExpr} IS NOT NULL`);
    conditions.push(sql`${dueDateExpr} != ''`);
  }

  if (options.hasDueDate === false) {
    conditions.push(sql`(${dueDateExpr} IS NULL OR ${dueDateExpr} = '')`);
  }

  const hasCompletionRange = options.completedAfter || options.completedBefore;
  if (hasCompletionRange) {
    conditions.push(sql`${statusExpr} = 'Done'`);
    if (options.completedAfter) {
      conditions.push(gte(objects.updatedAt, new Date(options.completedAfter)));
    }
    if (options.completedBefore) {
      conditions.push(lte(objects.updatedAt, new Date(options.completedBefore)));
    }
  } else if (!options.includeCompleted && !options.status) {
    conditions.push(sql`${statusExpr} != 'Done'`);
  }

  const limit = options.limit ?? -1;
  const offset = options.offset ?? 0;

  const rows = db
    .select({
      id: objects.id,
      title: objects.title,
      typeId: objects.typeId,
      updatedAt: objects.updatedAt,
      properties: objects.properties,
    })
    .from(objects)
    .where(and(...conditions))
    .orderBy(desc(objects.updatedAt))
    .limit(limit)
    .offset(offset)
    .all();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    typeId: row.typeId,
    typeKey: 'Task',
    updatedAt: row.updatedAt,
    properties: parseTaskProperties(row.properties),
  }));
}

// ============================================================================
// Mutation Functions
// ============================================================================

/**
 * Mark a task as completed (sets status to Done).
 */
export function completeTask(db: TypenoteDb, taskId: string): void {
  const task = db.select().from(objects).where(eq(objects.id, taskId)).limit(1).all()[0];

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const properties = task.properties ? JSON.parse(task.properties) : {};
  properties.status = 'Done';

  db.update(objects)
    .set({
      properties: JSON.stringify(properties),
      updatedAt: new Date(),
    })
    .where(eq(objects.id, taskId))
    .run();
}

/**
 * Reopen a task (sets status to Todo).
 */
export function reopenTask(db: TypenoteDb, taskId: string): void {
  const task = db.select().from(objects).where(eq(objects.id, taskId)).limit(1).all()[0];

  if (!task) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const properties = task.properties ? JSON.parse(task.properties) : {};
  properties.status = 'Todo';

  db.update(objects)
    .set({
      properties: JSON.stringify(properties),
      updatedAt: new Date(),
    })
    .where(eq(objects.id, taskId))
    .run();
}
