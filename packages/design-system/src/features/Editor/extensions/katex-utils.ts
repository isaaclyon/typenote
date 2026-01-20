/**
 * KaTeX rendering utilities for math support.
 *
 * Provides synchronous math rendering with error handling.
 * KaTeX is fast enough for real-time editing without async.
 */

import katex from 'katex';

export interface MathRenderResult {
  /** Rendered HTML string (or error HTML if parsing failed) */
  html: string;
  /** Error message if parsing failed, null otherwise */
  error: string | null;
}

/**
 * Render LaTeX to HTML using KaTeX.
 *
 * @param latex - The LaTeX string to render
 * @param displayMode - If true, render in display mode (block); if false, inline mode
 * @returns Object with html string and optional error
 */
export function renderMath(latex: string, displayMode = false): MathRenderResult {
  if (!latex.trim()) {
    return {
      html: '<span class="katex-empty">Empty</span>',
      error: null,
    };
  }

  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      // Allow some common commands that are safe
      trust: false,
      // Strict mode for better error messages
      strict: 'warn',
    });
    return { html, error: null };
  } catch (err) {
    // KaTeX throws ParseError with helpful message
    const message = err instanceof Error ? err.message : 'Unknown error';
    // Render error using KaTeX's error rendering
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
    return { html, error: message };
  }
}
