/**
 * Inline node and content builders for tests.
 * These helpers reduce boilerplate when creating test fixtures
 * for block content structures.
 */

import type { Mark, RefTarget, InlineNode } from '@typenote/api';

/**
 * Build a text node.
 */
export function text(value: string, marks?: Mark[]): InlineNode {
  if (marks && marks.length > 0) {
    return { t: 'text', text: value, marks };
  }
  return { t: 'text', text: value };
}

/**
 * Build an object reference node.
 */
export function objectRef(
  objectId: string,
  options?: { mode?: 'link' | 'embed'; alias?: string }
): InlineNode {
  const mode = options?.mode ?? 'link';
  const target: RefTarget = { kind: 'object', objectId };

  if (options?.alias) {
    return { t: 'ref', mode, target, alias: options.alias };
  }
  return { t: 'ref', mode, target };
}

/**
 * Build a block reference node.
 */
export function blockRef(
  objectId: string,
  blockId: string,
  options?: { mode?: 'link' | 'embed'; alias?: string }
): InlineNode {
  const mode = options?.mode ?? 'link';
  const target: RefTarget = { kind: 'block', objectId, blockId };

  if (options?.alias) {
    return { t: 'ref', mode, target, alias: options.alias };
  }
  return { t: 'ref', mode, target };
}

/**
 * Build a link node with children.
 * Note: Links cannot contain other links per HTML/Markdown spec.
 * The children parameter accepts InlineNode[] for convenience in tests,
 * but callers should not pass link nodes as children.
 */
export function link(href: string, children: InlineNode[]): InlineNode {
  // Type assertion needed because the API schema restricts link children
  // to non-link nodes, but for test convenience we accept the broader type.
  return { t: 'link', href, children } as InlineNode;
}

/**
 * Build a tag node.
 */
export function tag(value: string): InlineNode {
  return { t: 'tag', value };
}

/**
 * Build a hard break node.
 */
export function hardBreak(): InlineNode {
  return { t: 'hard_break' };
}

/**
 * Build an inline math node.
 */
export function mathInline(latex: string): InlineNode {
  return { t: 'math_inline', latex };
}

/**
 * Build a footnote reference node.
 */
export function footnoteRef(key: string): InlineNode {
  return { t: 'footnote_ref', key };
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build paragraph content.
 */
export function paragraphContent(inline: InlineNode[]) {
  return { inline };
}

/**
 * Build heading content.
 */
export function headingContent(level: 1 | 2 | 3 | 4 | 5 | 6, inline: InlineNode[]) {
  return { level, inline };
}

/**
 * Build list item content.
 */
export function listItemContent(inline: InlineNode[], checked?: boolean) {
  if (checked !== undefined) {
    return { inline, checked };
  }
  return { inline };
}

/**
 * Build footnote definition content.
 */
export function footnoteDefContent(key: string, inline: InlineNode[]) {
  return { key, inline };
}

/**
 * Build table content.
 */
export function tableContent(rows: Array<{ cells: InlineNode[][] }>) {
  return { rows };
}

/**
 * Build a table row.
 */
export function tableRow(cells: InlineNode[][]) {
  return { cells };
}

/**
 * Build code block content.
 */
export function codeBlockContent(code: string, language?: string) {
  if (language) {
    return { language, code };
  }
  return { code };
}

/**
 * Build callout content.
 */
export function calloutContent(kind: string, title?: string) {
  if (title) {
    return { kind, title };
  }
  return { kind };
}

/**
 * Build math block content.
 */
export function mathBlockContent(latex: string) {
  return { latex };
}

/**
 * Build list content.
 */
export function listContent(kind: 'bullet' | 'ordered' | 'task') {
  return { kind };
}

/**
 * Build blockquote content.
 */
export function blockquoteContent() {
  return {};
}

/**
 * Build thematic break content.
 */
export function thematicBreakContent() {
  return {};
}
