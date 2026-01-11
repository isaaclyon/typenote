import type { ReactNode } from 'react';

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal content */
  children: ReactNode;
  /** Custom className for modal container */
  className?: string;
}

export interface ModalHeaderProps {
  /** Header title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Custom className */
  className?: string;
}

export interface ModalContentProps {
  /** Content body */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

export interface ModalFooterProps {
  /** Footer content (typically buttons) */
  children: ReactNode;
  /** Custom className */
  className?: string;
}
