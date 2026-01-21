import { describe, expect, it } from 'vitest';

import { FOOTNOTE_DEF_REGEX } from './FootnoteDefNode.js';

describe('FOOTNOTE_DEF_REGEX', () => {
  it('matches valid footnote definitions', () => {
    const match = FOOTNOTE_DEF_REGEX.exec('[^note-1]: ');
    expect(match?.[1]).toBe('note-1');
  });

  it('rejects definitions without trailing space', () => {
    expect(FOOTNOTE_DEF_REGEX.test('[^note-1]:')).toBe(false);
  });

  it('rejects definitions with leading content', () => {
    expect(FOOTNOTE_DEF_REGEX.test('Text [^note-1]: ')).toBe(false);
  });
});
