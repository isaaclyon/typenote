import { describe, it, expect } from 'vitest';
import { extractReferences } from './contentExtraction.js';
import {
  text,
  objectRef,
  blockRef,
  link,
  paragraphContent,
  headingContent,
  listItemContent,
  footnoteDefContent,
  tableContent,
  tableRow,
  codeBlockContent,
  mathBlockContent,
  listContent,
  blockquoteContent,
  thematicBreakContent,
} from './testBuilders.js';

// Test object IDs
const OBJECT_ID_A = '01ABC123456789012345678';
const OBJECT_ID_B = '01AAA000000000000000000';
const OBJECT_ID_C = '01BBB000000000000000000';
const BLOCK_ID = '01DEF987654321098765432';

describe('extractReferences', () => {
  describe('paragraph content', () => {
    it('extracts object refs from paragraph content', () => {
      const content = paragraphContent([text('See '), objectRef(OBJECT_ID_A)]);

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });

    it('extracts block refs from paragraph content', () => {
      const content = paragraphContent([blockRef(OBJECT_ID_A, BLOCK_ID)]);

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([
        {
          kind: 'block',
          objectId: OBJECT_ID_A,
          blockId: BLOCK_ID,
        },
      ]);
    });

    it('extracts multiple refs from paragraph', () => {
      const content = paragraphContent([
        objectRef(OBJECT_ID_B),
        text(' and '),
        objectRef(OBJECT_ID_C, { mode: 'embed' }),
      ]);

      const refs = extractReferences('paragraph', content);

      expect(refs).toHaveLength(2);
      expect(refs[0]).toEqual({
        kind: 'object',
        objectId: OBJECT_ID_B,
      });
      expect(refs[1]).toEqual({
        kind: 'object',
        objectId: OBJECT_ID_C,
      });
    });
  });

  describe('link children', () => {
    it('extracts refs from link children', () => {
      const content = paragraphContent([link('https://example.com', [objectRef(OBJECT_ID_A)])]);

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });

  describe('heading content', () => {
    it('extracts refs from heading inline', () => {
      const content = headingContent(2, [text('About '), objectRef(OBJECT_ID_A)]);

      const refs = extractReferences('heading', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });

  describe('list_item content', () => {
    it('extracts refs from list_item inline', () => {
      const content = listItemContent([objectRef(OBJECT_ID_A)], false);

      const refs = extractReferences('list_item', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });

  describe('table content', () => {
    it('extracts refs from table cells', () => {
      const content = tableContent([tableRow([[text('Name')], [objectRef(OBJECT_ID_A)]])]);

      const refs = extractReferences('table', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });

  describe('footnote_def content', () => {
    it('extracts refs from footnote_def inline', () => {
      const content = footnoteDefContent('1', [objectRef(OBJECT_ID_A)]);

      const refs = extractReferences('footnote_def', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });

  describe('blocks without refs', () => {
    it('returns empty array for code_block', () => {
      const content = codeBlockContent('const x = 1;', 'typescript');

      const refs = extractReferences('code_block', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for thematic_break', () => {
      const content = thematicBreakContent();

      const refs = extractReferences('thematic_break', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for list (container only)', () => {
      const content = listContent('bullet');

      const refs = extractReferences('list', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for blockquote (container only)', () => {
      const content = blockquoteContent();

      const refs = extractReferences('blockquote', content);

      expect(refs).toEqual([]);
    });

    it('returns empty array for math_block', () => {
      const content = mathBlockContent('x^2');

      const refs = extractReferences('math_block', content);

      expect(refs).toEqual([]);
    });
  });

  describe('embed mode refs', () => {
    it('extracts embed mode refs same as link mode', () => {
      const content = paragraphContent([objectRef(OBJECT_ID_A, { mode: 'embed' })]);

      const refs = extractReferences('paragraph', content);

      expect(refs).toEqual([{ kind: 'object', objectId: OBJECT_ID_A }]);
    });
  });
});
