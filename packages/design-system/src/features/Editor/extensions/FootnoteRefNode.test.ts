import { describe, expect, it } from 'vitest';

import { FOOTNOTE_REF_REGEX } from './FootnoteRefNode.js';

describe('FOOTNOTE_REF_REGEX', () => {
  it('matches valid footnote references', () => {
    const match = FOOTNOTE_REF_REGEX.exec('See [^note_1]');
    expect(match?.[1]).toBe('note_1');
  });

  it('rejects references with spaces', () => {
    expect(FOOTNOTE_REF_REGEX.test('[^note one]')).toBe(false);
  });

  it('rejects references when not at end of input', () => {
    expect(FOOTNOTE_REF_REGEX.test('[^note1].')).toBe(false);
  });
});
