import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ObjectDataGrid } from '@typenote/design-system';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';
import { buildDataGridColumns } from '../lib/buildDataGridColumns.js';
import { useObjectsForDataGrid } from '../hooks/useObjectsForDataGrid.js';

/**
 * Types view - displays type browser (table of objects).
 * Route: /#/types/:typeKey
 */
export function TypesView() {
  const { typeKey } = useParams<{ typeKey: string }>();
  const navigate = useNavigate();

  // Fetch type metadata for column generation
  const { data: typeInfo } = useQuery({
    queryKey: queryKeys.type(typeKey ?? ''),
    queryFn: ipcQuery(() => window.typenoteAPI.getObjectTypeByKey(typeKey ?? '')),
    enabled: !!typeKey,
  });

  // Fetch objects with sorting and delete capabilities
  const { rows, isLoading, sortColumn, sortDirection, onSortChange, onDelete } =
    useObjectsForDataGrid(typeKey ?? '');

  // Build columns from type schema
  const columns = useMemo(() => buildDataGridColumns(typeInfo ?? null), [typeInfo]);

  if (!typeKey) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a type from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold">{typeInfo?.name ?? typeKey}</h1>
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Loading...' : `${rows.length} objects`}
        </p>
      </header>

      <div className="flex-1 overflow-auto">
        <ObjectDataGrid
          data={rows}
          columns={columns}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          onRowOpen={(row) => navigate(`/notes/${row.id}`)}
          onRowDelete={onDelete}
          loading={isLoading}
          emptyMessage="No objects of this type yet"
        />
      </div>
    </div>
  );
}
