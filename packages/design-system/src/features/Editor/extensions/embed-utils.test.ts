import { describe, it, expect } from 'vitest';

import { buildEmbedSyntax, formatEmbedDisplayTitle, suppressNestedEmbeds } from './embed-utils.js';

describe('embed utils', () => {
  describe('buildEmbedSyntax', () => {
    it('builds basic object syntax', () => {
      expect(buildEmbedSyntax({ displayTitle: 'Project Roadmap' })).toBe('![[Project Roadmap]]');
    });

    it('builds alias syntax', () => {
      expect(buildEmbedSyntax({ displayTitle: 'Project Roadmap', alias: 'Roadmap' })).toBe(
        '![[Project Roadmap|Roadmap]]'
      );
    });

    it('builds heading target syntax', () => {
      expect(buildEmbedSyntax({ displayTitle: 'Project Roadmap', headingText: 'Q1 Goals' })).toBe(
        '![[Project Roadmap#Q1 Goals]]'
      );
    });

    it('builds block target syntax', () => {
      expect(buildEmbedSyntax({ displayTitle: 'Project Roadmap', blockId: 'abc123' })).toBe(
        '![[Project Roadmap#^abc123]]'
      );
    });

    it('builds heading target with alias syntax', () => {
      expect(
        buildEmbedSyntax({
          displayTitle: 'Project Roadmap',
          headingText: 'Q1 Goals',
          alias: 'Roadmap',
        })
      ).toBe('![[Project Roadmap#Q1 Goals|Roadmap]]');
    });
  });

  describe('formatEmbedDisplayTitle', () => {
    it('prefers alias when provided', () => {
      expect(formatEmbedDisplayTitle({ displayTitle: 'Project Roadmap', alias: 'Roadmap' })).toBe(
        'Roadmap'
      );
    });

    it('appends heading suffix when present', () => {
      expect(
        formatEmbedDisplayTitle({ displayTitle: 'Project Roadmap', headingText: 'Q1 Goals' })
      ).toBe('Project Roadmap > Q1 Goals');
    });

    it('appends block suffix when present', () => {
      expect(formatEmbedDisplayTitle({ displayTitle: 'Project Roadmap', blockId: 'abc123' })).toBe(
        'Project Roadmap#^abc123'
      );
    });

    it('falls back to Untitled', () => {
      expect(formatEmbedDisplayTitle({ displayTitle: '' })).toBe('Untitled');
    });
  });

  describe('suppressNestedEmbeds', () => {
    it('replaces embed nodes with placeholder paragraphs', () => {
      expect(suppressNestedEmbeds({ type: 'embedNode' })).toEqual({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Embedded content hidden',
          },
        ],
      });
    });

    it('recursively replaces nested embed nodes', () => {
      const result = suppressNestedEmbeds({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Intro' }],
          },
          {
            type: 'embedNode',
          },
        ],
      });

      expect(result).toEqual({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Intro' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Embedded content hidden',
              },
            ],
          },
        ],
      });
    });

    it('keeps non-embed content intact', () => {
      expect(
        suppressNestedEmbeds({
          type: 'paragraph',
          content: [{ type: 'text', text: 'Keep me' }],
        })
      ).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Keep me' }],
      });
    });
  });
});
