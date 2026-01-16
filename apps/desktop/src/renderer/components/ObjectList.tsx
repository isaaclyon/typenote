/// <reference path="../global.d.ts" />

import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  ScrollArea,
  Skeleton,
  cn,
} from '@typenote/design-system';
import type { ObjectSummary } from '@typenote/api';
import { useTypenoteEvents } from '../hooks/useTypenoteEvents.js';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; objects: ObjectSummary[] };

interface ObjectListProps {
  onSelect: (id: string) => void;
  selectedId: string | null;
  onPin?: (id: string) => void;
  onUnpin?: (id: string) => void;
  isPinned?: (id: string) => boolean;
}

export function ObjectList({ onSelect, selectedId, onPin, onUnpin, isPinned }: ObjectListProps) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    async function loadObjects() {
      try {
        const result = await window.typenoteAPI.listObjects();
        if (result.success) {
          setState({ status: 'loaded', objects: result.result });
        } else {
          setState({ status: 'error', message: result.error.message });
        }
      } catch (err) {
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
    void loadObjects();
  }, []);

  // Refetch when object created
  useTypenoteEvents((event) => {
    if (event.type === 'object:created') {
      // Simple approach: refetch entire list
      void (async () => {
        const result = await window.typenoteAPI.listObjects();
        if (result.success) {
          setState({ status: 'loaded', objects: result.result });
        }
      })();
    }
  });

  if (state.status === 'loading') {
    return (
      <ScrollArea className="h-full" data-testid="loading-skeleton">
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error: {state.message}
      </div>
    );
  }

  if (state.objects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No objects yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        {state.objects.map((obj) => (
          <Card
            key={obj.id}
            className={cn(
              'cursor-pointer hover:bg-accent transition-colors',
              selectedId === obj.id && 'ring-2 ring-primary'
            )}
            onClick={() => onSelect(obj.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              // Simple approach: use window.confirm for now
              const pinned = isPinned?.(obj.id);
              if (pinned) {
                if (window.confirm('Unpin from sidebar?')) {
                  onUnpin?.(obj.id);
                }
              } else {
                if (window.confirm('Pin to sidebar?')) {
                  onPin?.(obj.id);
                }
              }
            }}
            data-testid={`object-card-${obj.id}`}
          >
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="truncate">{obj.title}</CardTitle>
                <Badge variant="secondary">{obj.typeKey}</Badge>
              </div>
              <CardDescription className="text-xs">
                {new Date(obj.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
