import type { LucideIcon } from 'lucide-react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  /** Toast message content */
  message: string;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Visual variant (default: 'default') */
  variant?: ToastVariant;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom className */
  className?: string;
}
