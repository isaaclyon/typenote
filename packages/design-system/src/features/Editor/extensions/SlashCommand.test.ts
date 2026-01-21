import { describe, expect, it } from 'vitest';

import type { SlashCommandItem } from './SlashCommand.js';
import { filterSlashCommands } from './SlashCommand.js';

const DummyIcon = (() => null) as SlashCommandItem['icon'];

function makeItem(title: string, keywords: string[]): SlashCommandItem {
  return {
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    icon: DummyIcon,
    keywords,
    command: () => {},
  };
}

describe('filterSlashCommands', () => {
  const items = [
    makeItem('Paragraph', ['text', 'p']),
    makeItem('Heading 1', ['h1', 'heading 1']),
    makeItem('Numbered List', ['numbered', 'ol']),
  ];

  it('returns all items when query is empty', () => {
    expect(filterSlashCommands(items, '')).toBe(items);
  });

  it('matches title substrings', () => {
    expect(filterSlashCommands(items, 'head')).toEqual([items[1]]);
  });

  it('matches keyword substrings', () => {
    expect(filterSlashCommands(items, 'ol')).toEqual([items[2]]);
  });

  it('matches case-insensitively', () => {
    expect(filterSlashCommands(items, 'PARA')).toEqual([items[0]]);
  });
});
