import * as React from 'react';
import { X } from 'lucide-react';
import { Modal } from '../Modal/index.js';
import type { SettingsModalProps } from './types.js';

/**
 * A modal specifically for settings, with proper header and close button.
 */
const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose, children }) => {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1.5 rounded hover:bg-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Close settings"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">{children}</div>
    </Modal>
  );
};

SettingsModal.displayName = 'SettingsModal';

export { SettingsModal };
