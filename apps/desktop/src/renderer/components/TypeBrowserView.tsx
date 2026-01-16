/**
 * TypeBrowserView Component
 *
 * A view that displays objects of a specific type in a TypeBrowser table.
 * Fetches the object type schema and objects, builds columns dynamically.
 */

/// <reference path="../global.d.ts" />

import * as React from 'react';
import { TypeBrowser, Text } from '@typenote/design-system';
import { useObjectType } from '../hooks/useObjectType.js';
import { useObjectsByType } from '../hooks/useObjectsByType.js';
import {
  buildColumnsFromSchema,
  objectToRowData,
  type TypeBrowserRowData,
} from '../utils/buildColumnsFromSchema.js';

export interface TypeBrowserViewProps {
  /** The type key to display objects for */
  typeKey: string;
  /** Called when the Open button is clicked on a title cell */
  onOpenObject: (objectId: string) => void;
  /** Called when a cell value is edited */
  onCellEdit?: (objectId: string, propertyKey: string, value: unknown) => void;
}

export function TypeBrowserView({
  typeKey,
  onOpenObject,
  onCellEdit,
}: TypeBrowserViewProps): React.ReactElement {
  // Fetch the object type schema
  const { objectType, isLoading: isLoadingType, error: typeError } = useObjectType({ typeKey });

  // Fetch objects of this type with properties
  const {
    objects,
    isLoading: isLoadingObjects,
    error: objectsError,
  } = useObjectsByType({ typeKey });

  // Build columns from the schema
  const columns = React.useMemo(() => buildColumnsFromSchema(objectType), [objectType]);

  // Transform objects to row data
  const rowData = React.useMemo(() => objects.map(objectToRowData), [objects]);

  // Handle title Open button click
  const handleTitleOpen = React.useCallback(
    (row: TypeBrowserRowData) => {
      onOpenObject(row.id);
    },
    [onOpenObject]
  );

  // Handle row click - navigate to the object
  const handleRowClick = React.useCallback(
    (row: TypeBrowserRowData) => {
      onOpenObject(row.id);
    },
    [onOpenObject]
  );

  // Handle cell edit
  const handleCellEdit = React.useCallback(
    (rowId: string, columnId: string, value: unknown) => {
      onCellEdit?.(rowId, columnId, value);
    },
    [onCellEdit]
  );

  // Compute loading state
  const isLoading = isLoadingType || isLoadingObjects;

  // Compute error state
  const error = typeError ?? objectsError;

  // Error display
  if (error && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Text variant="bodySmall" muted className="mb-2">
            Failed to load {typeKey}
          </Text>
          <Text variant="caption" muted>
            {error}
          </Text>
        </div>
      </div>
    );
  }

  // Get display name for empty state
  const typeName = objectType?.pluralName ?? objectType?.name ?? typeKey;

  // Build optional props - only include if callback is provided
  // (required for exactOptionalPropertyTypes compliance)
  const optionalProps = onCellEdit ? { onCellEdit: handleCellEdit } : {};

  return (
    <div className="flex-1 flex flex-col h-full">
      <TypeBrowser
        data={rowData}
        columns={columns}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={`No ${typeName.toLowerCase()} yet`}
        onRowClick={handleRowClick}
        onTitleOpen={handleTitleOpen}
        {...optionalProps}
      />
    </div>
  );
}
