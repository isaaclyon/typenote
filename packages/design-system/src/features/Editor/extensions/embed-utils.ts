import type { JSONContent } from '@tiptap/core';

export interface EmbedLike {
  displayTitle: string;
  alias?: string | null;
  headingText?: string | null;
  blockId?: string | null;
}

function normalizeLabel(value: string | null | undefined): string {
  return (value ?? '').trim();
}

function selectTitle(displayTitle: string): string {
  const trimmed = displayTitle.trim();
  return trimmed.length > 0 ? trimmed : 'Untitled';
}

export function buildEmbedSyntax(target: EmbedLike): string {
  const title = selectTitle(target.displayTitle);
  const alias = normalizeLabel(target.alias);
  const headingText = normalizeLabel(target.headingText);
  const blockId = normalizeLabel(target.blockId);

  let suffix = '';
  if (blockId) {
    suffix = `#^${blockId}`;
  } else if (headingText) {
    suffix = `#${headingText}`;
  }

  const aliasSegment = alias ? `|${alias}` : '';
  return `![[${title}${suffix}${aliasSegment}]]`;
}

export function formatEmbedDisplayTitle(target: EmbedLike): string {
  const alias = normalizeLabel(target.alias);
  if (alias) return alias;

  const title = selectTitle(target.displayTitle);
  const headingText = normalizeLabel(target.headingText);
  const blockId = normalizeLabel(target.blockId);

  if (blockId) {
    return `${title}#^${blockId}`;
  }
  if (headingText) {
    return `${title} > ${headingText}`;
  }

  return title;
}

export function suppressNestedEmbeds(content: JSONContent): JSONContent {
  if (!content) return content;
  if (content.type === 'embedNode') {
    return {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Embedded content hidden',
        },
      ],
    };
  }

  if (Array.isArray(content.content)) {
    return {
      ...content,
      content: content.content.map((child) => suppressNestedEmbeds(child)),
    };
  }

  return content;
}
