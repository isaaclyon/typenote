/**
 * Task API contracts.
 *
 * Task is a built-in object type for tracking tasks with status,
 * due dates, and priority. Integrates with Daily Notes via
 * query-based due date lookups.
 */

import { z } from 'zod';

// ============================================================================
// Task Status
// ============================================================================

/**
 * Task status values for Kanban-style workflow.
 * - Backlog: Not yet scheduled for work
 * - Todo: Ready to be worked on
 * - InProgress: Currently being worked on
 * - Done: Completed
 */
export const TaskStatusSchema = z.enum(['Backlog', 'Todo', 'InProgress', 'Done']);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/**
 * All task status values as an array for iteration.
 */
export const TASK_STATUSES: readonly TaskStatus[] = TaskStatusSchema.options;

// ============================================================================
// Task Priority
// ============================================================================

/**
 * Task priority levels.
 */
export const TaskPrioritySchema = z.enum(['Low', 'Medium', 'High']);

export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

/**
 * All task priority values as an array for iteration.
 */
export const TASK_PRIORITIES: readonly TaskPriority[] = TaskPrioritySchema.options;

// ============================================================================
// Task Properties
// ============================================================================

/**
 * Task object properties schema.
 * These are the typed properties stored in the object's properties JSON.
 */
export const TaskPropertiesSchema = z.object({
  /** Current task status (required) */
  status: TaskStatusSchema,
  /** Due date in ISO 8601 datetime format (optional) */
  due_date: z.string().datetime().optional(),
  /** Task priority (optional) */
  priority: TaskPrioritySchema.optional(),
});

export type TaskProperties = z.infer<typeof TaskPropertiesSchema>;

// ============================================================================
// Query Options
// ============================================================================

/**
 * Options for querying tasks.
 * Used by taskService methods for filtering and pagination.
 */
export const GetTasksOptionsSchema = z.object({
  /** Filter by status */
  status: TaskStatusSchema.optional(),
  /** Filter by priority */
  priority: TaskPrioritySchema.optional(),
  /** Filter by due date (YYYY-MM-DD format for Daily Note integration) */
  dueDateKey: z.string().optional(),
  /** Filter tasks due before this datetime */
  dueBefore: z.string().datetime().optional(),
  /** Filter tasks due after this datetime */
  dueAfter: z.string().datetime().optional(),
  /** Include completed tasks (default: false for most queries) */
  includeCompleted: z.boolean().optional(),
  /** Maximum number of results */
  limit: z.number().int().nonnegative().optional(),
  /** Offset for pagination */
  offset: z.number().int().nonnegative().optional(),
});

export type GetTasksOptions = z.infer<typeof GetTasksOptionsSchema>;
