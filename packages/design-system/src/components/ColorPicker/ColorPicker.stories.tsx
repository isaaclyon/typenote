import type { Story } from '@ladle/react';
import { useState } from 'react';
import { ColorPicker, DEFAULT_TYPE_COLORS } from './index.js';

export const Default: Story = () => {
  const [selected, setSelected] = useState<string>('#6495ED');

  return (
    <div className="p-8 max-w-md">
      <ColorPicker value={selected} onChange={setSelected} />
    </div>
  );
};

Default.storyName = 'Default';

export const NoInitialValue: Story = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="p-8 max-w-md">
      <div className="mb-4 text-sm text-gray-600">No color selected initially</div>
      <ColorPicker value={selected} onChange={setSelected} />
    </div>
  );
};

NoInitialValue.storyName = 'No Initial Value';

export const CustomPresets: Story = () => {
  const [selected, setSelected] = useState<string>('#FF6B6B');

  const customColors = [
    '#FF6B6B', // Soft Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#FFA07A', // Light Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Lavender
    '#85C1E2', // Powder Blue
  ] as const;

  return (
    <div className="p-8 max-w-md">
      <div className="mb-4 text-sm text-gray-600">Using custom preset colors</div>
      <ColorPicker value={selected} onChange={setSelected} presets={customColors} />
    </div>
  );
};

CustomPresets.storyName = 'Custom Presets';

export const Interactive: Story = () => {
  const [selected, setSelected] = useState<string>('#6495ED');
  const [history, setHistory] = useState<string[]>([]);

  const handleChange = (color: string) => {
    setSelected(color);
    if (!history.includes(color)) {
      setHistory((prev) => [...prev, color].slice(-6));
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Color Picker</h3>
          <ColorPicker value={selected} onChange={handleChange} />
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Selected Color</h3>
          <div className="rounded-sm border border-gray-200 p-6">
            <div
              className="h-24 w-24 rounded-sm border border-gray-200 mx-auto mb-3"
              style={{ backgroundColor: selected }}
            />
            <code className="text-sm bg-gray-100 px-2 py-1 rounded block text-center">
              {selected}
            </code>
          </div>

          {history.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold text-gray-500">Recent Selections</h4>
              <div className="flex flex-wrap gap-2">
                {history.map((color, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 rounded-sm border border-gray-200 px-2 py-1"
                  >
                    <div
                      className="h-3 w-3 rounded-sm border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Interactive.storyName = 'Interactive Demo';

export const AllDefaultColors: Story = () => {
  return (
    <div className="p-8">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">All Default Type Colors</h3>
      <div className="grid grid-cols-6 gap-4">
        {DEFAULT_TYPE_COLORS.map((color) => (
          <div key={color} className="flex flex-col items-center gap-2">
            <div
              className="h-16 w-16 rounded-sm border border-gray-200"
              style={{ backgroundColor: color }}
            />
            <code className="text-xs font-mono">{color}</code>
          </div>
        ))}
      </div>
    </div>
  );
};

AllDefaultColors.storyName = 'All Default Colors';

export const ValidationStates: Story = () => {
  const [color1, setColor1] = useState<string>('#6495ED');
  const [color2, setColor2] = useState<string>('');

  return (
    <div className="p-8 space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Valid Color</h3>
        <div className="max-w-md">
          <ColorPicker value={color1} onChange={setColor1} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Empty State</h3>
        <div className="max-w-md">
          <ColorPicker value={color2} onChange={setColor2} />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Try typing an invalid hex color (e.g., "invalid" or "#12345") to see validation
        </div>
      </div>
    </div>
  );
};

ValidationStates.storyName = 'Validation States';
