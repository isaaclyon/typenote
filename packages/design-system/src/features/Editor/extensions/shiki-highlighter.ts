/**
 * Shiki syntax highlighter with lazy loading and theme support.
 *
 * Uses a singleton pattern to avoid loading Shiki multiple times.
 * Themes: github-light (light mode), github-dark (dark mode)
 */

import { createHighlighter, type Highlighter, type BundledLanguage } from 'shiki';

// Supported languages for the language dropdown
export const SUPPORTED_LANGUAGES: { value: string; label: string }[] = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'sql', label: 'SQL' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

// Language aliases (e.g., "js" -> "javascript")
const LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  'c++': 'cpp',
  'c#': 'csharp',
};

// Singleton highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get the singleton Shiki highlighter instance.
 * Lazy-loads on first call.
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: SUPPORTED_LANGUAGES.map((l) => l.value).filter(
        (l) => l !== 'plaintext'
      ) as BundledLanguage[],
    });
  }
  return highlighterPromise;
}

/**
 * Resolve language aliases to canonical names.
 */
export function resolveLanguage(lang: string | null): string {
  if (!lang) return 'plaintext';
  const normalized = lang.toLowerCase().trim();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

/**
 * Get display label for a language.
 */
export function getLanguageLabel(lang: string | null): string {
  const resolved = resolveLanguage(lang);
  const found = SUPPORTED_LANGUAGES.find((l) => l.value === resolved);
  return found?.label ?? lang ?? 'Plain Text';
}

/**
 * Highlight code using Shiki.
 *
 * @param code - The code to highlight
 * @param language - Language identifier (e.g., "typescript", "ts", "python")
 * @returns HTML string with syntax highlighting
 */
export async function highlightCode(code: string, language: string | null): Promise<string> {
  const highlighter = await getHighlighter();
  const resolved = resolveLanguage(language);

  // Check if language is loaded, fallback to plaintext
  const loadedLangs = highlighter.getLoadedLanguages();
  const lang = loadedLangs.includes(resolved as BundledLanguage) ? resolved : 'plaintext';

  // Determine theme based on document class (dark mode)
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const theme = isDark ? 'github-dark' : 'github-light';

  // For plaintext, just escape and return
  if (lang === 'plaintext') {
    return escapeHtml(code);
  }

  const html = highlighter.codeToHtml(code, {
    lang: lang as BundledLanguage,
    theme,
  });

  // Strip the outer <pre><code> wrapper since we render our own
  return html.replace(/^<pre[^>]*><code[^>]*>/, '').replace(/<\/code><\/pre>$/, '');
}

/**
 * Escape HTML entities for plain text display.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
