import { describe, expect, it } from 'vitest';

import { isBlockItem, isHeadingItem, isRefItem, parseQuery } from './RefSuggestion.js';

describe('RefSuggestion', () => {
  describe('parseQuery', () => {
    it('parses object mode', () => {
      expect(parseQuery('Project Plan')).toEqual({
        mode: 'object',
        objectQuery: 'Project Plan',
        subQuery: '',
        alias: null,
      });
    });

    it('parses alias syntax', () => {
      expect(parseQuery('Project Plan|Roadmap')).toEqual({
        mode: 'object',
        objectQuery: 'Project Plan',
        subQuery: '',
        alias: 'Roadmap',
      });
    });

    it('parses heading mode syntax', () => {
      expect(parseQuery('Project Plan#Intro')).toEqual({
        mode: 'heading',
        objectQuery: 'Project Plan',
        subQuery: 'Intro',
        alias: null,
      });
    });

    it('parses block mode syntax', () => {
      expect(parseQuery('Project Plan#^abc123')).toEqual({
        mode: 'block',
        objectQuery: 'Project Plan',
        subQuery: 'abc123',
        alias: null,
      });
    });

    it('parses heading aliases', () => {
      expect(parseQuery('Project Plan#Intro|Summary')).toEqual({
        mode: 'heading',
        objectQuery: 'Project Plan',
        subQuery: 'Intro',
        alias: 'Summary',
      });
    });

    it('trims whitespace in queries and aliases', () => {
      expect(parseQuery('  Project Plan  |  Roadmap  ')).toEqual({
        mode: 'object',
        objectQuery: 'Project Plan',
        subQuery: '',
        alias: 'Roadmap',
      });
    });
  });

  describe('type guards', () => {
    it('detects ref items', () => {
      const item = { objectId: 'obj-1', objectType: 'Page', title: 'Project Plan' };
      expect(isRefItem(item)).toBe(true);
      expect(isHeadingItem(item)).toBe(false);
      expect(isBlockItem(item)).toBe(false);
    });

    it('detects heading items', () => {
      const item = { level: 2 as const, text: 'Overview' };
      expect(isHeadingItem(item)).toBe(true);
      expect(isRefItem(item)).toBe(false);
      expect(isBlockItem(item)).toBe(false);
    });

    it('detects block items', () => {
      const item = { ksuid: 'ksuid-1', preview: 'Line preview', blockType: 'paragraph' };
      expect(isBlockItem(item)).toBe(true);
      expect(isRefItem(item)).toBe(false);
      expect(isHeadingItem(item)).toBe(false);
    });
  });
});
