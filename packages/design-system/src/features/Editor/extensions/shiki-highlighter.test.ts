import { describe, expect, it } from 'vitest';

import * as shikiHighlighter from './shiki-highlighter.js';

describe('shiki-highlighter', () => {
  describe('resolveLanguage', () => {
    it('maps aliases and trims whitespace', () => {
      expect(shikiHighlighter.resolveLanguage('  TS ')).toBe('typescript');
      expect(shikiHighlighter.resolveLanguage('js')).toBe('javascript');
    });

    it('defaults to plaintext when null', () => {
      expect(shikiHighlighter.resolveLanguage(null)).toBe('plaintext');
    });
  });

  describe('getLanguageLabel', () => {
    it('returns labels for supported languages', () => {
      expect(shikiHighlighter.getLanguageLabel('ts')).toBe('TypeScript');
    });

    it('falls back to provided value when unknown', () => {
      expect(shikiHighlighter.getLanguageLabel('myLang')).toBe('myLang');
    });

    it('falls back to Plain Text when null', () => {
      expect(shikiHighlighter.getLanguageLabel(null)).toBe('Plain Text');
    });
  });

  describe('highlightCode', () => {
    it('escapes html when falling back to plaintext', async () => {
      const result = await shikiHighlighter.highlightCode('<div>Hi</div>', 'unknown');
      expect(result).toBe('&lt;div&gt;Hi&lt;/div&gt;');
    });

    it('strips wrapper markup from highlighted html', async () => {
      const result = await shikiHighlighter.highlightCode('const x = 1;', 'ts');
      expect(result).toContain('const');
      expect(result).not.toContain('<pre');
      expect(result).not.toContain('</pre>');
      expect(result).not.toContain('<code');
      expect(result).not.toContain('</code>');
    });
  });
});
