/**
 * Task Service Tests
 *
 * TDD: Write tests first, then implement taskService to make them pass.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import { seedBuiltInTypes } from './objectTypeService.js';
import { createObject } from './objectService.js';
import {
  getTodaysTasks,
  getOverdueTasks,
  getTasksByStatus,
  getUpcomingTasks,
  getInboxTasks,
  getTasksByPriority,
  getCompletedTasks,
  getTasksByDueDate,
  completeTask,
  reopenTask,
  type TaskObject,
} from './taskService.js';

// ============================================================================
// Test Helpers
// ============================================================================

function createTask(
  db: TypenoteDb,
  title: string,
  properties: {
    status: 'Backlog' | 'Todo' | 'InProgress' | 'Done';
    due_date?: string;
    priority?: 'Low' | 'Medium' | 'High';
  }
): TaskObject {
  const result = createObject(db, 'Task', title, properties);
  return {
    id: result.id,
    typeId: result.typeId,
    title: result.title,
    properties: properties as TaskObject['properties'],
    docVersion: result.docVersion,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

function getTodayDateKey(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function getDateKey(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().split('T')[0] ?? '';
}

function toDatetime(dateKey: string, time = '12:00:00.000Z'): string {
  return `${dateKey}T${time}`;
}

// ============================================================================
// Tests
// ============================================================================

describe('TaskService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
    seedBuiltInTypes(db);
  });

  afterEach(() => {
    closeDb(db);
  });

  describe('getTodaysTasks', () => {
    it('returns tasks due today', () => {
      const today = getTodayDateKey();
      createTask(db, 'Task due today', {
        status: 'Todo',
        due_date: toDatetime(today),
      });

      const tasks = getTodaysTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Task due today');
    });

    it('excludes completed tasks', () => {
      const today = getTodayDateKey();
      createTask(db, 'Completed task', {
        status: 'Done',
        due_date: toDatetime(today),
      });
      createTask(db, 'Open task', {
        status: 'Todo',
        due_date: toDatetime(today),
      });

      const tasks = getTodaysTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Open task');
    });

    it('excludes tasks due other days', () => {
      const today = getTodayDateKey();
      const tomorrow = getDateKey(1);
      const yesterday = getDateKey(-1);

      createTask(db, 'Task due today', {
        status: 'Todo',
        due_date: toDatetime(today),
      });
      createTask(db, 'Task due tomorrow', {
        status: 'Todo',
        due_date: toDatetime(tomorrow),
      });
      createTask(db, 'Task due yesterday', {
        status: 'Todo',
        due_date: toDatetime(yesterday),
      });

      const tasks = getTodaysTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Task due today');
    });

    it('returns empty array when no tasks due today', () => {
      const tomorrow = getDateKey(1);
      createTask(db, 'Task due tomorrow', {
        status: 'Todo',
        due_date: toDatetime(tomorrow),
      });

      const tasks = getTodaysTasks(db);

      expect(tasks).toHaveLength(0);
    });
  });

  describe('getOverdueTasks', () => {
    it('returns tasks past due date', () => {
      const yesterday = getDateKey(-1);
      createTask(db, 'Overdue task', {
        status: 'Todo',
        due_date: toDatetime(yesterday),
      });

      const tasks = getOverdueTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Overdue task');
    });

    it('excludes completed tasks', () => {
      const yesterday = getDateKey(-1);
      createTask(db, 'Completed overdue', {
        status: 'Done',
        due_date: toDatetime(yesterday),
      });
      createTask(db, 'Open overdue', {
        status: 'InProgress',
        due_date: toDatetime(yesterday),
      });

      const tasks = getOverdueTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Open overdue');
    });

    it('excludes tasks due today or later', () => {
      const yesterday = getDateKey(-1);
      const today = getTodayDateKey();
      const tomorrow = getDateKey(1);

      createTask(db, 'Overdue task', {
        status: 'Todo',
        due_date: toDatetime(yesterday),
      });
      createTask(db, 'Due today', {
        status: 'Todo',
        due_date: toDatetime(today),
      });
      createTask(db, 'Due tomorrow', {
        status: 'Todo',
        due_date: toDatetime(tomorrow),
      });

      const tasks = getOverdueTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Overdue task');
    });
  });

  describe('getTasksByStatus', () => {
    it('filters by status', () => {
      createTask(db, 'Backlog task', { status: 'Backlog' });
      createTask(db, 'Todo task', { status: 'Todo' });
      createTask(db, 'InProgress task', { status: 'InProgress' });
      createTask(db, 'Done task', { status: 'Done' });

      const inProgressTasks = getTasksByStatus(db, 'InProgress');

      expect(inProgressTasks).toHaveLength(1);
      expect(inProgressTasks[0]?.title).toBe('InProgress task');
    });

    it('returns all tasks with matching status', () => {
      createTask(db, 'Todo 1', { status: 'Todo' });
      createTask(db, 'Todo 2', { status: 'Todo' });
      createTask(db, 'Done', { status: 'Done' });

      const todoTasks = getTasksByStatus(db, 'Todo');

      expect(todoTasks).toHaveLength(2);
    });
  });

  describe('getUpcomingTasks', () => {
    it('returns tasks due within N days', () => {
      const today = getTodayDateKey();
      const in3Days = getDateKey(3);
      const in10Days = getDateKey(10);

      createTask(db, 'Due today', {
        status: 'Todo',
        due_date: toDatetime(today),
      });
      createTask(db, 'Due in 3 days', {
        status: 'Todo',
        due_date: toDatetime(in3Days),
      });
      createTask(db, 'Due in 10 days', {
        status: 'Todo',
        due_date: toDatetime(in10Days),
      });

      const tasks = getUpcomingTasks(db, 7);

      expect(tasks).toHaveLength(2);
      expect(tasks.map((t: TaskObject) => t.title)).toContain('Due today');
      expect(tasks.map((t: TaskObject) => t.title)).toContain('Due in 3 days');
    });

    it('excludes completed tasks', () => {
      const in3Days = getDateKey(3);
      createTask(db, 'Upcoming open', {
        status: 'Todo',
        due_date: toDatetime(in3Days),
      });
      createTask(db, 'Upcoming done', {
        status: 'Done',
        due_date: toDatetime(in3Days),
      });

      const tasks = getUpcomingTasks(db, 7);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Upcoming open');
    });

    it('excludes overdue tasks', () => {
      const yesterday = getDateKey(-1);
      const in3Days = getDateKey(3);

      createTask(db, 'Overdue', {
        status: 'Todo',
        due_date: toDatetime(yesterday),
      });
      createTask(db, 'Upcoming', {
        status: 'Todo',
        due_date: toDatetime(in3Days),
      });

      const tasks = getUpcomingTasks(db, 7);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Upcoming');
    });
  });

  describe('getInboxTasks', () => {
    it('returns tasks with no due date', () => {
      createTask(db, 'No due date', { status: 'Todo' });
      createTask(db, 'Has due date', {
        status: 'Todo',
        due_date: toDatetime(getTodayDateKey()),
      });

      const tasks = getInboxTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('No due date');
    });

    it('excludes completed tasks', () => {
      createTask(db, 'Open inbox', { status: 'Backlog' });
      createTask(db, 'Done inbox', { status: 'Done' });

      const tasks = getInboxTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Open inbox');
    });
  });

  describe('getTasksByPriority', () => {
    it('filters by priority', () => {
      createTask(db, 'Low priority', { status: 'Todo', priority: 'Low' });
      createTask(db, 'Medium priority', { status: 'Todo', priority: 'Medium' });
      createTask(db, 'High priority', { status: 'Todo', priority: 'High' });

      const highTasks = getTasksByPriority(db, 'High');

      expect(highTasks).toHaveLength(1);
      expect(highTasks[0]?.title).toBe('High priority');
    });

    it('excludes tasks without priority set', () => {
      createTask(db, 'No priority', { status: 'Todo' });
      createTask(db, 'Has priority', { status: 'Todo', priority: 'Medium' });

      const mediumTasks = getTasksByPriority(db, 'Medium');

      expect(mediumTasks).toHaveLength(1);
      expect(mediumTasks[0]?.title).toBe('Has priority');
    });
  });

  describe('getCompletedTasks', () => {
    it('returns completed tasks', () => {
      createTask(db, 'Done task', { status: 'Done' });
      createTask(db, 'Open task', { status: 'Todo' });

      const tasks = getCompletedTasks(db);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Done task');
    });

    it('filters by date range when updatedAt is provided', () => {
      // Note: This tests the date range filtering on updatedAt
      // In a real implementation, you might want completedAt field
      createTask(db, 'Completed task', { status: 'Done' });

      const tasks = getCompletedTasks(db, {
        startDate: getDateKey(-1),
        endDate: getDateKey(1),
      });

      // Task was just created, so updatedAt is today
      expect(tasks).toHaveLength(1);
    });
  });

  describe('getTasksByDueDate', () => {
    it('returns tasks due on specific date', () => {
      const targetDate = '2026-01-15';
      createTask(db, 'Due on target', {
        status: 'Todo',
        due_date: toDatetime(targetDate),
      });
      createTask(db, 'Due other day', {
        status: 'Todo',
        due_date: toDatetime('2026-01-16'),
      });

      const tasks = getTasksByDueDate(db, targetDate);

      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.title).toBe('Due on target');
    });

    it('includes completed tasks (for history view)', () => {
      const targetDate = '2026-01-15';
      createTask(db, 'Completed on date', {
        status: 'Done',
        due_date: toDatetime(targetDate),
      });
      createTask(db, 'Open on date', {
        status: 'Todo',
        due_date: toDatetime(targetDate),
      });

      const tasks = getTasksByDueDate(db, targetDate);

      expect(tasks).toHaveLength(2);
    });

    it('works for Daily Note integration', () => {
      // This simulates how Daily Note would query tasks
      const dateKey = '2026-01-15';
      createTask(db, 'Task for daily note', {
        status: 'Todo',
        due_date: toDatetime(dateKey),
      });

      const tasks = getTasksByDueDate(db, dateKey);

      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks).toHaveLength(1);
    });
  });

  describe('completeTask', () => {
    it('sets status to Done', () => {
      const task = createTask(db, 'To complete', { status: 'Todo' });

      completeTask(db, task.id);

      const tasks = getCompletedTasks(db);
      expect(tasks).toHaveLength(1);
      expect(tasks[0]?.properties.status).toBe('Done');
    });

    it('works for tasks in any status', () => {
      const backlog = createTask(db, 'From backlog', { status: 'Backlog' });
      const inProgress = createTask(db, 'From in progress', { status: 'InProgress' });

      completeTask(db, backlog.id);
      completeTask(db, inProgress.id);

      const completed = getCompletedTasks(db);
      expect(completed).toHaveLength(2);
    });
  });

  describe('reopenTask', () => {
    it('sets status to Todo', () => {
      const task = createTask(db, 'To reopen', { status: 'Done' });

      reopenTask(db, task.id);

      const todoTasks = getTasksByStatus(db, 'Todo');
      expect(todoTasks).toHaveLength(1);
      expect(todoTasks[0]?.title).toBe('To reopen');
    });
  });
});
