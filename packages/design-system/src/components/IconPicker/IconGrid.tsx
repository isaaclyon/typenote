import * as React from 'react';
import { ScrollArea } from '../ScrollArea/index.js';
import { IconButton } from './IconButton.js';
import { getIconByName } from './iconList.js';

export interface IconGridProps {
  icons: string[];
  selectedIcon?: string | null | undefined;
  onSelectIcon: (iconName: string) => void;
  maxHeight?: number;
}

export const IconGrid = React.forwardRef<HTMLDivElement, IconGridProps>(
  ({ icons, selectedIcon, onSelectIcon, maxHeight = 400 }, ref) => {
    return (
      <ScrollArea ref={ref} className="w-full" style={{ maxHeight }}>
        <div className="grid grid-cols-6 gap-2 p-2">
          {icons.map((iconName) => {
            const IconComponent = getIconByName(iconName);
            if (!IconComponent) return null;

            return (
              <IconButton
                key={iconName}
                Icon={IconComponent}
                iconName={iconName}
                selected={selectedIcon === iconName}
                onClick={() => onSelectIcon(iconName)}
              />
            );
          })}
          {icons.length === 0 && (
            <div className="col-span-6 py-8 text-center text-sm text-muted-foreground">
              No icons found
            </div>
          )}
        </div>
      </ScrollArea>
    );
  }
);

IconGrid.displayName = 'IconGrid';
