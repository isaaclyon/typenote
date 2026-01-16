/**
 * Styled Toaster Component
 *
 * Wraps Sonner's Toaster with TypeNote design system styling.
 * Position: bottom-right, Duration: 4s
 */

import type { ReactElement } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(): ReactElement {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'bg-background border border-border rounded shadow-md text-foreground',
          error: 'border-l-2 border-l-error',
          success: 'border-l-2 border-l-success',
          warning: 'border-l-2 border-l-warning',
          description: 'text-muted-foreground',
          title: 'font-medium',
        },
      }}
    />
  );
}
