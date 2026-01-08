/**
 * Task CLI Commands
 *
 * Provides commands for task management (today, overdue, inbox, upcoming, etc.).
 */

import { Command } from 'commander';
import {
  getTodaysTasks,
  getOverdueTasks,
  getTasksByStatus,
  getUpcomingTasks,
  getInboxTasks,
  getTasksByPriority,
  getCompletedTasks,
  completeTask,
  reopenTask,
} from '@typenote/storage';
import { initDb, closeDb } from './db.js';

// ============================================================================
// Task Command
// ============================================================================

export function registerTaskCommand(program: Command): void {
  const taskCmd = program.command('task').description('Task management commands');

  taskCmd
    .command('today')
    .description("List today's tasks")
    .action(() => {
      const db = initDb();
      try {
        const tasks = getTodaysTasks(db);
        if (tasks.length === 0) {
          console.log('No tasks due today.');
        } else {
          console.log(`Today's tasks (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('overdue')
    .description('List overdue tasks')
    .action(() => {
      const db = initDb();
      try {
        const tasks = getOverdueTasks(db);
        if (tasks.length === 0) {
          console.log('No overdue tasks.');
        } else {
          console.log(`Overdue tasks (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('inbox')
    .description('List tasks without a due date')
    .action(() => {
      const db = initDb();
      try {
        const tasks = getInboxTasks(db);
        if (tasks.length === 0) {
          console.log('No inbox tasks.');
        } else {
          console.log(`Inbox tasks (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('upcoming')
    .description('List upcoming tasks')
    .option('-d, --days <number>', 'Days ahead to look', '7')
    .action((options: { days: string }) => {
      const db = initDb();
      try {
        const days = parseInt(options.days, 10);
        const tasks = getUpcomingTasks(db, days);
        if (tasks.length === 0) {
          console.log(`No tasks due in the next ${days} days.`);
        } else {
          console.log(`Upcoming tasks in ${days} days (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('by-status')
    .description('List tasks by status')
    .argument('<status>', 'Status: Backlog, Todo, InProgress, Done')
    .action((status: string) => {
      const db = initDb();
      try {
        const validStatuses = ['Backlog', 'Todo', 'InProgress', 'Done'];
        if (!validStatuses.includes(status)) {
          console.error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
          process.exit(1);
        }
        const tasks = getTasksByStatus(db, status as 'Backlog' | 'Todo' | 'InProgress' | 'Done');
        if (tasks.length === 0) {
          console.log(`No tasks with status "${status}".`);
        } else {
          console.log(`Tasks with status "${status}" (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('by-priority')
    .description('List tasks by priority')
    .argument('<priority>', 'Priority: Low, Medium, High')
    .action((priority: string) => {
      const db = initDb();
      try {
        const validPriorities = ['Low', 'Medium', 'High'];
        if (!validPriorities.includes(priority)) {
          console.error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
          process.exit(1);
        }
        const tasks = getTasksByPriority(db, priority as 'Low' | 'Medium' | 'High');
        if (tasks.length === 0) {
          console.log(`No tasks with priority "${priority}".`);
        } else {
          console.log(`Tasks with priority "${priority}" (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('completed')
    .description('List completed tasks')
    .option('--start <date>', 'Start date (YYYY-MM-DD)')
    .option('--end <date>', 'End date (YYYY-MM-DD)')
    .action((options: { start?: string; end?: string }) => {
      const db = initDb();
      try {
        // Build options object only with defined values (exactOptionalPropertyTypes)
        const queryOptions: { startDate?: string; endDate?: string } = {};
        if (options.start !== undefined) queryOptions.startDate = options.start;
        if (options.end !== undefined) queryOptions.endDate = options.end;
        const tasks = getCompletedTasks(db, queryOptions);
        if (tasks.length === 0) {
          console.log('No completed tasks found.');
        } else {
          console.log(`Completed tasks (${tasks.length}):`);
          console.log(JSON.stringify(tasks, null, 2));
        }
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('complete')
    .description('Mark a task as completed')
    .argument('<taskId>', 'Task ID')
    .action((taskId: string) => {
      const db = initDb();
      try {
        completeTask(db, taskId);
        console.log(`Task ${taskId} marked as completed.`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });

  taskCmd
    .command('reopen')
    .description('Reopen a completed task')
    .argument('<taskId>', 'Task ID')
    .action((taskId: string) => {
      const db = initDb();
      try {
        reopenTask(db, taskId);
        console.log(`Task ${taskId} reopened.`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      } finally {
        closeDb(db);
      }
    });
}
