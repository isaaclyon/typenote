/**
 * Task API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  TaskStatusSchema,
  TaskPrioritySchema,
  TaskPropertiesSchema,
  TaskSummarySchema,
  GetTasksOptionsSchema,
  type TaskProperties,
  type TaskSummary,
  type GetTasksOptions,
} from './task.js';

// ============================================================================
// TaskStatusSchema
// ============================================================================

describe('TaskStatusSchema', () => {
  it('validates Backlog status', () => {
    const result = TaskStatusSchema.safeParse('Backlog');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Backlog');
    }
  });

  it('validates Todo status', () => {
    const result = TaskStatusSchema.safeParse('Todo');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Todo');
    }
  });

  it('validates InProgress status', () => {
    const result = TaskStatusSchema.safeParse('InProgress');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('InProgress');
    }
  });

  it('validates Done status', () => {
    const result = TaskStatusSchema.safeParse('Done');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Done');
    }
  });

  it('rejects invalid status', () => {
    const result = TaskStatusSchema.safeParse('Invalid');
    expect(result.success).toBe(false);
  });

  it('rejects lowercase status', () => {
    const result = TaskStatusSchema.safeParse('todo');
    expect(result.success).toBe(false);
  });

  it('rejects empty string', () => {
    const result = TaskStatusSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TaskPrioritySchema
// ============================================================================

describe('TaskPrioritySchema', () => {
  it('validates Low priority', () => {
    const result = TaskPrioritySchema.safeParse('Low');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Low');
    }
  });

  it('validates Medium priority', () => {
    const result = TaskPrioritySchema.safeParse('Medium');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('Medium');
    }
  });

  it('validates High priority', () => {
    const result = TaskPrioritySchema.safeParse('High');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('High');
    }
  });

  it('rejects invalid priority', () => {
    const result = TaskPrioritySchema.safeParse('Critical');
    expect(result.success).toBe(false);
  });

  it('rejects lowercase priority', () => {
    const result = TaskPrioritySchema.safeParse('high');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TaskPropertiesSchema
// ============================================================================

describe('TaskPropertiesSchema', () => {
  it('validates complete task properties', () => {
    const props: TaskProperties = {
      status: 'Todo',
      due_date: '2026-01-15T10:00:00.000Z',
      priority: 'High',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('Todo');
      expect(result.data.due_date).toBe('2026-01-15T10:00:00.000Z');
      expect(result.data.priority).toBe('High');
    }
  });

  it('validates task with only required status', () => {
    const props: TaskProperties = {
      status: 'Backlog',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('Backlog');
      expect(result.data.due_date).toBeUndefined();
      expect(result.data.priority).toBeUndefined();
    }
  });

  it('validates task with status and due_date only', () => {
    const props: TaskProperties = {
      status: 'InProgress',
      due_date: '2026-02-01T09:00:00.000Z',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBeUndefined();
    }
  });

  it('validates task with status and priority only', () => {
    const props: TaskProperties = {
      status: 'Done',
      priority: 'Low',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.due_date).toBeUndefined();
    }
  });

  it('rejects missing status', () => {
    const props = {
      due_date: '2026-01-15T10:00:00.000Z',
      priority: 'High',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(false);
  });

  it('rejects empty object', () => {
    const result = TaskPropertiesSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid status value', () => {
    const props = {
      status: 'Pending',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority value', () => {
    const props = {
      status: 'Todo',
      priority: 'Urgent',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(false);
  });

  it('rejects invalid due_date format', () => {
    const props = {
      status: 'Todo',
      due_date: '2026-01-15', // Missing time component
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(false);
  });

  it('rejects non-ISO due_date', () => {
    const props = {
      status: 'Todo',
      due_date: 'January 15, 2026',
    };
    const result = TaskPropertiesSchema.safeParse(props);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// GetTasksOptionsSchema
// ============================================================================

describe('GetTasksOptionsSchema', () => {
  it('validates empty options', () => {
    const options: GetTasksOptions = {};
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with status filter', () => {
    const options: GetTasksOptions = {
      status: 'Todo',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with priority filter', () => {
    const options: GetTasksOptions = {
      priority: 'High',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with dueDateKey', () => {
    const options: GetTasksOptions = {
      dueDateKey: '2026-01-15',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with dueBefore', () => {
    const options: GetTasksOptions = {
      dueBefore: '2026-01-15T23:59:59.000Z',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with dueAfter', () => {
    const options: GetTasksOptions = {
      dueAfter: '2026-01-01T00:00:00.000Z',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with date range', () => {
    const options: GetTasksOptions = {
      dueAfter: '2026-01-01T00:00:00.000Z',
      dueBefore: '2026-01-31T23:59:59.000Z',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with includeCompleted', () => {
    const options: GetTasksOptions = {
      includeCompleted: true,
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with pagination', () => {
    const options: GetTasksOptions = {
      limit: 10,
      offset: 20,
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('validates options with all fields', () => {
    const options: GetTasksOptions = {
      status: 'InProgress',
      priority: 'Medium',
      dueDateKey: '2026-01-15',
      dueBefore: '2026-01-31T23:59:59.000Z',
      dueAfter: '2026-01-01T00:00:00.000Z',
      completedAfter: '2026-01-10T00:00:00.000Z',
      completedBefore: '2026-01-20T23:59:59.000Z',
      includeCompleted: false,
      hasDueDate: true,
      limit: 50,
      offset: 0,
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const options = {
      status: 'InvalidStatus',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects invalid priority', () => {
    const options = {
      priority: 'InvalidPriority',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects negative limit', () => {
    const options = {
      limit: -1,
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects negative offset', () => {
    const options = {
      offset: -5,
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });

  it('rejects invalid hasDueDate', () => {
    const options = {
      hasDueDate: 'yes',
    };
    const result = GetTasksOptionsSchema.safeParse(options);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TaskSummarySchema
// ============================================================================

describe('TaskSummarySchema', () => {
  it('validates a task summary with properties', () => {
    const summary: TaskSummary = {
      id: '01HZX1X5E1G8G5Q2B2V9XG4M2F',
      title: 'Plan sprint',
      typeId: '01HZX1X5E1G8G5Q2B2V9XG4M2G',
      typeKey: 'Task',
      updatedAt: new Date('2026-01-15T12:00:00.000Z'),
      properties: {
        status: 'Todo',
        due_date: '2026-01-20T09:00:00.000Z',
        priority: 'High',
      },
    };

    const result = TaskSummarySchema.safeParse(summary);
    expect(result.success).toBe(true);
  });
});
