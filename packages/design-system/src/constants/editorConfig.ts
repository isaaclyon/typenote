import {
  FileText,
  Folder,
  User,
  BookOpen,
  CheckSquare,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import type { ComponentType } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Object Type Configuration (for RefNode)
// ─────────────────────────────────────────────────────────────────────────────

export type ObjectType = 'note' | 'project' | 'person' | 'resource' | 'task';

export interface TypeConfig {
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  decorationClass: string;
}

export const TYPE_CONFIG: Record<ObjectType, TypeConfig> = {
  note: {
    icon: FileText,
    colorClass: 'text-accent-500',
    decorationClass: 'decoration-accent-500',
  },
  task: {
    icon: CheckSquare,
    colorClass: 'text-success',
    decorationClass: 'decoration-success',
  },
  project: {
    icon: Folder,
    colorClass: 'text-error',
    decorationClass: 'decoration-error',
  },
  person: {
    icon: User,
    colorClass: 'text-warning',
    decorationClass: 'decoration-warning',
  },
  resource: {
    icon: BookOpen,
    colorClass: 'text-accent-300',
    decorationClass: 'decoration-accent-300',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Callout Configuration
// ─────────────────────────────────────────────────────────────────────────────

export type CalloutKind = 'info' | 'success' | 'warning' | 'error';

export interface CalloutConfig {
  icon: ComponentType<{ className?: string }>;
  bgClass: string;
  iconClass: string;
  defaultTitle: string;
}

export const CALLOUT_CONFIG: Record<CalloutKind, CalloutConfig> = {
  info: {
    icon: Info,
    bgClass: 'bg-accent-50',
    iconClass: 'text-accent-700',
    defaultTitle: 'Note',
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    iconClass: 'text-green-700',
    defaultTitle: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-700',
    defaultTitle: 'Warning',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    iconClass: 'text-red-700',
    defaultTitle: 'Error',
  },
};
