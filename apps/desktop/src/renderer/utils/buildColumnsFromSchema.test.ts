/**
 * Tests for buildColumnsFromSchema utility
 */

import { describe, it, expect } from 'vitest';
import type { ObjectType } from '@typenote/api';
import { buildColumnsFromSchema, objectToRowData } from './buildColumnsFromSchema.js';

// Helper to create mock ObjectType
function createMockObjectType(schemaProperties: ObjectType['schema'] = null): ObjectType {
  return {
    id: '01HZX000000000000000000001',
    key: 'Task',
    name: 'Task',
    icon: 'check-square',
    schema: schemaProperties,
    builtIn: true,
    parentTypeId: null,
    pluralName: 'Tasks',
    color: '#3B82F6',
    description: 'A task item',
    showInCalendar: false,
    calendarDateProperty: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

describe('buildColumnsFromSchema', () => {
  it('should always include title column first', () => {
    const columns = buildColumnsFromSchema(null);

    expect(columns).toHaveLength(1);
    expect(columns[0]).toEqual({
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      type: 'title',
      width: 240,
      pinned: 'left',
    });
  });

  it('should include title column even with null schema', () => {
    const objectType = createMockObjectType(null);
    const columns = buildColumnsFromSchema(objectType);

    expect(columns).toHaveLength(1);
    expect(columns[0]?.type).toBe('title');
  });

  it('should build columns for all supported property types', () => {
    const objectType = createMockObjectType({
      properties: [
        { key: 'textProp', name: 'Text Property', type: 'text', required: false },
        { key: 'numberProp', name: 'Number Property', type: 'number', required: false },
        { key: 'boolProp', name: 'Boolean Property', type: 'boolean', required: false },
        { key: 'dateProp', name: 'Date Property', type: 'date', required: false },
        { key: 'datetimeProp', name: 'Datetime Property', type: 'datetime', required: false },
        {
          key: 'selectProp',
          name: 'Select Property',
          type: 'select',
          required: false,
          options: ['A', 'B'],
        },
        {
          key: 'multiselectProp',
          name: 'Multiselect Property',
          type: 'multiselect',
          required: false,
          options: ['X', 'Y'],
        },
      ],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns).toHaveLength(8); // title + 7 properties
    expect(columns.map((c) => c.type)).toEqual([
      'title',
      'text',
      'number',
      'boolean',
      'date',
      'datetime',
      'select',
      'multiselect',
    ]);
  });

  it('should skip unsupported property types (ref, refs)', () => {
    const objectType = createMockObjectType({
      properties: [
        { key: 'textProp', name: 'Text', type: 'text', required: false },
        { key: 'refProp', name: 'Reference', type: 'ref', required: false },
        { key: 'refsProp', name: 'References', type: 'refs', required: false },
      ],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns).toHaveLength(2); // title + text only
    expect(columns.map((c) => c.id)).toEqual(['title', 'textProp']);
  });

  it('should convert richtext to text cell type', () => {
    const objectType = createMockObjectType({
      properties: [{ key: 'richProp', name: 'Rich Text', type: 'richtext', required: false }],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns).toHaveLength(2);
    expect(columns[1]?.type).toBe('text');
  });

  it('should include options for select/multiselect types', () => {
    const objectType = createMockObjectType({
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: false,
          options: ['Todo', 'In Progress', 'Done'],
        },
        {
          key: 'tags',
          name: 'Tags',
          type: 'multiselect',
          required: false,
          options: ['Bug', 'Feature', 'Docs'],
        },
      ],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns[1]?.options).toEqual(['Todo', 'In Progress', 'Done']);
    expect(columns[2]?.options).toEqual(['Bug', 'Feature', 'Docs']);
  });

  it('should use property name as column header', () => {
    const objectType = createMockObjectType({
      properties: [{ key: 'myKey', name: 'My Display Name', type: 'text', required: false }],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns[1]?.header).toBe('My Display Name');
    expect(columns[1]?.accessorKey).toBe('myKey');
  });

  it('should assign appropriate default widths by type', () => {
    const objectType = createMockObjectType({
      properties: [
        { key: 'text', name: 'Text', type: 'text', required: false },
        { key: 'number', name: 'Number', type: 'number', required: false },
        { key: 'boolean', name: 'Boolean', type: 'boolean', required: false },
        { key: 'date', name: 'Date', type: 'date', required: false },
        { key: 'datetime', name: 'Datetime', type: 'datetime', required: false },
      ],
    });

    const columns = buildColumnsFromSchema(objectType);

    expect(columns[0]?.width).toBe(240); // title
    expect(columns[1]?.width).toBe(160); // text
    expect(columns[2]?.width).toBe(80); // number
    expect(columns[3]?.width).toBe(60); // boolean
    expect(columns[4]?.width).toBe(120); // date
    expect(columns[5]?.width).toBe(180); // datetime
  });

  it('should pin title column to left', () => {
    const columns = buildColumnsFromSchema(null);

    expect(columns[0]?.pinned).toBe('left');
  });
});

describe('objectToRowData', () => {
  it('should transform object to row data', () => {
    const obj = {
      id: 'obj-1',
      title: 'My Task',
      properties: { status: 'Todo', priority: 1 },
    };

    const rowData = objectToRowData(obj);

    expect(rowData).toEqual({
      id: 'obj-1',
      title: 'My Task',
      status: 'Todo',
      priority: 1,
    });
  });

  it('should handle null title', () => {
    const obj = {
      id: 'obj-1',
      title: null,
      properties: {},
    };

    const rowData = objectToRowData(obj);

    expect(rowData.title).toBe('');
  });

  it('should handle empty properties', () => {
    const obj = {
      id: 'obj-1',
      title: 'Task',
      properties: {},
    };

    const rowData = objectToRowData(obj);

    expect(rowData).toEqual({
      id: 'obj-1',
      title: 'Task',
    });
  });

  it('should flatten nested properties', () => {
    const obj = {
      id: 'obj-1',
      title: 'Task',
      properties: {
        text: 'hello',
        number: 42,
        tags: ['a', 'b'],
      },
    };

    const rowData = objectToRowData(obj);

    expect(rowData['text']).toBe('hello');
    expect(rowData['number']).toBe(42);
    expect(rowData['tags']).toEqual(['a', 'b']);
  });
});
