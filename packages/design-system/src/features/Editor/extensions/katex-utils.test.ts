import { describe, it, expect } from 'vitest';
import { renderMath } from './katex-utils.js';

describe('katex-utils', () => {
  describe('renderMath', () => {
    it('renders valid inline math', () => {
      const result = renderMath('x^2', false);
      expect(result.error).toBeNull();
      expect(result.html).toContain('katex');
      expect(result.html).toContain('x');
    });

    it('renders valid display math', () => {
      const result = renderMath('\\frac{1}{2}', true);
      expect(result.error).toBeNull();
      expect(result.html).toContain('katex');
    });

    it('handles empty input', () => {
      const result = renderMath('', false);
      expect(result.error).toBeNull();
      expect(result.html).toContain('Empty');
    });

    it('handles whitespace-only input', () => {
      const result = renderMath('   ', false);
      expect(result.error).toBeNull();
      expect(result.html).toContain('Empty');
    });

    it('returns error for invalid LaTeX', () => {
      const result = renderMath('\\frac{1}{', false);
      expect(result.error).not.toBeNull();
      expect(result.error).toContain('KaTeX parse error');
    });

    it('returns error for unknown command', () => {
      const result = renderMath('\\unknowncommand', false);
      expect(result.error).not.toBeNull();
    });

    it('renders complex formulas', () => {
      const result = renderMath('\\int_0^\\infty e^{-x^2} dx', true);
      expect(result.error).toBeNull();
      expect(result.html).toContain('katex');
    });
  });
});
