/**
 * Export/Import API contract tests.
 *
 * Tests define schema expectations for JSON export payloads and inputs.
 */

import { describe, it, expect } from 'vitest';
import {
  ExportedObjectSchema,
  ExportedTypeSchema,
  ExportObjectInputSchema,
  ExportTypeInputSchema,
} from './exportImport.js';

describe('ExportedObjectSchema', () => {
  it('validates a basic exported object', () => {
    const exported = {
      $schema: 'typenote/object/v1',
      id: '01HZX1X5E1G8G5Q2B2V9XG4M2F',
      typeKey: 'Page',
      title: 'Exported Page',
      properties: { status: 'Draft' },
      docVersion: 1,
      createdAt: '2026-01-10T12:00:00.000Z',
      updatedAt: '2026-01-11T12:00:00.000Z',
      blocks: [
        {
          id: '01HZX1X5E1G8G5Q2B2V9XG4M2G',
          parentBlockId: null,
          orderKey: 'a0',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Hello' }] },
          meta: null,
          children: [],
        },
      ],
    };

    const result = ExportedObjectSchema.safeParse(exported);
    expect(result.success).toBe(true);
  });
});

describe('ExportedTypeSchema', () => {
  it('validates a basic exported type', () => {
    const exported = {
      $schema: 'typenote/type/v1',
      key: 'Recipe',
      name: 'Recipe',
      icon: 'utensils',
      builtIn: false,
      schema: {
        properties: [{ key: 'serves', name: 'Serves', type: 'number', required: false }],
      },
    };

    const result = ExportedTypeSchema.safeParse(exported);
    expect(result.success).toBe(true);
  });
});

describe('ExportObjectInputSchema', () => {
  it('accepts a valid export object request', () => {
    const result = ExportObjectInputSchema.safeParse({
      apiVersion: 'v1',
      objectId: '01HZX1X5E1G8G5Q2B2V9XG4M2F',
      outputDir: '/tmp/export',
    });
    expect(result.success).toBe(true);
  });
});

describe('ExportTypeInputSchema', () => {
  it('accepts a valid export type request', () => {
    const result = ExportTypeInputSchema.safeParse({
      apiVersion: 'v1',
      typeKey: 'Page',
      outputDir: '/tmp/export',
    });
    expect(result.success).toBe(true);
  });
});
