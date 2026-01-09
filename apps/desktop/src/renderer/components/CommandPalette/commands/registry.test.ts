/**
 * Tests for the command registry.
 */

import { describe, it, expect } from 'vitest';
import { commandRegistry } from './registry.js';
import type { ObjectSummary } from '@typenote/api';

// Helper to create test ObjectSummary
function makeObject(
  overrides: Partial<ObjectSummary> & { id: string; title: string }
): ObjectSummary {
  return {
    typeId: 'type_page',
    typeKey: 'Page',
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CommandRegistry', () => {
  describe('fromObjectList', () => {
    it('converts ObjectSummary[] to NavigationCommand[]', () => {
      const objects: ObjectSummary[] = [
        makeObject({ id: 'obj_123', title: 'Meeting Notes' }),
        makeObject({ id: 'obj_456', title: 'Project Ideas' }),
      ];

      const commands = commandRegistry.fromObjectList(objects);

      expect(commands).toHaveLength(2);
      expect(commands[0]).toMatchObject({
        id: 'nav:obj_123',
        type: 'navigation',
        label: 'Meeting Notes',
        objectId: 'obj_123',
        objectType: 'Page',
      });
      expect(commands[1]).toMatchObject({
        id: 'nav:obj_456',
        type: 'navigation',
        label: 'Project Ideas',
        objectId: 'obj_456',
        objectType: 'Page',
      });
    });

    it('assigns correct icons based on object type', () => {
      const objects: ObjectSummary[] = [
        makeObject({ id: 'obj_1', title: 'A Page', typeKey: 'Page' }),
        makeObject({ id: 'obj_2', title: 'A Task', typeKey: 'Task' }),
        makeObject({ id: 'obj_3', title: 'A Person', typeKey: 'Person' }),
        makeObject({ id: 'obj_4', title: 'An Event', typeKey: 'Event' }),
        makeObject({ id: 'obj_5', title: 'A Place', typeKey: 'Place' }),
        makeObject({ id: 'obj_6', title: 'Daily Note', typeKey: 'DailyNote' }),
      ];

      const commands = commandRegistry.fromObjectList(objects);

      expect(commands[0]?.icon).toBe('FileText');
      expect(commands[1]?.icon).toBe('CheckSquare');
      expect(commands[2]?.icon).toBe('User');
      expect(commands[3]?.icon).toBe('CalendarDays');
      expect(commands[4]?.icon).toBe('MapPin');
      expect(commands[5]?.icon).toBe('Calendar');
    });

    it('returns empty array for empty input', () => {
      const commands = commandRegistry.fromObjectList([]);
      expect(commands).toEqual([]);
    });
  });

  describe('getCreationCommands', () => {
    it('returns creation commands for all built-in types', () => {
      const commands = commandRegistry.getCreationCommands();

      expect(commands).toHaveLength(6);

      const typeKeys = commands.map((c) => c.typeKey);
      expect(typeKeys).toContain('Page');
      expect(typeKeys).toContain('DailyNote');
      expect(typeKeys).toContain('Task');
      expect(typeKeys).toContain('Person');
      expect(typeKeys).toContain('Event');
      expect(typeKeys).toContain('Place');
    });

    it('all commands have type "creation"', () => {
      const commands = commandRegistry.getCreationCommands();
      expect(commands.every((c: { type: string }) => c.type === 'creation')).toBe(true);
    });

    it('includes query as defaultTitle when provided', () => {
      const commands = commandRegistry.getCreationCommands('My New Page');

      const pageCommand = commands.find((c: { typeKey: string }) => c.typeKey === 'Page');
      expect(pageCommand?.defaultTitle).toBe('My New Page');
      expect(pageCommand?.description).toBe('"My New Page"');
    });

    it('trims whitespace from query', () => {
      const commands = commandRegistry.getCreationCommands('  trimmed  ');

      const pageCommand = commands.find((c: { typeKey: string }) => c.typeKey === 'Page');
      expect(pageCommand?.defaultTitle).toBe('trimmed');
    });

    it('has no defaultTitle when query is empty', () => {
      const commands = commandRegistry.getCreationCommands('');

      const pageCommand = commands.find((c: { typeKey: string }) => c.typeKey === 'Page');
      expect(pageCommand?.defaultTitle).toBeUndefined();
    });

    it('assigns correct icons to each type', () => {
      const commands = commandRegistry.getCreationCommands();

      const iconByType = Object.fromEntries(
        commands.map((c: { typeKey: string; icon?: string | undefined }) => [c.typeKey, c.icon])
      );
      expect(iconByType['Page']).toBe('FileText');
      expect(iconByType['Task']).toBe('CheckSquare');
      expect(iconByType['DailyNote']).toBe('Calendar');
    });
  });

  describe('getIconForType', () => {
    it('returns File for unknown types', () => {
      const objects: ObjectSummary[] = [
        makeObject({ id: 'obj_1', title: 'Unknown', typeKey: 'CustomType' }),
      ];

      const commands = commandRegistry.fromObjectList(objects);
      expect(commands[0]?.icon).toBe('File');
    });
  });
});
