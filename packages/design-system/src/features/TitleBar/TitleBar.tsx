import * as React from 'react';

import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

export interface TitleBarProps {
  /** Additional CSS classes */
  className?: string;
  /** Children to render in the title bar (use sparingly - prefer empty) */
  children?: React.ReactNode;
}

// ============================================================================
// TitleBar
// ============================================================================

/**
 * Custom Electron window title bar replacement.
 *
 * Provides a draggable region for window movement. Platform-specific window
 * controls (traffic lights on macOS, overlay on Windows) are handled by
 * Electron configuration in the main process.
 *
 * Usage:
 * - Full width, sits above all other content (sidebar, header, main)
 * - Height: 28px compact
 * - Entire region is draggable by default
 * - Any interactive children should use `drag-none` class to remain clickable
 *
 * Electron config requirements (already set in apps/desktop):
 * - macOS: titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 16 }
 * - Windows: titleBarOverlay with custom colors
 */
export function TitleBar({ className, children }: TitleBarProps) {
  return (
    <div
      className={cn(
        // Layout
        'h-7 w-full shrink-0',
        // Drag behavior - entire region is draggable (Electron frameless window)
        'app-region-drag',
        // Visual styling - white background, seamless with app
        'bg-background',
        // Ensure it sits in the layout flow
        'relative',
        className
      )}
    >
      {children}
    </div>
  );
}
