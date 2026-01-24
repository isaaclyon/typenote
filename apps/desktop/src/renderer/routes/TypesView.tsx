import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys.js';
import { ipcQuery } from '../lib/ipcQueryAdapter.js';

/**
 * Types view - displays type browser (table of objects).
 * Route: /#/types/:typeKey
 */
export function TypesView() {
  const { typeKey } = useParams<{ typeKey: string }>();

  const { data: typeInfo } = useQuery({
    queryKey: queryKeys.type(typeKey ?? ''),
    queryFn: ipcQuery(() => window.typenoteAPI.getObjectTypeByKey(typeKey ?? '')),
    enabled: !!typeKey,
  });

  const { data: objects, isLoading } = useQuery({
    queryKey: queryKeys.objectsByType(typeKey ?? ''),
    queryFn: ipcQuery(() =>
      window.typenoteAPI.listObjects({
        typeKey: typeKey as string,
        includeProperties: true,
      })
    ),
    enabled: !!typeKey,
  });

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
          {isLoading ? 'Loading...' : `${objects?.length ?? 0} objects`}
        </p>
      </header>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading objects...</p>
        ) : objects && objects.length > 0 ? (
          <div className="text-sm text-muted-foreground">
            {/* TODO: Replace with ObjectDataGrid */}
            <p>ObjectDataGrid will be wired here</p>
            <ul className="mt-2 space-y-1">
              {objects.slice(0, 10).map((obj) => (
                <li key={obj.id} className="text-foreground">
                  {obj.title}
                </li>
              ))}
              {objects.length > 10 && (
                <li className="text-muted-foreground">... and {objects.length - 10} more</li>
              )}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No objects of this type yet</p>
        )}
      </div>
    </div>
  );
}
