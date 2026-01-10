import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Text } from '../Text/index.js';
import { Button } from '../Button/index.js';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'p-12 rounded-md border border-dashed border-gray-300 bg-gray-50',
        className
      )}
    >
      {icon && (
        <div className="mb-4 opacity-40 text-gray-500 [&_svg]:w-12 [&_svg]:h-12">{icon}</div>
      )}
      <Text variant="body" className="font-medium mb-1 text-gray-700">
        {title}
      </Text>
      {description && (
        <Text variant="bodySmall" className="text-gray-500 mb-4 max-w-md">
          {description}
        </Text>
      )}
      {action && (
        <Button variant="default" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
