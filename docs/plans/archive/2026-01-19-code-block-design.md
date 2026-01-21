# Code Block Feature Design

**Date**: 2026-01-19  
**Status**: Ready for implementation

## Overview

Enhanced code blocks for the Editor with Shiki syntax highlighting, language selection, and copy-to-clipboard functionality.

## Features

1. **Markdown-style creation** — Type ` ```typescript ` + Enter to create a code block with language
2. **Shiki syntax highlighting** — VS Code-quality highlighting with theme support
3. **Language badge** — Clickable badge showing current language, opens dropdown to change
4. **Copy button** — One-click copy code to clipboard

## Visual Design

```
┌─────────────────────────────────────────────────┐
│ typescript ▾                            📋      │  ← Header bar
├─────────────────────────────────────────────────┤
│ const greeting = "Hello";                       │  ← Highlighted code
│ console.log(greeting);                          │
└─────────────────────────────────────────────────┘
```

### Styling

- **Background**: `var(--muted)` — subtle gray
- **Border**: `var(--border)` with `rounded-md`
- **Header**: Same background, 1px bottom border
- **Font**: `font-mono`, `text-sm` (14px)
- **Header height**: 32px (h-8)

### Shiki Themes

- Light mode: `github-light`
- Dark mode: `github-dark`

## Input Rules

| Input                     | Result                         |
| ------------------------- | ------------------------------ |
| ` ``` ` + Enter           | Plain code block (no language) |
| ` ```typescript ` + Enter | TypeScript code block          |
| ` ```python ` + Enter     | Python code block              |

Supported languages (common subset for dropdown):

- `javascript`, `typescript`, `python`, `rust`, `go`
- `html`, `css`, `json`, `yaml`, `markdown`
- `bash`, `shell`, `sql`, `graphql`
- `jsx`, `tsx`, `vue`, `svelte`

## Implementation

### Dependencies

```bash
pnpm --filter @typenote/design-system add shiki
```

Note: TipTap's `StarterKit` already includes a basic `codeBlock`. We'll extend it.

### File Structure

```
packages/design-system/src/features/Editor/
├── extensions/
│   ├── CodeBlock.ts          # Extended CodeBlock with language attr
│   ├── CodeBlockView.tsx     # React NodeView component
│   └── shiki-highlighter.ts  # Shiki singleton with themes
```

### Extension: CodeBlock.ts

Extend TipTap's built-in codeBlock:

```typescript
import CodeBlockBase from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CodeBlockView } from './CodeBlockView.js';

export const CodeBlock = CodeBlockBase.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-language'),
        renderHTML: (attributes) => {
          if (!attributes.language) return {};
          return { 'data-language': attributes.language };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
```

### Component: CodeBlockView.tsx

```typescript
interface CodeBlockViewProps {
  node: ProseMirrorNode;
  updateAttributes: (attrs: Record<string, unknown>) => void;
  extension: Extension;
}

const CodeBlockView = ({ node, updateAttributes }: CodeBlockViewProps) => {
  const { language } = node.attrs;
  const code = node.textContent;

  // Shiki highlighting (async, show plain text while loading)
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    highlightCode(code, language).then(setHtml);
  }, [code, language]);

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block">
        <div className="code-block-header">
          <LanguageDropdown
            value={language}
            onChange={(lang) => updateAttributes({ language: lang })}
          />
          <CopyButton code={code} />
        </div>
        <pre>
          {html ? (
            <code dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </NodeViewWrapper>
  );
};
```

### Shiki Setup: shiki-highlighter.ts

```typescript
import { createHighlighter, type Highlighter } from 'shiki';

let highlighterPromise: Promise<Highlighter> | null = null;

export async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript',
        'typescript',
        'python',
        'rust',
        'go',
        'html',
        'css',
        'json',
        'yaml',
        'markdown',
        'bash',
        'sql',
        'graphql',
        'jsx',
        'tsx',
      ],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, language: string | null): Promise<string> {
  const highlighter = await getHighlighter();
  const lang =
    language && highlighter.getLoadedLanguages().includes(language) ? language : 'plaintext';

  // Get theme based on current color scheme
  const theme = document.documentElement.classList.contains('dark')
    ? 'github-dark'
    : 'github-light';

  return highlighter.codeToHtml(code, { lang, theme });
}
```

### CSS Additions (editor.css)

```css
/* Code block container */
.code-block-wrapper {
  margin: 0.5rem 0;
}

.code-block {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 0.375rem;
  overflow: hidden;
}

/* Header bar */
.code-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.5rem;
  height: 2rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.75rem;
}

/* Code content */
.code-block pre {
  margin: 0;
  padding: 0.75rem;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-block code {
  background: transparent;
  padding: 0;
}

/* Override Shiki background */
.code-block pre.shiki {
  background: transparent !important;
}
```

## Ladle Stories

1. **Default** — Plain code block, no language
2. **WithLanguage** — TypeScript code block with highlighting
3. **AllLanguages** — Gallery showing different language highlighting
4. **CopyButton** — Interactive copy functionality
5. **LanguageSelector** — Dropdown interaction
6. **DarkMode** — Verify theme switching
7. **LongCode** — Horizontal scroll behavior
8. **MarkdownInput** — Demo of ` ```ts ` input rule

## Integration with Editor

Replace StarterKit's codeBlock with our custom extension:

```typescript
// In Editor.tsx extensions array
StarterKit.configure({
  codeBlock: false, // Disable built-in
  // ... other config
}),
CodeBlock, // Add our custom one
```

## Testing Notes

- Verify Shiki loads languages lazily (bundle size)
- Test theme switching (light ↔ dark) updates highlighting
- Test copy button works in Electron context
- Test input rules work with all supported language aliases

## Out of Scope

- Line numbers (can add later)
- Filename headers (can add later)
- Code folding
- Diff highlighting
