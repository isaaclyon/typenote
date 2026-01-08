/**
 * Built-in Type Definitions.
 *
 * These define the name, pluralName, icon, color, and property schema
 * for each built-in object type in TypeNote.
 */

import type { BuiltInTypeKey, TypeSchema } from '@typenote/api';

/**
 * Configuration for a built-in object type.
 */
export interface BuiltInTypeConfig {
  name: string;
  pluralName: string;
  icon: string | null;
  color: string;
  schema: TypeSchema | null;
}

/**
 * Built-in type configurations.
 * These are seeded on database initialization and cannot be deleted.
 */
export const BUILT_IN_TYPES: Record<BuiltInTypeKey, BuiltInTypeConfig> = {
  DailyNote: {
    name: 'Daily Note',
    pluralName: 'Daily Notes',
    icon: 'calendar',
    color: '#F59E0B', // Amber
    schema: {
      properties: [
        {
          key: 'date_key',
          name: 'Date',
          type: 'date',
          required: true,
        },
      ],
    },
  },
  Page: {
    name: 'Page',
    pluralName: 'Pages',
    icon: 'file-text',
    color: '#6B7280', // Gray
    schema: null, // No required properties
  },
  Person: {
    name: 'Person',
    pluralName: 'People',
    icon: 'user',
    color: '#3B82F6', // Blue
    schema: {
      properties: [
        {
          key: 'email',
          name: 'Email',
          type: 'text',
          required: false,
        },
      ],
    },
  },
  Event: {
    name: 'Event',
    pluralName: 'Events',
    icon: 'calendar-clock',
    color: '#8B5CF6', // Purple
    schema: {
      properties: [
        {
          key: 'start_date',
          name: 'Start Date',
          type: 'datetime',
          required: false,
        },
        {
          key: 'end_date',
          name: 'End Date',
          type: 'datetime',
          required: false,
        },
      ],
    },
  },
  Place: {
    name: 'Place',
    pluralName: 'Places',
    icon: 'map-pin',
    color: '#10B981', // Green
    schema: {
      properties: [
        {
          key: 'address',
          name: 'Address',
          type: 'text',
          required: false,
        },
      ],
    },
  },
  Task: {
    name: 'Task',
    pluralName: 'Tasks',
    icon: 'check-square',
    color: '#EF4444', // Red
    schema: {
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: true,
          options: ['Backlog', 'Todo', 'InProgress', 'Done'],
          defaultValue: 'Todo',
        },
        {
          key: 'due_date',
          name: 'Due Date',
          type: 'datetime',
          required: false,
        },
        {
          key: 'priority',
          name: 'Priority',
          type: 'select',
          required: false,
          options: ['Low', 'Medium', 'High'],
        },
      ],
    },
  },
};
