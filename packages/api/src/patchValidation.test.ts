import { describe, expect, it } from 'vitest';
import { validatePatchInput, validateBlockContent } from './patchValidation.js';
import type { ApplyBlockPatchInput } from './blockPatch.js';
import {
  VALID_ULID,
  VALID_ULID_2,
  makePatchInput,
  makeInsertOp,
  makeUpdateOp,
  makeDeleteOp,
} from './test-utils.js';

// =============================================================================
// Test Data
// =============================================================================

/**
 * Block type test cases with their minimal valid content
 */
const VALID_BLOCK_TYPE_CONTENT: Array<{ blockType: string; content: unknown }> = [
  { blockType: 'paragraph', content: { inline: [] } },
  { blockType: 'heading', content: { level: 2, inline: [] } },
  { blockType: 'list', content: { kind: 'bullet' } },
  { blockType: 'list_item', content: { inline: [] } },
  { blockType: 'blockquote', content: {} },
  { blockType: 'callout', content: { kind: 'NOTE' } },
  { blockType: 'code_block', content: { code: 'const x = 1;' } },
  { blockType: 'thematic_break', content: {} },
  { blockType: 'table', content: { rows: [] } },
  { blockType: 'math_block', content: { latex: 'x^2' } },
  { blockType: 'footnote_def', content: { key: '1' } },
];

// =============================================================================
// validatePatchInput Tests
// =============================================================================

describe('validatePatchInput', () => {
  describe('valid patches', () => {
    it('accepts empty ops array', () => {
      const result = validatePatchInput(makePatchInput());
      expect(result.valid).toBe(true);
    });

    it('accepts single insert op with paragraph content', () => {
      const input = makePatchInput({
        ops: [
          makeInsertOp({
            blockId: VALID_ULID_2,
            content: { inline: [{ t: 'text', text: 'Hello' }] },
          }),
        ],
      });

      const result = validatePatchInput(input);
      expect(result.valid).toBe(true);
    });

    it('accepts multiple ops of different types', () => {
      const input = makePatchInput({
        baseDocVersion: 5,
        ops: [
          makeInsertOp({
            blockId: VALID_ULID_2,
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Title' }] },
          }),
          makeUpdateOp({ blockId: VALID_ULID }),
          makeDeleteOp({ blockId: VALID_ULID }),
        ],
      });

      const result = validatePatchInput(input);
      expect(result.valid).toBe(true);
    });

    it.each(VALID_BLOCK_TYPE_CONTENT)(
      'accepts insert with blockType: $blockType',
      ({ blockType, content }) => {
        const input = makePatchInput({
          ops: [makeInsertOp({ blockId: VALID_ULID_2, blockType, content })],
        });

        const result = validatePatchInput(input);
        expect(result.valid).toBe(true);
      }
    );
  });

  describe('invalid patches', () => {
    it.each([
      {
        name: 'wrong apiVersion',
        input: { apiVersion: 'v2', objectId: VALID_ULID, ops: [] },
        expectedPath: 'apiVersion',
      },
      {
        name: 'invalid objectId',
        input: { apiVersion: 'v1', objectId: 'short', ops: [] },
        expectedPath: 'objectId',
      },
      {
        name: 'negative baseDocVersion',
        input: { apiVersion: 'v1', objectId: VALID_ULID, baseDocVersion: -1, ops: [] },
        expectedPath: 'baseDocVersion',
      },
      {
        name: 'unknown op type',
        input: {
          apiVersion: 'v1',
          objectId: VALID_ULID,
          ops: [{ op: 'block.unknown', blockId: VALID_ULID }],
        },
        expectedPath: 'ops.0',
      },
    ])('rejects $name', ({ input, expectedPath }) => {
      const result = validatePatchInput(input as ApplyBlockPatchInput);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        const paths = result.errors.map((e) => e.path);
        expect(paths.some((p) => p.includes(expectedPath))).toBe(true);
      }
    });

    it('rejects insert with invalid blockId', () => {
      const input = makePatchInput({
        ops: [makeInsertOp({ blockId: 'short' })],
      }) as ApplyBlockPatchInput;

      const result = validatePatchInput(input);
      expect(result.valid).toBe(false);
    });
  });
});

// =============================================================================
// validateBlockContent Tests
// =============================================================================

describe('validateBlockContent', () => {
  describe('paragraph', () => {
    it('accepts valid paragraph content', () => {
      const result = validateBlockContent('paragraph', { inline: [] });
      expect(result.valid).toBe(true);
    });

    it('accepts paragraph with text nodes', () => {
      const result = validateBlockContent('paragraph', {
        inline: [
          { t: 'text', text: 'Hello ' },
          { t: 'text', text: 'world', marks: ['strong'] },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects paragraph without inline array', () => {
      const result = validateBlockContent('paragraph', { text: 'Hello' });
      expect(result.valid).toBe(false);
    });
  });

  describe('heading', () => {
    it.each([1, 2, 3, 4, 5, 6])('accepts heading with level %i', (level) => {
      const result = validateBlockContent('heading', {
        level,
        inline: [{ t: 'text', text: 'Title' }],
      });
      expect(result.valid).toBe(true);
    });

    it.each([0, 7, -1, 100])('rejects heading with invalid level %i', (level) => {
      const result = validateBlockContent('heading', { level, inline: [] });
      expect(result.valid).toBe(false);
    });

    it('rejects heading without level', () => {
      const result = validateBlockContent('heading', { inline: [] });
      expect(result.valid).toBe(false);
    });
  });

  describe('list', () => {
    it.each(['bullet', 'ordered', 'task'] as const)('accepts %s list', (kind) => {
      const result = validateBlockContent('list', { kind });
      expect(result.valid).toBe(true);
    });

    it('accepts ordered list with start', () => {
      const result = validateBlockContent('list', { kind: 'ordered', start: 5 });
      expect(result.valid).toBe(true);
    });

    it('rejects list without kind', () => {
      const result = validateBlockContent('list', {});
      expect(result.valid).toBe(false);
    });
  });

  describe('code_block', () => {
    it('accepts code block with language', () => {
      const result = validateBlockContent('code_block', {
        language: 'typescript',
        code: 'const x = 1;',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects code block without code', () => {
      const result = validateBlockContent('code_block', { language: 'typescript' });
      expect(result.valid).toBe(false);
    });
  });

  describe('inline node validation', () => {
    const VALID_INLINE_CONTENT_CASES = [
      {
        name: 'ref node with object target',
        inline: [{ t: 'ref', mode: 'link', target: { kind: 'object', objectId: VALID_ULID } }],
      },
      {
        name: 'ref node with block target and alias',
        inline: [
          {
            t: 'ref',
            mode: 'embed',
            target: { kind: 'block', objectId: VALID_ULID, blockId: VALID_ULID_2 },
            alias: 'My Block',
          },
        ],
      },
      {
        name: 'link with marked text children',
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Bold link', marks: ['strong'] }],
          },
        ],
      },
    ];

    it.each(VALID_INLINE_CONTENT_CASES)('accepts paragraph with $name', ({ inline }) => {
      const result = validateBlockContent('paragraph', { inline });
      expect(result.valid).toBe(true);
    });

    const INVALID_INLINE_CONTENT_CASES = [
      { name: 'invalid inline node type', inline: [{ t: 'unknown', value: 'test' }] },
      { name: 'invalid mark', inline: [{ t: 'text', text: 'Test', marks: ['invalid_mark'] }] },
    ];

    it.each(INVALID_INLINE_CONTENT_CASES)('rejects paragraph with $name', ({ inline }) => {
      const result = validateBlockContent('paragraph', { inline });
      expect(result.valid).toBe(false);
    });
  });

  describe('table', () => {
    it('accepts table with inline content in cells', () => {
      const result = validateBlockContent('table', {
        align: ['left', 'center', 'right'],
        rows: [
          { cells: [[{ t: 'text', text: 'A' }], [{ t: 'text', text: 'B' }], []] },
          { cells: [[{ t: 'text', text: '1' }], [{ t: 'text', text: '2' }], []] },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('accepts empty table', () => {
      const result = validateBlockContent('table', { rows: [] });
      expect(result.valid).toBe(true);
    });
  });
});
