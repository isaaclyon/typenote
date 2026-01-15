/**
 * buildColumnsFromSchema utility
 *
 * Converts an ObjectType schema to TypeBrowser column definitions.
 * Maps PropertyType to CellType and handles special cases.
 */

import type { ObjectType, PropertyType } from '@typenote/api';
import type { TypeBrowserColumn, CellType } from '@typenote/design-system';

/**
 * Interface for TypeBrowser row data with object ID and title.
 * Additional properties are dynamic based on the object type schema.
 */
export interface TypeBrowserRowData extends Record<string, unknown> {
  id: string;
  title: string;
}

/**
 * Maps PropertyType to CellType.
 * Some types are not directly supported in TypeBrowser cells.
 */
function propertyTypeToCellType(propType: PropertyType): CellType | null {
  switch (propType) {
    case 'text':
      return 'text';
    case 'richtext':
      // Rich text not supported as cell type, fallback to text
      return 'text';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'date';
    case 'datetime':
      return 'datetime';
    case 'select':
      return 'select';
    case 'multiselect':
      return 'multiselect';
    case 'ref':
    case 'refs':
      // References not supported as editable cells yet
      return null;
    default:
      return null;
  }
}

/**
 * Default column widths by cell type.
 */
function getDefaultWidth(cellType: CellType): number {
  switch (cellType) {
    case 'title':
      return 240;
    case 'text':
      return 160;
    case 'number':
      return 80;
    case 'boolean':
      return 60;
    case 'date':
      return 120;
    case 'datetime':
      return 180;
    case 'select':
      return 120;
    case 'multiselect':
      return 160;
    default:
      return 120;
  }
}

/**
 * Builds TypeBrowser columns from an ObjectType schema.
 *
 * @param objectType - The ObjectType with schema to convert
 * @returns Array of TypeBrowserColumn definitions
 */
export function buildColumnsFromSchema(
  objectType: ObjectType | null
): TypeBrowserColumn<TypeBrowserRowData>[] {
  const columns: TypeBrowserColumn<TypeBrowserRowData>[] = [];

  // Always add the title column first (using 'title' cell type)
  columns.push({
    id: 'title',
    header: 'Title',
    accessorKey: 'title',
    type: 'title',
    width: getDefaultWidth('title'),
    pinned: 'left',
  });

  // If no schema, return just the title column
  if (!objectType?.schema?.properties) {
    return columns;
  }

  // Add columns for each property in the schema
  for (const prop of objectType.schema.properties) {
    const cellType = propertyTypeToCellType(prop.type);

    // Skip unsupported property types
    if (cellType === null) {
      continue;
    }

    const column: TypeBrowserColumn<TypeBrowserRowData> = {
      id: prop.key,
      header: prop.name,
      accessorKey: prop.key,
      type: cellType,
      width: getDefaultWidth(cellType),
    };

    // Add options for select/multiselect types
    if ((cellType === 'select' || cellType === 'multiselect') && prop.options) {
      column.options = prop.options;
    }

    columns.push(column);
  }

  return columns;
}

/**
 * Transforms ObjectSummaryWithProperties to TypeBrowserRowData.
 * Flattens the properties object and ensures id/title are at the top level.
 */
export function objectToRowData(obj: {
  id: string;
  title: string | null;
  properties: Record<string, unknown>;
}): TypeBrowserRowData {
  return {
    id: obj.id,
    title: obj.title ?? '',
    ...obj.properties,
  };
}
