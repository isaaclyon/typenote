/**
 * Enhanced CodeBlock extension with language attribute and custom rendering.
 *
 * Features:
 * - Language attribute for syntax highlighting
 * - Input rules: ```language triggers code block creation
 * - Custom NodeView for rich rendering (header, copy button, etc.)
 */

import CodeBlockBase from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { textblockTypeInputRule } from '@tiptap/core';
import type { Attributes } from '@tiptap/core';
import { CodeBlockView } from './CodeBlockView.js';
import { resolveLanguage } from './shiki-highlighter.js';

// Regex to match ```language at start of line
// Captures optional language identifier after the backticks
const BACKTICK_INPUT_REGEX = /^```([a-zA-Z0-9+#]*)?[\s\n]$/;

export interface CodeBlockOptions {
  /**
   * Whether to enable syntax highlighting.
   * @default true
   */
  enableHighlighting?: boolean;

  /**
   * HTML attributes to add to the code block element.
   */
  HTMLAttributes?: Record<string, unknown>;
}

export const CodeBlock = CodeBlockBase.extend<CodeBlockOptions>({
  name: 'codeBlock',

  addOptions() {
    return {
      ...this.parent?.(),
      enableHighlighting: true,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          // Try data-language first, then class like "language-typescript"
          const dataLang = element.getAttribute('data-language');
          if (dataLang) return resolveLanguage(dataLang);

          const className = element.querySelector('code')?.className ?? '';
          const match = className.match(/language-(\w+)/);
          return match ? resolveLanguage(match[1] ?? null) : null;
        },
        renderHTML: (attributes: Attributes) => {
          const lang = attributes['language'] as string | null | undefined;
          if (!lang) return {};
          return { 'data-language': lang };
        },
      },
    };
  },

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: BACKTICK_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => ({
          language: match[1] ? resolveLanguage(match[1]) : null,
        }),
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  // Keep keyboard shortcuts from parent
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // Tab in code block inserts actual tab
      Tab: () => {
        if (this.editor.isActive('codeBlock')) {
          return this.editor.commands.insertContent('\t');
        }
        return false;
      },
    };
  },
});
