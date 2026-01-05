import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card.js';
import { ScrollArea } from './ui/scroll-area.js';
import type { ObjectSummary } from '@typenote/storage';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; objects: ObjectSummary[] };

export function ObjectList() {
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

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
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
          <Card key={obj.id} className="cursor-pointer hover:bg-accent transition-colors">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="truncate">{obj.title}</CardTitle>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {obj.typeKey}
                </span>
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
