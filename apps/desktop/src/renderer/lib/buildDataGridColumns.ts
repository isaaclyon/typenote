import type { ObjectType, PropertyDefinition, PropertyType } from '@typenote/api';
import type { ObjectSummaryWithProperties } from '@typenote/storage';
import type { DataGridColumn, DataGridColumnType } from '@typenote/design-system';

/**
 * Maps PropertyType from API to DataGridColumnType for the grid.
 * Most types map directly; richtext is displayed as plain text.
 */
function mapPropertyType(type: PropertyType): DataGridColumnType {
  // richtext has no special grid representation
  if (type === 'richtext') {
    return 'text';
  }
  return type;
}

/**
 * Determines if a column should be sortable based on its type.
 * Reference types (ref, refs) cannot be sorted because they're IDs.
 */
function isSortable(type: PropertyType): boolean {
  return type !== 'ref' && type !== 'refs';
}

/**
 * Builds DataGrid columns from an ObjectType schema.
 *
 * @param objectType - The object type to build columns for, or null
 * @returns Array of DataGridColumn definitions, always starting with Title
 */
export function buildDataGridColumns(
  objectType: ObjectType | null
): DataGridColumn<ObjectSummaryWithProperties>[] {
  // Title column is always first, pinned left
  const titleColumn: DataGridColumn<ObjectSummaryWithProperties> = {
    key: 'title',
    header: 'Title',
    type: 'title',
    isTitle: true,
    pinned: 'left',
    sortable: true,
    editable: false,
  };

  // If no schema or no properties, return just the title column
  if (objectType?.schema?.properties === undefined || objectType.schema.properties.length === 0) {
    return [titleColumn];
  }

  // Map each property to a column
  const propertyColumns = objectType.schema.properties.map(
    (prop: PropertyDefinition): DataGridColumn<ObjectSummaryWithProperties> => {
      const column: DataGridColumn<ObjectSummaryWithProperties> = {
        key: prop.key,
        header: prop.name,
        type: mapPropertyType(prop.type),
        sortable: isSortable(prop.type),
        editable: false,
        getValue: (row: ObjectSummaryWithProperties) => row.properties[prop.key],
      };

      // Add options for select/multiselect types
      if ((prop.type === 'select' || prop.type === 'multiselect') && prop.options !== undefined) {
        column.options = prop.options;
      }

      return column;
    }
  );

  return [titleColumn, ...propertyColumns];
}
