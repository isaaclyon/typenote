import * as React from 'react';
import type { SettingsSectionProps } from './types.js';

/**
 * A section within settings, with a title header.
 */
const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => {
  return (
    <div className="py-4">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

SettingsSection.displayName = 'SettingsSection';

export { SettingsSection };
