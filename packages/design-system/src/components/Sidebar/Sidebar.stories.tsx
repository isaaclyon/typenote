import * as React from 'react';
import type { Story } from '@ladle/react';
import { FileText, CheckSquare, User, Folder, BookOpen, Archive, Settings } from 'lucide-react';
import { Sidebar } from './Sidebar.js';
import { SidebarSection } from './SidebarSection.js';
import { SidebarSearchTrigger } from './SidebarSearchTrigger.js';
import { SidebarCalendarButton } from './SidebarCalendarButton.js';
import { SidebarTypesList } from './SidebarTypesList.js';
import { SidebarTypeItem } from './SidebarTypeItem.js';
import { SidebarActionButton } from './SidebarActionButton.js';
import { SidebarNewTypeButton } from './SidebarNewTypeButton.js';
import { Skeleton } from '../Skeleton/index.js';
import { EmptyState } from '../EmptyState/index.js';

export default {
  title: 'Components/Sidebar',
};

// Mock data
const MOCK_TYPES = [
  { id: '1', icon: FileText, label: 'Notes', count: 42, color: '#6495ED' },
  { id: '2', icon: CheckSquare, label: 'Tasks', count: 18, color: '#81c784' },
  { id: '3', icon: User, label: 'People', count: 7, color: '#ffb74d' },
  { id: '4', icon: Folder, label: 'Projects', count: 5, color: '#e57373' },
  { id: '5', icon: BookOpen, label: 'Resources', count: 23, color: '#91a7ff' },
];

const MOCK_MANY_TYPES = Array.from({ length: 25 }, (_, i) => ({
  id: `type-${i}`,
  icon: FileText,
  label: `Type ${i + 1}`,
  count: Math.floor(Math.random() * 100),
  color: '#6495ED',
}));

export const AllVariants: Story = () => (
  <div className="flex gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Full Sidebar</h2>
      <div className="h-[600px]">
        <Sidebar>
          <SidebarSection className="p-2 space-y-2">
            <SidebarSearchTrigger onClick={() => alert('Open search')} />
            <SidebarCalendarButton onClick={() => alert('Open today')} isToday />
          </SidebarSection>

          <SidebarSection title="Types">
            <SidebarTypesList>
              {MOCK_TYPES.map((type) => (
                <SidebarTypeItem
                  key={type.id}
                  icon={type.icon}
                  label={type.label}
                  count={type.count}
                  color={type.color}
                  selected={type.id === '1'}
                />
              ))}
              <SidebarNewTypeButton onClick={() => alert('Create type')} />
            </SidebarTypesList>
          </SidebarSection>

          <SidebarSection className="p-2 space-y-1 mt-auto">
            <SidebarActionButton
              icon={Settings}
              label="Settings"
              onClick={() => alert('Settings')}
              withDivider
            />
            <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
          </SidebarSection>
        </Sidebar>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Type Item States</h2>
      <div className="border border-gray-200 rounded p-4 bg-white space-y-2">
        <div>
          <p className="text-xs text-gray-500 mb-2">Default</p>
          <SidebarTypeItem icon={FileText} label="Notes" count={42} color="#6495ED" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Selected</p>
          <SidebarTypeItem icon={FileText} label="Notes" count={42} color="#6495ED" selected />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Long Label</p>
          <SidebarTypeItem
            icon={FileText}
            label="This is a very long type name that should truncate"
            count={999}
            color="#6495ED"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Zero Count</p>
          <SidebarTypeItem icon={FileText} label="Empty Type" count={0} color="#6495ED" />
        </div>
      </div>
    </section>
  </div>
);

export const Default: Story = () => (
  <div className="h-[600px]">
    <Sidebar>
      <SidebarSection className="p-2 space-y-2">
        <SidebarSearchTrigger onClick={() => alert('Open search')} />
        <SidebarCalendarButton onClick={() => alert('Open today')} />
      </SidebarSection>

      <SidebarSection title="Types">
        <SidebarTypesList>
          {MOCK_TYPES.map((type) => (
            <SidebarTypeItem
              key={type.id}
              icon={type.icon}
              label={type.label}
              count={type.count}
              color={type.color}
              onClick={() => alert(`Clicked ${type.label}`)}
            />
          ))}
          <SidebarNewTypeButton onClick={() => alert('Create type')} />
        </SidebarTypesList>
      </SidebarSection>

      <SidebarSection className="p-2 space-y-1 mt-auto">
        <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
        <SidebarActionButton icon={Settings} label="Settings" onClick={() => alert('Settings')} />
      </SidebarSection>
    </Sidebar>
  </div>
);

export const Interactive: Story = () => {
  const [selectedType, setSelectedType] = React.useState<string>('1');

  return (
    <div className="h-[600px]">
      <Sidebar>
        <SidebarSection className="p-2 space-y-2">
          <SidebarSearchTrigger onClick={() => alert('Open search')} />
          <SidebarCalendarButton onClick={() => alert('Open today')} isToday />
        </SidebarSection>

        <SidebarSection title="Types">
          <SidebarTypesList>
            {MOCK_TYPES.map((type) => (
              <SidebarTypeItem
                key={type.id}
                icon={type.icon}
                label={type.label}
                count={type.count}
                color={type.color}
                selected={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
              />
            ))}
            <SidebarNewTypeButton onClick={() => alert('Create type')} />
          </SidebarTypesList>
        </SidebarSection>

        <SidebarSection className="p-2 space-y-1 mt-auto">
          <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
          <SidebarActionButton icon={Settings} label="Settings" onClick={() => alert('Settings')} />
        </SidebarSection>
      </Sidebar>
    </div>
  );
};

export const WithManyItems: Story = () => {
  const [selectedType, setSelectedType] = React.useState<string>('type-0');

  return (
    <div className="h-[600px]">
      <Sidebar>
        <SidebarSection className="p-2 space-y-2">
          <SidebarSearchTrigger onClick={() => alert('Open search')} />
          <SidebarCalendarButton onClick={() => alert('Open today')} />
        </SidebarSection>

        <SidebarSection title="Types">
          <SidebarTypesList>
            {MOCK_MANY_TYPES.map((type) => (
              <SidebarTypeItem
                key={type.id}
                icon={type.icon}
                label={type.label}
                count={type.count}
                color={type.color}
                selected={selectedType === type.id}
                onClick={() => setSelectedType(type.id)}
              />
            ))}
            <SidebarNewTypeButton onClick={() => alert('Create type')} />
          </SidebarTypesList>
        </SidebarSection>

        <SidebarSection className="p-2 space-y-1 mt-auto">
          <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
          <SidebarActionButton icon={Settings} label="Settings" onClick={() => alert('Settings')} />
        </SidebarSection>
      </Sidebar>
    </div>
  );
};

export const Empty: Story = () => (
  <div className="h-[600px]">
    <Sidebar>
      <SidebarSection className="p-2 space-y-2">
        <SidebarSearchTrigger onClick={() => alert('Open search')} />
        <SidebarCalendarButton onClick={() => alert('Open today')} />
      </SidebarSection>

      <SidebarSection title="Types">
        <SidebarTypesList>
          <div className="p-4">
            <EmptyState title="No types yet" description="Create your first type to get started" />
          </div>
          <SidebarNewTypeButton onClick={() => alert('Create type')} />
        </SidebarTypesList>
      </SidebarSection>

      <SidebarSection className="p-2 space-y-1 mt-auto">
        <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
        <SidebarActionButton icon={Settings} label="Settings" onClick={() => alert('Settings')} />
      </SidebarSection>
    </Sidebar>
  </div>
);

export const Loading: Story = () => (
  <div className="h-[600px]">
    <Sidebar>
      <SidebarSection className="p-2 space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </SidebarSection>

      <SidebarSection title="Types">
        <SidebarTypesList>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full" />
            ))}
          </div>
        </SidebarTypesList>
      </SidebarSection>

      <SidebarSection className="p-2 space-y-1 mt-auto">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </SidebarSection>
    </Sidebar>
  </div>
);

export const TypeItemVariants: Story = () => (
  <div className="space-y-4 max-w-md">
    <section>
      <h3 className="text-sm font-semibold mb-2">Default States</h3>
      <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
        <SidebarTypeItem icon={FileText} label="Notes" count={42} color="#6495ED" />
        <SidebarTypeItem icon={CheckSquare} label="Tasks" count={18} color="#81c784" />
        <SidebarTypeItem icon={User} label="People" count={7} color="#ffb74d" />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">Selected State</h3>
      <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
        <SidebarTypeItem icon={FileText} label="Notes" count={42} color="#6495ED" selected />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">Edge Cases</h3>
      <div className="border border-gray-200 rounded p-2 bg-white space-y-1">
        <SidebarTypeItem
          icon={FileText}
          label="Very long type name that should truncate gracefully"
          count={999}
          color="#6495ED"
        />
        <SidebarTypeItem icon={FileText} label="Zero Count" count={0} color="#6495ED" />
        <SidebarTypeItem icon={FileText} label="Large Count" count={12345} color="#6495ED" />
      </div>
    </section>
  </div>
);

export const SearchTriggerVariants: Story = () => (
  <div className="space-y-4 max-w-md">
    <section>
      <h3 className="text-sm font-semibold mb-2">Search Trigger</h3>
      <div className="space-y-2">
        <SidebarSearchTrigger onClick={() => alert('Search')} />
        <SidebarSearchTrigger onClick={() => alert('Search')} shortcut="Ctrl+K" />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">Calendar Button</h3>
      <div className="space-y-2">
        <SidebarCalendarButton onClick={() => alert('Calendar')} />
        <SidebarCalendarButton onClick={() => alert('Calendar')} isToday />
      </div>
    </section>
  </div>
);

export const ActionButtonVariants: Story = () => (
  <div className="space-y-4 max-w-md">
    <section>
      <h3 className="text-sm font-semibold mb-2">Action Buttons</h3>
      <div className="border border-gray-200 rounded p-2 bg-white">
        <SidebarActionButton
          icon={Settings}
          label="Settings"
          onClick={() => alert('Settings')}
          withDivider
        />
        <SidebarActionButton icon={Archive} label="Archive" onClick={() => alert('Archive')} />
      </div>
    </section>

    <section>
      <h3 className="text-sm font-semibold mb-2">New Type Button</h3>
      <SidebarNewTypeButton onClick={() => alert('Create type')} />
    </section>
  </div>
);
