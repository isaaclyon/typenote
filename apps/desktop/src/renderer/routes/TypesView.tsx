import { useParams } from 'react-router-dom';

/**
 * Types view - displays type browser (table of objects).
 * Route: /#/types/:typeKey
 */
export function TypesView() {
  const { typeKey } = useParams<{ typeKey: string }>();

  return (
    <div className="flex h-full flex-col p-4">
      <h1 className="text-lg font-semibold">Type Browser: {typeKey}</h1>
      <p className="text-sm text-muted-foreground">Type browser will be implemented in Phase 4</p>
    </div>
  );
}
