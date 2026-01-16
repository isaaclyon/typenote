import * as React from 'react';
import { Input } from '../Input/index.js';
import { ColorSwatch } from './ColorSwatch.js';
import { DEFAULT_TYPE_COLORS, isValidHexColor, normalizeHexColor } from './constants.js';

export interface ColorPickerProps {
  value?: string | null | undefined;
  onChange: (color: string) => void;
  presets?: readonly string[];
}

export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ value, onChange, presets = DEFAULT_TYPE_COLORS }, ref) => {
    const [hexInput, setHexInput] = React.useState(value ?? '');
    const [hexError, setHexError] = React.useState<string | null>(null);

    // Sync hex input with value prop
    React.useEffect(() => {
      setHexInput(value ?? '');
      setHexError(null);
    }, [value]);

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setHexInput(inputValue);

      // Validate and apply
      if (inputValue === '') {
        setHexError(null);
        return;
      }

      if (isValidHexColor(inputValue)) {
        setHexError(null);
        onChange(normalizeHexColor(inputValue));
      } else {
        setHexError('Invalid hex color (use #RRGGBB format)');
      }
    };

    return (
      <div ref={ref} className="flex w-full flex-col gap-4">
        {/* Preset swatches */}
        <div>
          <div className="mb-2 text-xs font-semibold text-gray-700">Preset Colors</div>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((color) => (
              <ColorSwatch
                key={color}
                color={color}
                selected={value === color}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>

        {/* Hex input */}
        <div>
          <div className="mb-2 text-xs font-semibold text-gray-700">Custom Color</div>
          <Input
            type="text"
            placeholder="#RRGGBB"
            value={hexInput}
            onChange={handleHexInputChange}
            className={hexError ? 'border-red-500' : ''}
          />
          {hexError && <div className="mt-1 text-xs text-red-600">{hexError}</div>}
        </div>

        {/* Current color preview */}
        {value && (
          <div>
            <div className="mb-2 text-xs font-semibold text-gray-700">Current Color</div>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-sm border border-gray-200"
                style={{ backgroundColor: value }}
              />
              <code className="text-sm font-mono text-gray-700">{value}</code>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
