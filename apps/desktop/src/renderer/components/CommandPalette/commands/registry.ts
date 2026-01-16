/**
 * Command Registry
 *
 * Converts data sources (objects, search results) into command objects
 * for the command palette.
 */

import type { ObjectSummary } from '@typenote/api';
import type { NavigationCommand, CreationCommand } from './types.js';

/** Built-in type keys for object creation */
const BUILT_IN_TYPE_KEYS = ['Page', 'DailyNote', 'Task', 'Person', 'Event', 'Place'] as const;

/** Icon mapping by object type (string names for command palette) */
const TYPE_ICONS: Record<string, string> = {
  Page: 'FileText',
  DailyNote: 'Calendar',
  Task: 'CheckSquare',
  Person: 'User',
  Event: 'CalendarDays',
  Place: 'MapPin',
};

class CommandRegistry {
  /**
   * Convert ObjectSummary[] to NavigationCommand[]
   */
  fromObjectList(objects: ObjectSummary[]): NavigationCommand[] {
    return objects.map((obj) => ({
      id: `nav:${obj.id}`,
      type: 'navigation' as const,
      label: obj.title,
      description: obj.typeKey,
      objectId: obj.id,
      objectType: obj.typeKey,
      icon: this.getIconForType(obj.typeKey),
    }));
  }

  /**
   * Generate creation commands for all built-in types
   */
  getCreationCommands(query?: string): CreationCommand[] {
    const trimmedQuery = query?.trim();

    return BUILT_IN_TYPE_KEYS.map((typeKey) => ({
      id: `create:${typeKey}`,
      type: 'creation' as const,
      label: `Create ${typeKey}`,
      description: trimmedQuery ? `"${trimmedQuery}"` : undefined,
      typeKey,
      defaultTitle: trimmedQuery || undefined,
      icon: this.getIconForType(typeKey),
      keywords: [typeKey.toLowerCase(), 'new', 'create'],
    }));
  }

  /**
   * Get icon name for a given type key
   */
  private getIconForType(typeKey: string): string {
    return TYPE_ICONS[typeKey] ?? 'File';
  }
}

export const commandRegistry = new CommandRegistry();
