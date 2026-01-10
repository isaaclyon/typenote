import type { Story } from '@ladle/react';
import { KeyboardKey } from './KeyboardKey.js';

export default {
  title: 'Components/KeyboardKey',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-6">
    <section>
      <h2 className="text-lg font-semibold mb-4">Common Keys</h2>
      <div className="flex flex-wrap gap-2">
        <KeyboardKey>⌘</KeyboardKey>
        <KeyboardKey>⌃</KeyboardKey>
        <KeyboardKey>⌥</KeyboardKey>
        <KeyboardKey>⇧</KeyboardKey>
        <KeyboardKey>Enter</KeyboardKey>
        <KeyboardKey>Esc</KeyboardKey>
        <KeyboardKey>←</KeyboardKey>
        <KeyboardKey>→</KeyboardKey>
        <KeyboardKey>↑</KeyboardKey>
        <KeyboardKey>↓</KeyboardKey>
      </div>
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Key Combinations</h2>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <KeyboardKey>⌘</KeyboardKey>
          <span>+</span>
          <KeyboardKey>K</KeyboardKey>
          <span className="ml-2 text-gray-600">Open command palette</span>
        </div>
        <div className="flex items-center gap-1">
          <KeyboardKey>⌘</KeyboardKey>
          <span>+</span>
          <KeyboardKey>S</KeyboardKey>
          <span className="ml-2 text-gray-600">Save</span>
        </div>
      </div>
    </section>
  </div>
);

export const SingleKey: Story = () => <KeyboardKey>⌘</KeyboardKey>;
export const TextKey: Story = () => <KeyboardKey>Enter</KeyboardKey>;
export const Combination: Story = () => (
  <div className="flex items-center gap-1">
    <KeyboardKey>⌘</KeyboardKey>
    <span>+</span>
    <KeyboardKey>K</KeyboardKey>
  </div>
);
