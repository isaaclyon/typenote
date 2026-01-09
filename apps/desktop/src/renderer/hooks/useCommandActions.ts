/**
 * useCommandActions Hook
 *
 * Handles execution of command palette commands:
 * - Navigation: Navigate to an object
 * - Creation: Create a new object and navigate to it
 * - Action: Execute a custom handler
 */

import { useCallback } from 'react';
import type { Command } from '../components/CommandPalette/commands/types.js';

export interface UseCommandActionsOptions {
  onNavigate?: ((objectId: string) => void) | undefined;
  onClose: () => void;
}

export interface UseCommandActionsResult {
  handleCommand: (command: Command) => Promise<void>;
}

export function useCommandActions({
  onNavigate,
  onClose,
}: UseCommandActionsOptions): UseCommandActionsResult {
  const handleCommand = useCallback(
    async (command: Command) => {
      switch (command.type) {
        case 'navigation':
          onNavigate?.(command.objectId);
          onClose();
          break;

        case 'creation': {
          const title = command.defaultTitle ?? `New ${command.typeKey}`;
          const result = await window.typenoteAPI.createObject(command.typeKey, title);
          if (result.success) {
            onNavigate?.(result.result.id);
            onClose();
          }
          break;
        }

        case 'action':
          await command.handler();
          onClose();
          break;
      }
    },
    [onNavigate, onClose]
  );

  return { handleCommand };
}
