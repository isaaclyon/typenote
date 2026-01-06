/**
 * useDailyNoteInfo Hook
 *
 * Detects if an object is a daily note and extracts its date_key.
 * Used by the daily note navigation feature to determine if navigation
 * controls should be shown and what date is currently being viewed.
 */

import { useEffect, useState } from 'react';

export interface DailyNoteInfo {
  isLoading: boolean;
  isDailyNote: boolean;
  dateKey: string | null;
}

export function useDailyNoteInfo(objectId: string): DailyNoteInfo {
  const [state, setState] = useState<DailyNoteInfo>({
    isLoading: true,
    isDailyNote: false,
    dateKey: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchInfo() {
      setState((prev) => ({ ...prev, isLoading: true }));

      const result = await window.typenoteAPI.getObject(objectId);

      if (cancelled) return;

      if (result.success && result.result) {
        const obj = result.result;
        const isDailyNote = obj.typeKey === 'DailyNote';
        const dateKey = isDailyNote ? ((obj.properties['date_key'] as string) ?? null) : null;

        setState({ isLoading: false, isDailyNote, dateKey });
      } else {
        setState({ isLoading: false, isDailyNote: false, dateKey: null });
      }
    }

    void fetchInfo();

    return () => {
      cancelled = true;
    };
  }, [objectId]);

  return state;
}
