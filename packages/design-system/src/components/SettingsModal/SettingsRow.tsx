import * as React from 'react';
import type { SettingsRowProps } from './types.js';

/**
 * A single row in settings with label and control.
 */
const SettingsRow: React.FC<SettingsRowProps> = ({ label, description, children }) => {
  return (
    <div className="flex items-center justify-between py-2 px-1 rounded hover:bg-muted transition-colors duration-100">
      <div className="flex flex-col">
        <span className="text-sm text-foreground">{label}</span>
        {description && <span className="text-xs text-muted-foreground mt-0.5">{description}</span>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
};

SettingsRow.displayName = 'SettingsRow';

export { SettingsRow };
