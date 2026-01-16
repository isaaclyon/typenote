import { useState, useEffect } from 'react';
import type { NotesCreatedItem } from '@typenote/design-system';

interface UseObjectsCreatedOnDateResult {
  objects: NotesCreatedItem[];
  isLoading: boolean;
}

export function useObjectsCreatedOnDate(dateKey: string): UseObjectsCreatedOnDateResult {
  const [objects, setObjects] = useState<NotesCreatedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    window.typenoteAPI
      .getObjectsCreatedOnDate(dateKey)
      .then((result) => {
        if (result.success) {
          setObjects(result.result);
        } else {
          setObjects([]);
        }
      })
      .catch(() => {
        setObjects([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dateKey]);

  return { objects, isLoading };
}
