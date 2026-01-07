/**
 * Template placeholder substitution engine.
 *
 * Pure functions for replacing {{placeholders}} in template blocks.
 * No database dependencies — this is a core utility.
 */

import type { TemplateBlock } from '@typenote/api';

/**
 * Context values for placeholder substitution.
 */
export interface PlaceholderContext {
  /** Object title */
  title: string;
  /** Creation date in YYYY-MM-DD format */
  created_date: string;
  /** For DailyNotes: the date_key property */
  date_key?: string | undefined;
}

/**
 * Supported placeholder names.
 */
const PLACEHOLDER_KEYS = ['title', 'created_date', 'date_key'] as const;

/**
 * Regex to match {{placeholder}} patterns.
 */
const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

/**
 * Substitute placeholders in a text string.
 */
function substituteText(text: string, context: PlaceholderContext): string {
  return text.replace(PLACEHOLDER_REGEX, (match, key: string) => {
    if (PLACEHOLDER_KEYS.includes(key as (typeof PLACEHOLDER_KEYS)[number])) {
      const value = context[key as keyof PlaceholderContext];
      return value !== undefined ? value : match;
    }
    return match;
  });
}

/**
 * Check if content has an inline array (paragraph, heading, list_item, etc.)
 */
function hasInlineArray(
  content: Record<string, unknown>
): content is { inline: unknown[] } & Record<string, unknown> {
  return Array.isArray(content['inline']);
}

/**
 * Check if an inline node is a text node.
 */
function isTextNode(node: unknown): node is { t: 'text'; text: string; marks?: string[] } {
  return (
    typeof node === 'object' &&
    node !== null &&
    (node as Record<string, unknown>)['t'] === 'text' &&
    typeof (node as Record<string, unknown>)['text'] === 'string'
  );
}

/**
 * Process inline nodes, substituting placeholders in text nodes.
 */
function processInlineNodes(nodes: unknown[], context: PlaceholderContext): unknown[] {
  return nodes.map((node) => {
    if (isTextNode(node)) {
      const newText = substituteText(node.text, context);
      if (newText === node.text) {
        return node; // No change, return original
      }
      // Create new node with substituted text
      return node.marks !== undefined
        ? { t: 'text', text: newText, marks: node.marks }
        : { t: 'text', text: newText };
    }
    return node; // Non-text nodes pass through unchanged
  });
}

/**
 * Process a single block's content, substituting placeholders.
 */
function processBlockContent(
  content: Record<string, unknown>,
  context: PlaceholderContext
): Record<string, unknown> {
  if (hasInlineArray(content)) {
    const newInline = processInlineNodes(content.inline, context);
    // Check if anything changed
    const changed = newInline.some((node, i) => node !== content.inline[i]);
    if (!changed) {
      return content; // No change, return original
    }
    // Return new content object with substituted inline
    return { ...content, inline: newInline };
  }
  return content; // No inline array, return unchanged
}

/**
 * Recursively process template blocks, substituting placeholders.
 *
 * @param blocks - Array of template blocks
 * @param context - Placeholder values to substitute
 * @returns New array of blocks with placeholders replaced (original not mutated)
 */
export function substitutePlaceholders(
  blocks: TemplateBlock[],
  context: PlaceholderContext
): TemplateBlock[] {
  return blocks.map((block) => {
    const newContent = processBlockContent(block.content, context);
    const newChildren = block.children
      ? substitutePlaceholders(block.children, context)
      : undefined;

    // Check if anything changed
    const contentChanged = newContent !== block.content;
    const childrenChanged = newChildren !== block.children;

    if (!contentChanged && !childrenChanged) {
      return block; // No change, return original
    }

    // Create new block with changes
    const newBlock: TemplateBlock = {
      blockType: block.blockType,
      content: newContent,
    };

    if (newChildren !== undefined) {
      newBlock.children = newChildren;
    }

    return newBlock;
  });
}
