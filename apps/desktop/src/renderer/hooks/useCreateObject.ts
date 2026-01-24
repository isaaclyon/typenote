import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to create objects with loading/error state and automatic navigation.
 * Invalidates relevant queries after successful creation.
 */
export function useCreateObject() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createObject = useCallback(
    async (typeKey: string, title: string, properties?: Record<string, unknown>) => {
      setIsCreating(true);
      setError(null);

      const result = await window.typenoteAPI.createObject(typeKey, title, properties ?? {});

      setIsCreating(false);

      if (result.success) {
        // Invalidate queries to refresh UI
        void queryClient.invalidateQueries({ queryKey: ['objects'] });
        void queryClient.invalidateQueries({ queryKey: ['types', 'counts'] });
        void queryClient.invalidateQueries({ queryKey: ['recent-objects'] });

        // Navigate to new object
        navigate(`/notes/${result.result.id}`);

        return result.result;
      } else {
        setError(result.error.message);
        return null;
      }
    },
    [navigate, queryClient]
  );

  return {
    createObject,
    isCreating,
    error,
    // Expose queryClient for testing only
    _queryClient: queryClient,
  };
}
