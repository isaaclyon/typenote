import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { ModalProps } from './types.js';

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, children, className }, ref) => {
    // Close on Escape key
    React.useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className={cn(
            'relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4',
            'animate-[slide-in-from-bottom_200ms_ease-out]',
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export { Modal };
