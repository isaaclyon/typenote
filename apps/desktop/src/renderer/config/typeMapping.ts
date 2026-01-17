/**
 * Type Key to ObjectType Mapping
 *
 * Maps TypeNote's type keys (e.g., "Page", "DailyNote", "Project") to
 * the design-system's ObjectType for consistent visual rendering.
 */

import type { ObjectType } from '@typenote/design-system';

/**
 * Mapping from typeKey strings to ObjectType values.
 * Used for RefNode rendering in the editor.
 */
export const TYPE_KEY_TO_OBJECT_TYPE: Record<string, ObjectType> = {
  Page: 'note',
  DailyNote: 'note',
  Project: 'project',
  Task: 'task',
  Person: 'person',
  Resource: 'resource',
} as const;

/**
 * Get the ObjectType for a given typeKey.
 * Falls back to 'note' for unknown type keys.
 *
 * @param typeKey - The type key from the object (e.g., "Page", "Project")
 * @returns The corresponding ObjectType for visual rendering
 */
export function getObjectTypeForKey(typeKey: string): ObjectType {
  return TYPE_KEY_TO_OBJECT_TYPE[typeKey] ?? 'note';
}
