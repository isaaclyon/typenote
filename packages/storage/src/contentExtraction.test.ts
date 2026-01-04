import { describe, it, expect } from 'vitest';
import { extractReferences, extractPlainText } from './contentExtraction.js';

describe('extractReferences', () => {
  describe('paragraph content', () => {
    it('extracts object refs from paragraph content', () => {
      const content = {
        inline: [
          { t: 'text', text: 'See ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
      };

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });

    it('extracts block refs from paragraph content', () => {
      const content = {
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: {
              kind: 'block',
              objectId: '01ABC123456789012345678',
              blockId: '01DEF987654321098765432',
            },
          },
        ],
      };

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([
        {
          kind: 'block',
          objectId: '01ABC123456789012345678',
          blockId: '01DEF987654321098765432',
        },
      ]);
    });

    it('extracts multiple refs from paragraph', () => {
      const content = {
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01AAA000000000000000000' },
          },
          { t: 'text', text: ' and ' },
          {
            t: 'ref',
            mode: 'embed',
            target: { kind: 'object', objectId: '01BBB000000000000000000' },
          },
        ],
      };

      const refs = extractReferences('paragraph', content);

      expect(refs).toHaveLength(2);
      expect(refs[0]).toEqual({
        kind: 'object',
        objectId: '01AAA000000000000000000',
      });
      expect(refs[1]).toEqual({
        kind: 'object',
        objectId: '01BBB000000000000000000',
      });
    });
  });

  describe('link children', () => {
    it('extracts refs from link children', () => {
      const content = {
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [
              {
                t: 'ref',
                mode: 'link',
                target: { kind: 'object', objectId: '01ABC123456789012345678' },
              },
            ],
          },
        ],
      };

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });

  describe('heading content', () => {
    it('extracts refs from heading inline', () => {
      const content = {
        level: 2,
        inline: [
          { t: 'text', text: 'About ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
      };

      const refs = extractReferences('heading', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });

  describe('list_item content', () => {
    it('extracts refs from list_item inline', () => {
      const content = {
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
        checked: false,
      };

      const refs = extractReferences('list_item', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });

  describe('table content', () => {
    it('extracts refs from table cells', () => {
      const content = {
        rows: [
          {
            cells: [
              [{ t: 'text', text: 'Name' }],
              [
                {
                  t: 'ref',
                  mode: 'link',
                  target: { kind: 'object', objectId: '01ABC123456789012345678' },
                },
              ],
            ],
          },
        ],
      };

      const refs = extractReferences('table', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });

  describe('footnote_def content', () => {
    it('extracts refs from footnote_def inline', () => {
      const content = {
        key: '1',
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
      };

      const refs = extractReferences('footnote_def', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });

  describe('blocks without refs', () => {
    it('returns empty array for code_block', () => {
      const content = { language: 'typescript', code: 'const x = 1;' };

      const refs = extractReferences('code_block', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for thematic_break', () => {
      const content = {};

      const refs = extractReferences('thematic_break', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for list (container only)', () => {
      const content = { kind: 'bullet' };

      const refs = extractReferences('list', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for blockquote (container only)', () => {
      const content = {};

      const refs = extractReferences('blockquote', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for math_block', () => {
      const content = { latex: 'x^2' };

      const refs = extractReferences('math_block', content);

      expect(refs).toEqual([]);
    });
  });

  describe('embed mode refs', () => {
    it('extracts embed mode refs same as link mode', () => {
      const content = {
        inline: [
          {
            t: 'ref',
            mode: 'embed',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
      };

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: '01ABC123456789012345678' }]);
    });
  });
});

describe('extractPlainText', () => {
  describe('paragraph content', () => {
    it('extracts text from paragraph', () => {
      const content = {
        inline: [
          { t: 'text', text: 'Hello ' },
          { t: 'text', text: 'world' },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('Hello world');
    });

    it('handles marks without affecting text', () => {
      const content = {
        inline: [
          { t: 'text', text: 'Hello ', marks: ['strong'] },
          { t: 'text', text: 'world', marks: ['em', 'code'] },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('Hello world');
    });
  });

  describe('tag nodes', () => {
    it('extracts tag values', () => {
      const content = {
        inline: [
          { t: 'text', text: 'Tagged: ' },
          { t: 'tag', value: 'important' },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('Tagged: important');
    });
  });

  describe('ref nodes', () => {
    it('extracts alias from refs', () => {
      const content = {
        inline: [
          { t: 'text', text: 'See ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
            alias: 'My Note',
          },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('See My Note');
    });

    it('skips refs without alias', () => {
      const content = {
        inline: [
          { t: 'text', text: 'See ' },
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: '01ABC123456789012345678' },
          },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('See');
    });
  });

  describe('link nodes', () => {
    it('extracts text from link children', () => {
      const content = {
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Click here' }],
          },
        ],
      };

      const text = extractPlainText('paragraph', content);

      expect(text).toBe('Click here');
    });
  });

  describe('code_block content', () => {
    it('extracts code from code_block', () => {
      const content = { language: 'typescript', code: 'const x = 1;' };

      const text = extractPlainText('code_block', content);

      expect(text).toBe('const x = 1;');
    });
  });

  describe('table content', () => {
    it('extracts text from table cells', () => {
      const content = {
        rows: [
          {
            cells: [[{ t: 'text', text: 'Name' }], [{ t: 'text', text: 'Value' }]],
          },
          {
            cells: [[{ t: 'text', text: 'Foo' }], [{ t: 'text', text: 'Bar' }]],
          },
        ],
      };

      const text = extractPlainText('table', content);

      expect(text).toBe('Name Value Foo Bar');
    });
  });

  describe('heading content', () => {
    it('extracts text from heading', () => {
      const content = {
        level: 2,
        inline: [{ t: 'text', text: 'My Heading' }],
      };

      const text = extractPlainText('heading', content);

      expect(text).toBe('My Heading');
    });
  });

  describe('callout content', () => {
    it('extracts title from callout', () => {
      const content = {
        kind: 'NOTE',
        title: 'Important Note',
      };

      const text = extractPlainText('callout', content);

      expect(text).toBe('Important Note');
    });

    it('returns empty for callout without title', () => {
      const content = {
        kind: 'NOTE',
      };

      const text = extractPlainText('callout', content);

      expect(text).toBe('');
    });
  });

  describe('blocks without searchable text', () => {
    it('returns empty string for thematic_break', () => {
      const content = {};

      const text = extractPlainText('thematic_break', content);

      expect(text).toBe('');
    });

    it('returns empty string for math_block', () => {
      // Math latex is not indexed per spec
      const content = { latex: 'x^2 + y^2 = z^2' };

      const text = extractPlainText('math_block', content);

      expect(text).toBe('');
    });

    it('returns empty string for list container', () => {
      const content = { kind: 'bullet' };

      const text = extractPlainText('list', content);

      expect(text).toBe('');
    });

    it('returns empty string for blockquote container', () => {
      const content = {};

      const text = extractPlainText('blockquote', content);

      expect(text).toBe('');
    });
  });

  describe('list_item content', () => {
    it('extracts text from list_item inline', () => {
      const content = {
        inline: [{ t: 'text', text: 'List item text' }],
        checked: false,
      };

      const text = extractPlainText('list_item', content);

      expect(text).toBe('List item text');
    });
  });

  describe('footnote_def content', () => {
    it('extracts text from footnote_def', () => {
      const content = {
        key: '1',
        inline: [{ t: 'text', text: 'Footnote text' }],
      };

      const text = extractPlainText('footnote_def', content);

      expect(text).toBe('Footnote text');
    });
  });
});
