import { describe, it, expect } from 'vitest';
import { extractPlainText } from './contentExtraction.js';
import {
  text,
  objectRef,
  link,
  tag,
  paragraphContent,
  headingContent,
  listItemContent,
  footnoteDefContent,
  tableContent,
  tableRow,
  codeBlockContent,
  calloutContent,
  mathBlockContent,
  listContent,
  blockquoteContent,
  thematicBreakContent,
} from './testBuilders.js';

// Test object ID
const OBJECT_ID = '01ABC123456789012345678';

describe('extractPlainText', () => {
  describe('paragraph content', () => {
    it('extracts text from paragraph', () => {
      const content = paragraphContent([text('Hello '), text('world')]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('Hello world');
    });

    it('handles marks without affecting text', () => {
      const content = paragraphContent([text('Hello ', ['strong']), text('world', ['em', 'code'])]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('Hello world');
    });
  });

  describe('tag nodes', () => {
    it('extracts tag values', () => {
      const content = paragraphContent([text('Tagged: '), tag('important')]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('Tagged: important');
    });
  });

  describe('ref nodes', () => {
    it('extracts alias from refs', () => {
      const content = paragraphContent([text('See '), objectRef(OBJECT_ID, { alias: 'My Note' })]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('See My Note');
    });

    it('skips refs without alias', () => {
      const content = paragraphContent([text('See '), objectRef(OBJECT_ID)]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('See');
    });
  });

  describe('link nodes', () => {
    it('extracts text from link children', () => {
      const content = paragraphContent([link('https://example.com', [text('Click here')])]);

      const result = extractPlainText('paragraph', content);

      expect(result).toBe('Click here');
    });
  });

  describe('code_block content', () => {
    it('extracts code from code_block', () => {
      const content = codeBlockContent('const x = 1;', 'typescript');

      const result = extractPlainText('code_block', content);

      expect(result).toBe('const x = 1;');
    });
  });

  describe('table content', () => {
    it('extracts text from table cells', () => {
      const content = tableContent([
        tableRow([[text('Name')], [text('Value')]]),
        tableRow([[text('Foo')], [text('Bar')]]),
      ]);

      const result = extractPlainText('table', content);

      expect(result).toBe('Name Value Foo Bar');
    });
  });

  describe('heading content', () => {
    it('extracts text from heading', () => {
      const content = headingContent(2, [text('My Heading')]);

      const result = extractPlainText('heading', content);

      expect(result).toBe('My Heading');
    });
  });

  describe('callout content', () => {
    it('extracts title from callout', () => {
      const content = calloutContent('NOTE', 'Important Note');

      const result = extractPlainText('callout', content);

      expect(result).toBe('Important Note');
    });

    it('returns empty for callout without title', () => {
      const content = calloutContent('NOTE');

      const result = extractPlainText('callout', content);

      expect(result).toBe('');
    });
  });

  describe('blocks without searchable text', () => {
    it('returns empty string for thematic_break', () => {
      const content = thematicBreakContent();

      const result = extractPlainText('thematic_break', content);

      expect(result).toBe('');
    });

    it('returns empty string for math_block', () => {
      // Math latex is not indexed per spec
      const content = mathBlockContent('x^2 + y^2 = z^2');

      const result = extractPlainText('math_block', content);

      expect(result).toBe('');
    });

    it('returns empty string for list container', () => {
      const content = listContent('bullet');

      const result = extractPlainText('list', content);

      expect(result).toBe('');
    });

    it('returns empty string for blockquote container', () => {
      const content = blockquoteContent();

      const result = extractPlainText('blockquote', content);

      expect(result).toBe('');
    });
  });

  describe('list_item content', () => {
    it('extracts text from list_item inline', () => {
      const content = listItemContent([text('List item text')], false);

      const result = extractPlainText('list_item', content);

      expect(result).toBe('List item text');
    });
  });

  describe('footnote_def content', () => {
    it('extracts text from footnote_def', () => {
      const content = footnoteDefContent('1', [text('Footnote text')]);

      const result = extractPlainText('footnote_def', content);

      expect(result).toBe('Footnote text');
    });
  });
});
