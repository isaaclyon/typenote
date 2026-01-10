import { describe, it, expect } from 'vitest';
import { filterCommands, getCommandGroups } from './commandRegistry.js';

describe('SlashCommand Registry', () => {
  describe('filterCommands', () => {
    it('returns all 15 commands when query is empty', () => {
      const commands = filterCommands('');
      expect(commands).toHaveLength(15);
    });

    it('filters by label (case insensitive)', () => {
      const commands = filterCommands('heading');
      expect(commands).toHaveLength(6);
      expect(commands.every((cmd) => cmd.label.toLowerCase().includes('heading'))).toBe(true);
    });

    it('filters by alias', () => {
      const commands = filterCommands('h1');
      expect(commands).toHaveLength(1);
      expect(commands[0]?.id).toBe('heading-1');
    });

    it('filters by description', () => {
      const commands = filterCommands('checkbox');
      expect(commands).toHaveLength(1);
      expect(commands[0]?.id).toBe('task-list');
    });

    it('returns empty array when no matches', () => {
      const commands = filterCommands('nonexistent-command-xyz');
      expect(commands).toHaveLength(0);
    });
  });

  describe('getCommandGroups', () => {
    it('groups commands by section', () => {
      const groups = getCommandGroups();

      // Should have 5 sections: Basic, Headings, Lists, Formatting, Advanced
      expect(groups).toHaveLength(5);

      // Check each section has expected counts
      const basicGroup = groups.find((g) => g.section === 'Basic');
      expect(basicGroup?.commands).toHaveLength(1);

      const headingsGroup = groups.find((g) => g.section === 'Headings');
      expect(headingsGroup?.commands).toHaveLength(6);

      const listsGroup = groups.find((g) => g.section === 'Lists');
      expect(listsGroup?.commands).toHaveLength(3);

      const formattingGroup = groups.find((g) => g.section === 'Formatting');
      expect(formattingGroup?.commands).toHaveLength(3);

      const advancedGroup = groups.find((g) => g.section === 'Advanced');
      expect(advancedGroup?.commands).toHaveLength(2);
    });

    it('excludes empty sections', () => {
      const groups = getCommandGroups();

      // All groups should have at least one command
      expect(groups.every((g) => g.commands.length > 0)).toBe(true);
    });
  });
});
