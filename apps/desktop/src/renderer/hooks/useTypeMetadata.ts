import { useState, useEffect, useCallback } from 'react';

interface TypeMetadata {
  id: string;
  key: string;
  name: string;
  color: string | null;
  icon: string | null;
  count: number;
}

interface UseTypeMetadataResult {
  types: TypeMetadata[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTypeMetadata(): UseTypeMetadataResult {
  const [types, setTypes] = useState<TypeMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [typesResult, objectsResult] = await Promise.all([
        window.typenoteAPI.listObjectTypes(),
        window.typenoteAPI.listObjects(),
      ]);

      if (!typesResult.success || !objectsResult.success) {
        setError('Failed to load type metadata');
        return;
      }

      // Count objects per type
      const countsByKey: Record<string, number> = {};
      for (const obj of objectsResult.result) {
        countsByKey[obj.typeKey] = (countsByKey[obj.typeKey] ?? 0) + 1;
      }

      // Build metadata
      const metadata = typesResult.result.map((type) => ({
        id: type.id,
        key: type.key,
        name: type.name,
        color: type.color,
        icon: type.icon,
        count: countsByKey[type.key] ?? 0,
      }));

      setTypes(metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMetadata();
  }, [fetchMetadata]);

  return { types, isLoading, error, refetch: fetchMetadata };
}
