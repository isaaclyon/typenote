import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../Input/index.js';
import { IconGrid } from './IconGrid.js';
import { searchIcons } from './iconList.js';

export interface IconPickerProps {
  value?: string | null | undefined;
  onChange: (iconName: string) => void;
  searchable?: boolean;
  maxHeight?: number;
}

export const IconPicker = React.forwardRef<HTMLDivElement, IconPickerProps>(
  ({ value, onChange, searchable = true, maxHeight = 400 }, ref) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const filteredIcons = React.useMemo(() => searchIcons(searchQuery), [searchQuery]);

    return (
      <div ref={ref} className="flex w-full flex-col gap-3">
        {searchable && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        )}
        <IconGrid
          icons={filteredIcons}
          selectedIcon={value}
          onSelectIcon={onChange}
          maxHeight={maxHeight}
        />
        {filteredIcons.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }
);

IconPicker.displayName = 'IconPicker';
