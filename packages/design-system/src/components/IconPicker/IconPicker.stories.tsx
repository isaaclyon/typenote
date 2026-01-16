import type { Story } from '@ladle/react';
import { useState } from 'react';
import { IconPicker, getIconByName } from './index.js';

export const Default: Story = () => {
  const [selected, setSelected] = useState<string | null>('FileText');

  return (
    <div className="p-8 max-w-md">
      <div className="mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Selected Icon:</div>
        {selected &&
          (() => {
            const Icon = getIconByName(selected);
            return Icon ? (
              <div className="flex items-center gap-2">
                <Icon className="h-6 w-6" />
                <span className="text-sm">{selected}</span>
              </div>
            ) : null;
          })()}
      </div>
      <IconPicker value={selected} onChange={setSelected} />
    </div>
  );
};

Default.storyName = 'Default';

export const NoSearch: Story = () => {
  const [selected, setSelected] = useState<string | null>('Heart');

  return (
    <div className="p-8 max-w-md">
      <IconPicker value={selected} onChange={setSelected} searchable={false} />
    </div>
  );
};

NoSearch.storyName = 'Without Search';

export const SmallHeight: Story = () => {
  const [selected, setSelected] = useState<string | null>('Star');

  return (
    <div className="p-8 max-w-md">
      <IconPicker value={selected} onChange={setSelected} maxHeight={200} />
    </div>
  );
};

SmallHeight.storyName = 'Small Height (200px)';

export const Interactive: Story = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const handleChange = (iconName: string) => {
    setSelected(iconName);
    setHistory((prev) => [...prev, iconName].slice(-5));
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Icon Picker</h3>
          <IconPicker value={selected} onChange={handleChange} maxHeight={300} />
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Selected Icon</h3>
          {selected &&
            (() => {
              const Icon = getIconByName(selected);
              return Icon ? (
                <div className="rounded-sm border border-gray-200 p-6 flex flex-col items-center gap-3">
                  <Icon className="h-12 w-12 text-gray-700" />
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{selected}</code>
                </div>
              ) : null;
            })()}

          {history.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold text-gray-500">Recent Selections</h4>
              <div className="flex flex-wrap gap-2">
                {history.map((iconName, i) => {
                  const Icon = getIconByName(iconName);
                  return Icon ? (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded-sm bg-gray-100 px-2 py-1"
                    >
                      <Icon className="h-3 w-3" />
                      <span className="text-xs">{iconName}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Interactive.storyName = 'Interactive Demo';

export const PreSelected: Story = () => {
  const [selected, setSelected] = useState<string | null>('Sparkles');

  return (
    <div className="p-8 max-w-md">
      <div className="mb-4 text-sm text-gray-600">
        Pre-selected icon: <strong>Sparkles</strong>
      </div>
      <IconPicker value={selected} onChange={setSelected} />
    </div>
  );
};

PreSelected.storyName = 'Pre-selected Icon';
