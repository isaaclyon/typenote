import type { Story } from '@ladle/react';
import { colors, typography, spacing, borderRadius } from '@typenote/design-system';

export default {
  title: 'Design System/Tokens',
};

const grayEntries = Object.entries(colors.gray) as [string, string][];
const accentEntries = Object.entries(colors.accent) as [string, string][];
const fontSizeEntries = Object.entries(typography.fontSize) as [string, string][];
const fontWeightEntries = Object.entries(typography.fontWeight) as [string, number][];
const spacingEntries = Object.entries(spacing) as [string, string][];
const borderRadiusEntries = Object.entries(borderRadius) as [string, string][];

export const Colors: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Warm Grayscale</h2>
      <div className="grid grid-cols-5 gap-2">
        {grayEntries.map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-lg border border-gray-200"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono">{key}</span>
            <span className="text-xs text-gray-500">{value}</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Cornflower Accent</h2>
      <div className="grid grid-cols-4 gap-2">
        {accentEntries.map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-lg border border-gray-200"
              style={{ backgroundColor: value }}
            />
            <span className="text-xs font-mono">{key}</span>
            <span className="text-xs text-gray-500">{value}</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Semantic Colors</h2>
      <div className="grid grid-cols-4 gap-2">
        {(['error', 'success', 'warning', 'info'] as const).map((key) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <div
              className="w-16 h-16 rounded-lg border border-gray-200"
              style={{ backgroundColor: colors[key] }}
            />
            <span className="text-xs font-mono">{key}</span>
            <span className="text-xs text-gray-500">{colors[key]}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export const Typography: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Font Families</h2>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Sans (IBM Plex Sans)</p>
          <p style={{ fontFamily: typography.fontFamily.sans }} className="text-xl">
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Mono (IBM Plex Mono)</p>
          <p style={{ fontFamily: typography.fontFamily.mono }} className="text-xl">
            const code = &quot;monospace&quot;;
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Font Sizes</h2>
      <div className="flex flex-col gap-2">
        {fontSizeEntries.map(([key, value]) => (
          <div key={key} className="flex items-baseline gap-4">
            <span className="text-sm text-gray-500 w-12">{key}</span>
            <span style={{ fontSize: value }}>Sample text at {value}</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Font Weights</h2>
      <div className="flex flex-col gap-2">
        {fontWeightEntries.map(([key, value]) => (
          <div key={key} className="flex items-baseline gap-4">
            <span className="text-sm text-gray-500 w-20">{key}</span>
            <span style={{ fontWeight: value }} className="text-lg">
              Font weight {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export const Spacing: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">Spacing Scale (4px base)</h2>
      <div className="flex flex-col gap-2">
        {spacingEntries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-sm text-gray-500 w-8">{key}</span>
            <div className="h-4 bg-accent-500 rounded" style={{ width: value }} />
            <span className="text-sm font-mono">{value}</span>
          </div>
        ))}
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Border Radius</h2>
      <div className="flex gap-4">
        {borderRadiusEntries.map(([key, value]) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 bg-accent-100 border-2 border-accent-500"
              style={{ borderRadius: value }}
            />
            <span className="text-sm font-mono">{key}</span>
            <span className="text-xs text-gray-500">{value}</span>
          </div>
        ))}
      </div>
    </section>
  </div>
);
