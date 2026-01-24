import type {
  AttachmentContent,
  BlockType,
  CalloutContent,
  CodeBlockContent,
  DocumentBlock,
  FootnoteDefContent,
  HeadingContent,
  InlineNode,
  ListContent,
  ListItemContent,
  Mark,
  MathBlockContent,
  ParagraphContent,
  TableContent,
} from '@typenote/api';
import type { MarkdownAsset, MarkdownWarning } from '@typenote/api';
import type {
  MarkdownAttachmentInfo,
  MarkdownAttachmentLookup,
  MarkdownExportInput,
  MarkdownExportResult,
  MarkdownRefLookup,
} from './types.js';

const INDENT_UNIT = '  ';
const MARK_ORDER: Mark[] = ['code', 'strong', 'em', 'strike', 'highlight'];

type LinkNode = Extract<InlineNode, { t: 'link' }>;
type RefNode = Extract<InlineNode, { t: 'ref' }>;

interface SerializeState {
  warnings: MarkdownWarning[];
  assets: MarkdownAsset[];
  refLookup: MarkdownRefLookup;
  attachments: MarkdownAttachmentLookup;
  usedFilenames: Map<string, number>;
}

type BlockIdMode = 'inline' | 'nextLine';

export function notateDocToMarkdown(input: MarkdownExportInput): MarkdownExportResult {
  const warnings: MarkdownWarning[] = [];
  const assets: MarkdownAsset[] = [];
  const state: SerializeState = {
    warnings,
    assets,
    refLookup: input.refLookup ?? {},
    attachments: input.attachments ?? {},
    usedFilenames: new Map(),
  };

  const frontmatterLines = serializeFrontmatter(input, state);
  const bodyLines = serializeBlocks(input.document, '', state);

  const lines = [...frontmatterLines, `# ${input.object.title}`];
  if (bodyLines.length > 0) {
    lines.push('');
    lines.push(...bodyLines);
  }

  return {
    markdown: lines.join('\n'),
    assets,
    warnings,
  };
}

function serializeFrontmatter(input: MarkdownExportInput, state: SerializeState): string[] {
  const { object } = input;
  const data: Record<string, unknown> = {
    id: object.id,
    type: object.typeKey,
    title: object.title,
    createdAt: object.createdAt.toISOString(),
    updatedAt: object.updatedAt.toISOString(),
  };

  const propertyKeys = object.propertyDefinitions?.length
    ? object.propertyDefinitions.map((definition) => definition.key)
    : Object.keys(object.properties);

  for (const key of propertyKeys) {
    const value = object.properties[key];
    if (value === undefined) {
      continue;
    }
    const propertyType = object.propertyDefinitions?.find(
      (definition) => definition.key === key
    )?.type;
    data[key] = serializePropertyValue(value, propertyType, state);
  }

  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(data)) {
    lines.push(...serializeYamlEntry(key, value));
  }
  lines.push('---');
  return lines;
}

function serializePropertyValue(
  value: unknown,
  type: string | undefined,
  state: SerializeState
): unknown {
  if (type === 'ref' && typeof value === 'string') {
    return toWikiLink({ objectId: value }, state);
  }
  if (type === 'refs' && Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === 'string'
        ? toWikiLink({ objectId: entry }, state)
        : serializeYamlScalar(entry)
    );
  }
  return value;
}

function serializeYamlEntry(key: string, value: unknown): string[] {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [`${key}: []`];
    }
    return [`${key}:`, ...value.map((entry) => `  - ${serializeYamlScalar(entry)}`)];
  }
  return [`${key}: ${serializeYamlScalar(value)}`];
}

function serializeYamlScalar(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  return JSON.stringify(value);
}

function serializeBlocks(blocks: DocumentBlock[], indent: string, state: SerializeState): string[] {
  const lines: string[] = [];
  for (const block of blocks) {
    const blockLines = serializeBlock(block, indent, state);
    if (blockLines.length === 0) {
      continue;
    }
    if (lines.length > 0) {
      lines.push(indent);
    }
    lines.push(...blockLines);
  }
  return lines;
}

function serializeBlock(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  switch (block.blockType as BlockType) {
    case 'paragraph':
      return serializeParagraph(block, indent, state);
    case 'heading':
      return serializeHeading(block, indent, state);
    case 'list':
      return serializeList(block, indent, state);
    case 'list_item':
      return serializeListItem(block, { kind: 'bullet' }, indent, state, 1);
    case 'blockquote':
      return serializeBlockquote(block, indent, state);
    case 'callout':
      return serializeCallout(block, indent, state);
    case 'code_block':
      return serializeCodeBlock(block, indent, state);
    case 'thematic_break':
      return appendBlockIdToLines([`${indent}---`], block.id, 'nextLine', indent);
    case 'table':
      return serializeTable(block, indent, state);
    case 'math_block':
      return serializeMathBlock(block, indent, state);
    case 'footnote_def':
      return serializeFootnoteDef(block, indent, state);
    case 'attachment':
      return serializeAttachment(block, indent, state);
    default:
      state.warnings.push({
        code: 'UNKNOWN_BLOCK',
        message: `Unknown block type: ${block.blockType}`,
        details: { blockId: block.id, blockType: block.blockType },
      });
      return appendBlockIdToLines([`${indent}`], block.id, 'inline', indent);
  }
}

function serializeParagraph(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  const content = block.content as ParagraphContent;
  const raw = serializeInlineNodes(content.inline, state);
  const lines = raw.length > 0 ? raw.split('\n') : [''];
  const prefixed = lines.map((line) => `${indent}${line}`);
  return appendBlockIdToLines(prefixed, block.id, 'inline', indent);
}

function serializeHeading(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  const content = block.content as HeadingContent;
  const level = Math.min(Math.max(content.level, 1), 6);
  const raw = serializeInlineNodes(content.inline, state);
  const line = `${indent}${'#'.repeat(level)} ${raw}`.trimEnd();
  return appendBlockIdToLines([line], block.id, 'inline', indent);
}

function serializeList(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  const content = block.content as ListContent;
  const lines: string[] = [];
  let index = content.start ?? 1;
  for (let i = 0; i < block.children.length; i += 1) {
    const child = block.children[i];
    if (!child) {
      continue;
    }
    const itemLines = serializeListItem(child, content, indent, state, index);
    lines.push(...itemLines);
    if (!content.tight && i < block.children.length - 1) {
      lines.push(indent);
    }
    if (content.kind === 'ordered') {
      index += 1;
    }
  }
  return appendBlockIdToLines(lines, block.id, 'nextLine', indent);
}

function serializeListItem(
  block: DocumentBlock,
  list: ListContent,
  indent: string,
  state: SerializeState,
  index: number
): string[] {
  const content = block.content as ListItemContent;
  const marker = getListMarker(list, content, index);
  const raw = serializeInlineNodes(content.inline, state);
  const lineText = raw.length > 0 ? `${indent}${marker} ${raw}` : `${indent}${marker}`;
  const lines = appendBlockIdToLines([lineText], block.id, 'inline', indent);
  if (block.children.length > 0) {
    const childLines = serializeBlocks(block.children, `${indent}${INDENT_UNIT}`, state);
    lines.push(...childLines);
  }
  return lines;
}

function getListMarker(list: ListContent, item: ListItemContent, index: number): string {
  if (list.kind === 'ordered') {
    return `${index}.`;
  }
  if (list.kind === 'task') {
    return item.checked ? '- [x]' : '- [ ]';
  }
  return '-';
}

function serializeBlockquote(
  block: DocumentBlock,
  indent: string,
  state: SerializeState
): string[] {
  const contentLines = block.children.length
    ? serializeBlocks(block.children, `${indent}> `, state)
    : [`${indent}>`];
  return appendBlockIdToLines(contentLines, block.id, 'inline', indent);
}

function serializeCallout(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  const content = block.content as CalloutContent;
  const collapsed = content.collapsed ? '-' : '';
  const title = content.title ? ` ${content.title}` : '';
  const header = `${indent}> [!${content.kind.toUpperCase()}]${collapsed}${title}`;
  const bodyLines = block.children.length
    ? serializeBlocks(block.children, `${indent}> `, state)
    : [];
  const lines = [header, ...bodyLines];
  return appendBlockIdToLines(lines, block.id, 'inline', indent);
}

function serializeCodeBlock(
  block: DocumentBlock,
  indent: string,
  _state: SerializeState
): string[] {
  const content = block.content as CodeBlockContent;
  const language = content.language ? content.language : '';
  const firstLine = `${indent}\`\`\`${language}`.trimEnd();
  const codeLines = content.code.split('\n').map((line) => `${indent}${line}`);
  const lastLine = `${indent}\`\`\``;
  const lines = [firstLine, ...codeLines, lastLine];
  return appendBlockIdToLines(lines, block.id, 'nextLine', indent);
}

function serializeTable(block: DocumentBlock, indent: string, state: SerializeState): string[] {
  const content = block.content as TableContent;
  if (content.rows.length === 0) {
    state.warnings.push({
      code: 'UNKNOWN_BLOCK',
      message: 'Table block has no rows',
      details: { blockId: block.id },
    });
    return appendBlockIdToLines([`${indent}| |`, `${indent}| --- |`], block.id, 'nextLine', indent);
  }

  const headerCells = content.rows[0]?.cells ?? [];
  const headerLine = `${indent}| ${headerCells.map((cell) => serializeTableCell(cell, state)).join(' | ')} |`;
  const alignments = content.align ?? [];
  const alignLine = `${indent}| ${headerCells
    .map((_, index) => alignToMarkdown(alignments[index]))
    .join(' | ')} |`;
  const bodyLines = content.rows.slice(1).map((row) => {
    const cells = row.cells ?? [];
    return `${indent}| ${cells.map((cell) => serializeTableCell(cell, state)).join(' | ')} |`;
  });
  const lines = [headerLine, alignLine, ...bodyLines];
  return appendBlockIdToLines(lines, block.id, 'nextLine', indent);
}

function alignToMarkdown(align?: 'left' | 'center' | 'right' | null): string {
  if (align === 'left') {
    return ':---';
  }
  if (align === 'center') {
    return ':---:';
  }
  if (align === 'right') {
    return '---:';
  }
  return '---';
}

function serializeTableCell(cell: InlineNode[], state: SerializeState): string {
  const raw = serializeInlineNodes(cell, state);
  return raw.replace(/\|/g, '\\|');
}

function serializeMathBlock(
  block: DocumentBlock,
  indent: string,
  _state: SerializeState
): string[] {
  const content = block.content as MathBlockContent;
  const lines = [`${indent}$$`, `${indent}${content.latex}`, `${indent}$$`];
  return appendBlockIdToLines(lines, block.id, 'nextLine', indent);
}

function serializeFootnoteDef(
  block: DocumentBlock,
  indent: string,
  state: SerializeState
): string[] {
  const content = block.content as FootnoteDefContent;
  const raw = content.inline ? serializeInlineNodes(content.inline, state) : '';
  const line =
    raw.length > 0 ? `${indent}[^${content.key}]: ${raw}` : `${indent}[^${content.key}]:`;
  return appendBlockIdToLines([line], block.id, 'inline', indent);
}

function serializeAttachment(
  block: DocumentBlock,
  indent: string,
  state: SerializeState
): string[] {
  const content = block.content as AttachmentContent;
  const attachment = state.attachments[content.attachmentId];
  if (!attachment) {
    state.warnings.push({
      code: 'MISSING_ATTACHMENT',
      message: `Missing attachment metadata for ${content.attachmentId}`,
      details: { attachmentId: content.attachmentId },
    });
    const alt = content.alt ? escapeInlineText(content.alt) : 'attachment';
    const line = `${indent}![${alt}](attachments/${content.attachmentId})`;
    return appendBlockIdToLines([line], block.id, 'inline', indent);
  }

  const resolved = registerAsset(content.attachmentId, attachment, state);
  const alt = content.alt ?? attachment.filename;
  const title = content.caption ? ` "${escapeQuotes(content.caption)}"` : '';
  const line = `${indent}![${escapeInlineText(alt)}](${resolved.relativePath}${title})`;
  return appendBlockIdToLines([line], block.id, 'inline', indent);
}

function registerAsset(
  attachmentId: string,
  attachment: MarkdownAttachmentInfo,
  state: SerializeState
): MarkdownAsset {
  const filename = resolveFilename(attachment.filename, attachmentId, state);
  const relativePath = `attachments/${filename}`;
  const asset: MarkdownAsset = {
    attachmentId,
    filename,
    relativePath,
    mimeType: attachment.mimeType,
  };
  state.assets.push(asset);
  return asset;
}

function resolveFilename(filename: string, attachmentId: string, state: SerializeState): string {
  const count = state.usedFilenames.get(filename);
  if (count === undefined) {
    state.usedFilenames.set(filename, 1);
    return filename;
  }

  state.usedFilenames.set(filename, count + 1);
  const { base, ext } = splitFilename(filename);
  const resolved = `${base}-${count + 1}${ext}`;
  state.warnings.push({
    code: 'DUPLICATE_ATTACHMENT',
    message: `Duplicate attachment filename: ${filename}`,
    details: { attachmentId, filename, resolved },
  });
  return resolved;
}

function splitFilename(filename: string): { base: string; ext: string } {
  const index = filename.lastIndexOf('.');
  if (index <= 0) {
    return { base: filename, ext: '' };
  }
  return { base: filename.slice(0, index), ext: filename.slice(index) };
}

function appendBlockIdToLines(
  lines: string[],
  blockId: string,
  mode: BlockIdMode,
  indent: string
): string[] {
  if (lines.length === 0) {
    return [`${indent}^${blockId}`];
  }

  if (mode === 'nextLine') {
    return [...lines, `${indent}^${blockId}`];
  }

  const updated = [...lines];
  const lastIndex = updated.length - 1;
  updated[lastIndex] = `${updated[lastIndex]} ^${blockId}`.trimEnd();
  return updated;
}

function serializeInlineNodes(nodes: InlineNode[], state: SerializeState): string {
  return nodes.map((node) => serializeInlineNode(node, state)).join('');
}

function serializeInlineNode(node: InlineNode, state: SerializeState): string {
  switch (node.t) {
    case 'text':
      return applyMarks(node.text, node.marks, state);
    case 'hard_break':
      return '  \n';
    case 'link':
      return serializeLink(node, state);
    case 'ref':
      return serializeRef(node, state);
    case 'tag':
      return `#${escapeInlineText(node.value)}`;
    case 'math_inline':
      return `$${node.latex}$`;
    case 'footnote_ref':
      return `[^${node.key}]`;
    default:
      state.warnings.push({
        code: 'UNKNOWN_INLINE',
        message: `Unknown inline node: ${describeInlineNode(node)}`,
        details: { node: node as InlineNode },
      });
      return '';
  }
}

function serializeLink(node: LinkNode, state: SerializeState): string {
  const label = serializeInlineNodes(node.children, state);
  return `[${label}](${node.href})`;
}

function serializeRef(node: RefNode, state: SerializeState): string {
  const target: { objectId: string; blockId?: string; alias?: string } = {
    objectId: node.target.objectId,
  };
  if (node.target.kind === 'block') {
    target.blockId = node.target.blockId;
  }
  if (node.alias) {
    target.alias = node.alias;
  }
  const base = toWikiLink(target, state);
  return node.mode === 'embed' ? `!${base}` : base;
}

function toWikiLink(
  target: { objectId: string; blockId?: string; alias?: string },
  state: SerializeState
): string {
  const title = state.refLookup[target.objectId]?.title;
  if (!title) {
    state.warnings.push({
      code: 'MISSING_REF_TITLE',
      message: `Missing ref title for ${target.objectId}`,
      details: { objectId: target.objectId },
    });
  }
  const base = title ?? target.objectId;
  const blockSuffix = target.blockId ? `#^${target.blockId}` : '';
  const aliasSuffix = target.alias ? `|${target.alias}` : '';
  return `[[${base}${blockSuffix}${aliasSuffix}]]`;
}

function applyMarks(text: string, marks: Mark[] | undefined, state: SerializeState): string {
  let output = text;
  if (!marks || marks.length === 0) {
    return escapeInlineText(output);
  }

  const unknown = marks.filter((mark) => !MARK_ORDER.includes(mark));
  for (const mark of unknown) {
    state.warnings.push({
      code: 'UNKNOWN_MARK',
      message: `Unknown mark: ${mark}`,
      details: { mark },
    });
  }

  const shouldEscape = !marks.includes('code');
  output = shouldEscape ? escapeInlineText(output) : escapeInlineCode(output);

  for (const mark of MARK_ORDER) {
    if (!marks.includes(mark)) {
      continue;
    }
    const wrapper = markWrapper(mark);
    if (!wrapper) {
      continue;
    }
    output = `${wrapper[0]}${output}${wrapper[1]}`;
  }

  return output;
}

function markWrapper(mark: Mark): [string, string] | null {
  switch (mark) {
    case 'strong':
      return ['**', '**'];
    case 'em':
      return ['*', '*'];
    case 'code':
      return ['`', '`'];
    case 'strike':
      return ['~~', '~~'];
    case 'highlight':
      return ['==', '=='];
    default:
      return null;
  }
}

function escapeInlineText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/#/g, '\\#')
    .replace(/\|/g, '\\|');
}

function escapeInlineCode(value: string): string {
  return value.replace(/`/g, '\\`');
}

function escapeQuotes(value: string): string {
  return value.replace(/"/g, '\\"');
}

function describeInlineNode(node: InlineNode): string {
  const value = (node as { t?: string }).t;
  return value ?? 'unknown';
}
