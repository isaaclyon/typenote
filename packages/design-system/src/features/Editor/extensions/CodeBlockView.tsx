/**
 * CodeBlockView - Custom NodeView for code blocks with syntax highlighting.
 *
 * Features:
 * - Shiki syntax highlighting (VS Code quality)
 * - Language selector dropdown
 * - Copy to clipboard button
 * - Light/dark theme support
 */

import * as React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';

import { cn } from '../../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../../../primitives/DropdownMenu/index.js';
import { highlightCode, getLanguageLabel, SUPPORTED_LANGUAGES } from './shiki-highlighter.js';

// ============================================================================
// CodeBlockView Component
// ============================================================================

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const language = node.attrs['language'] as string | null;
  const code = node.textContent;

  // Highlighted HTML state
  const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Highlight code when content or language changes
  React.useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const html = await highlightCode(code, language);
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      } catch (error) {
        console.error('Shiki highlighting failed:', error);
        if (!cancelled) {
          setHighlightedHtml(null);
        }
      }
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  // Handle language change
  const handleLanguageChange = React.useCallback(
    (newLanguage: string) => {
      updateAttributes({ language: newLanguage === 'plaintext' ? null : newLanguage });
    },
    [updateAttributes]
  );

  // Handle copy to clipboard
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code]);

  return (
    <NodeViewWrapper className="code-block-wrapper my-2">
      <div
        className={cn(
          'code-block',
          'bg-muted border border-border rounded-md overflow-hidden',
          'relative group'
        )}
      >
        {/* Header bar */}
        <div
          className={cn(
            'code-block-header',
            'flex items-center justify-between',
            'px-3 h-8 border-b border-border',
            'text-xs text-muted-foreground'
          )}
          contentEditable={false}
        >
          {/* Language selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded',
                  'hover:bg-background/50 transition-colors duration-150',
                  'text-xs font-medium'
                )}
                type="button"
              >
                {getLanguageLabel(language)}
                <CaretDown className="h-3 w-3" weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.value}
                  onClick={() => handleLanguageChange(lang.value)}
                  className={cn(language === lang.value && 'bg-muted')}
                >
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Copy button */}
          <button
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded',
              'hover:bg-background/50 transition-colors duration-150',
              'text-xs',
              copied && 'text-success'
            )}
            onClick={handleCopy}
            type="button"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" weight="bold" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code content */}
        <div className="code-block-content relative">
          {/* Syntax highlighted overlay (visual only) */}
          {highlightedHtml && (
            <pre
              className={cn(
                'code-block-highlighted',
                'absolute inset-0 pointer-events-none',
                'p-3 overflow-x-auto',
                'font-mono text-sm leading-relaxed',
                'm-0 bg-transparent'
              )}
              aria-hidden="true"
            >
              <code
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                className="bg-transparent"
              />
            </pre>
          )}

          {/* Actual editable content */}
          <NodeViewContent
            className={cn(
              'code-block-editable',
              'block p-3 overflow-x-auto whitespace-pre',
              'font-mono text-sm leading-relaxed',
              'bg-transparent',
              // Make text transparent when highlighted (overlay shows instead)
              highlightedHtml && 'text-transparent caret-foreground'
            )}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

CodeBlockView.displayName = 'CodeBlockView';
