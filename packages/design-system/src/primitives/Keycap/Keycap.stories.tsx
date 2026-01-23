import type { Story } from '@ladle/react';
import { Keycap } from './Keycap.js';

export default {
  title: 'Primitives/Keycap',
};

export const Overview: Story = () => {
  return (
    <div className="space-y-10 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Single Keys</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Keycap>⌘</Keycap>
          <Keycap>⇧</Keycap>
          <Keycap>⌥</Keycap>
          <Keycap>⌃</Keycap>
          <Keycap>↵</Keycap>
          <Keycap>⎋</Keycap>
          <Keycap>⌫</Keycap>
          <Keycap>⇥</Keycap>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Letter Keys</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Keycap>A</Keycap>
          <Keycap>K</Keycap>
          <Keycap>N</Keycap>
          <Keycap>P</Keycap>
          <Keycap>F</Keycap>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Sizes</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Keycap size="xs">⌘</Keycap>
            <Keycap size="xs">K</Keycap>
            <span className="ml-2 text-sm text-gray-500">Extra Small</span>
          </div>
          <div className="flex items-center gap-1">
            <Keycap size="sm">⌘</Keycap>
            <Keycap size="sm">K</Keycap>
            <span className="ml-2 text-sm text-gray-500">Small</span>
          </div>
          <div className="flex items-center gap-1">
            <Keycap size="md">⌘</Keycap>
            <Keycap size="md">K</Keycap>
            <span className="ml-2 text-sm text-gray-500">Medium</span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">Common Shortcuts</h2>
        <div className="space-y-3">
          <ShortcutRow keys={['⌘', 'K']} label="Command palette" />
          <ShortcutRow keys={['⌘', 'N']} label="New note" />
          <ShortcutRow keys={['⌘', 'F']} label="Search" />
          <ShortcutRow keys={['⌘', '⇧', 'P']} label="Quick switcher" />
          <ShortcutRow keys={['⌘', '/']} label="Toggle sidebar" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-600">In Context</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Press</span>
          <Keycap>⌘</Keycap>
          <Keycap>K</Keycap>
          <span>to open the command palette</span>
        </div>
      </section>
    </div>
  );
};

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between w-64">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <Keycap key={i}>{key}</Keycap>
        ))}
      </div>
    </div>
  );
}
