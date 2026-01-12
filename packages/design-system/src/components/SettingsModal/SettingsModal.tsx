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
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-800">Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1.5 rounded hover:bg-gray-100 transition-colors duration-100"
          aria-label="Close settings"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 max-h-[70vh] overflow-y-auto">{children}</div>
    </Modal>
  );
};

SettingsModal.displayName = 'SettingsModal';

export { SettingsModal };
