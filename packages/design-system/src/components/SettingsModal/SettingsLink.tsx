import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface SettingsLinkProps {
  /** Link label */
  label: string;
  /** Optional description */
  description?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * A clickable link row in settings, typically for navigation to sub-pages.
 */
const SettingsLink: React.FC<SettingsLinkProps> = ({ label, description, onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between py-3 px-1 rounded',
        'hover:bg-muted transition-colors duration-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2',
        className
      )}
    >
      <div className="flex flex-col items-start">
        <span className="text-sm text-foreground">{label}</span>
        {description && <span className="text-xs text-muted-foreground mt-0.5">{description}</span>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </button>
  );
};

SettingsLink.displayName = 'SettingsLink';

export { SettingsLink };
