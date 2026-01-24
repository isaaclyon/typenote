import { describe, test, expect } from 'vitest';
import type { ObjectType } from '@typenote/api';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import { buildDataGridColumns } from '../buildDataGridColumns.js';

// Helper to create a minimal ObjectType for testing
function createObjectType(schemaProperties: ObjectType['schema']): ObjectType {
  return {
    id: '01HZX1234567890123456',
    key: 'TestType',
    name: 'Test Type',
    icon: null,
    schema: schemaProperties,
    builtIn: false,
    parentTypeId: null,
    pluralName: null,
    color: null,
    description: null,
    showInCalendar: false,
    calendarDateProperty: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('buildDataGridColumns', () => {
  test('Title column is always first', () => {
    const objectType = createObjectType({
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: false,
          options: ['Active', 'Done'],
        },
      ],
    });

    const columns = buildDataGridColumns(objectType);
    const titleColumn = columns[0];

    expect(titleColumn).toBeDefined();
    expect(titleColumn?.key).toBe('title');
    expect(titleColumn?.header).toBe('Title');
    expect(titleColumn?.type).toBe('title');
    expect(titleColumn?.isTitle).toBe(true);
    expect(titleColumn?.pinned).toBe('left');
    expect(titleColumn?.sortable).toBe(true);
    expect(titleColumn?.editable).toBe(false);
  });

  test('empty schema returns title column only', () => {
    const objectType = createObjectType(null);

    const columns = buildDataGridColumns(objectType);

    expect(columns).toHaveLength(1);
    expect(columns[0]?.key).toBe('title');
  });

  test('empty properties array returns title column only', () => {
    const objectType = createObjectType({ properties: [] });

    const columns = buildDataGridColumns(objectType);

    expect(columns).toHaveLength(1);
    expect(columns[0]?.key).toBe('title');
  });

  test('null objectType returns title column only', () => {
    const columns = buildDataGridColumns(null);

    expect(columns).toHaveLength(1);
    expect(columns[0]?.key).toBe('title');
  });

  test('maps text property type correctly', () => {
    const objectType = createObjectType({
      properties: [{ key: 'description', name: 'Description', type: 'text', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(columns).toHaveLength(2);
    expect(propColumn?.key).toBe('description');
    expect(propColumn?.header).toBe('Description');
    expect(propColumn?.type).toBe('text');
    expect(propColumn?.sortable).toBe(true);
    expect(propColumn?.editable).toBe(false);
  });

  test('maps richtext property type to text', () => {
    const objectType = createObjectType({
      properties: [{ key: 'notes', name: 'Notes', type: 'richtext', required: false }],
    });

    const columns = buildDataGridColumns(objectType);

    expect(columns[1]?.type).toBe('text');
  });

  test('maps number property type correctly', () => {
    const objectType = createObjectType({
      properties: [{ key: 'count', name: 'Count', type: 'number', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('number');
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps boolean property type correctly', () => {
    const objectType = createObjectType({
      properties: [{ key: 'active', name: 'Active', type: 'boolean', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('boolean');
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps date property type correctly', () => {
    const objectType = createObjectType({
      properties: [{ key: 'due_date', name: 'Due Date', type: 'date', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('date');
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps datetime property type correctly', () => {
    const objectType = createObjectType({
      properties: [{ key: 'created', name: 'Created', type: 'datetime', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('datetime');
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps select property type with options', () => {
    const objectType = createObjectType({
      properties: [
        {
          key: 'status',
          name: 'Status',
          type: 'select',
          required: false,
          options: ['Todo', 'Done', 'Cancelled'],
        },
      ],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('select');
    expect(propColumn?.options).toEqual(['Todo', 'Done', 'Cancelled']);
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps multiselect property type with options', () => {
    const objectType = createObjectType({
      properties: [
        {
          key: 'tags',
          name: 'Tags',
          type: 'multiselect',
          required: false,
          options: ['A', 'B', 'C'],
        },
      ],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('multiselect');
    expect(propColumn?.options).toEqual(['A', 'B', 'C']);
    expect(propColumn?.sortable).toBe(true);
  });

  test('maps ref property type with sortable false', () => {
    const objectType = createObjectType({
      properties: [{ key: 'parent', name: 'Parent', type: 'ref', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('ref');
    expect(propColumn?.sortable).toBe(false);
  });

  test('maps refs property type with sortable false', () => {
    const objectType = createObjectType({
      properties: [{ key: 'related', name: 'Related', type: 'refs', required: false }],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    expect(propColumn?.type).toBe('refs');
    expect(propColumn?.sortable).toBe(false);
  });

  test('getValue extracts value from row.properties', () => {
    const objectType = createObjectType({
      properties: [
        { key: 'status', name: 'Status', type: 'select', required: false, options: ['Active'] },
      ],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    const mockRow: ObjectSummaryWithProperties = {
      id: '01TEST123456789012345',
      typeKey: 'TestType',
      typeId: '01TYPE123456789012345',
      title: 'Test Object',
      properties: { status: 'Active' },
      updatedAt: new Date(),
    };

    expect(propColumn?.getValue).toBeDefined();
    expect(propColumn?.getValue?.(mockRow)).toBe('Active');
  });

  test('getValue returns undefined for missing property', () => {
    const objectType = createObjectType({
      properties: [
        { key: 'status', name: 'Status', type: 'select', required: false, options: ['Active'] },
      ],
    });

    const columns = buildDataGridColumns(objectType);
    const propColumn = columns[1];

    const mockRow: ObjectSummaryWithProperties = {
      id: '01TEST123456789012345',
      typeKey: 'TestType',
      typeId: '01TYPE123456789012345',
      title: 'Test Object',
      properties: {}, // missing status
      updatedAt: new Date(),
    };

    expect(propColumn?.getValue?.(mockRow)).toBeUndefined();
  });

  test('multiple properties are mapped in order', () => {
    const objectType = createObjectType({
      properties: [
        { key: 'status', name: 'Status', type: 'select', required: false, options: ['A'] },
        { key: 'count', name: 'Count', type: 'number', required: false },
        { key: 'date', name: 'Date', type: 'date', required: false },
      ],
    });

    const columns = buildDataGridColumns(objectType);

    expect(columns).toHaveLength(4); // title + 3 properties
    expect(columns[0]?.key).toBe('title');
    expect(columns[1]?.key).toBe('status');
    expect(columns[2]?.key).toBe('count');
    expect(columns[3]?.key).toBe('date');
  });
});
