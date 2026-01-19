import type { Story } from '@ladle/react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { FolderPlus } from '@phosphor-icons/react/dist/ssr/FolderPlus';
import { UserPlus } from '@phosphor-icons/react/dist/ssr/UserPlus';
import { Tag } from '@phosphor-icons/react/dist/ssr/Tag';
import { Upload } from '@phosphor-icons/react/dist/ssr/Upload';

import { PlaceholderAction } from './PlaceholderAction.js';

export default {
  title: 'Patterns/PlaceholderAction',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => (
  <div className="space-y-8 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        With Icon (Recommended)
      </h2>
      <div className="max-w-xs space-y-2">
        <PlaceholderAction
          icon={Plus}
          label="Add new type"
          onClick={() => console.log('Add type')}
        />
        <PlaceholderAction
          icon={FolderPlus}
          label="Create folder"
          onClick={() => console.log('Create folder')}
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Without Icon
      </h2>
      <div className="max-w-xs">
        <PlaceholderAction label="Add item" onClick={() => console.log('Add item')} />
      </div>
    </section>
  </div>
);

// ============================================================================
// States
// ============================================================================

export const States: Story = () => (
  <div className="space-y-8 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Default</h2>
      <div className="max-w-xs">
        <PlaceholderAction icon={Plus} label="Add new type" onClick={() => {}} />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Hover (interact to see)
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">
        Border and text become more prominent on hover.
      </p>
      <div className="max-w-xs">
        <PlaceholderAction icon={Plus} label="Add new type" onClick={() => {}} />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Disabled</h2>
      <div className="max-w-xs">
        <PlaceholderAction icon={Plus} label="Add new type" disabled onClick={() => {}} />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Collapsed (icon-only)
      </h2>
      <p className="mb-2 text-sm text-muted-foreground">
        For use in collapsed sidebars. Hover to see tooltip.
      </p>
      <div className="w-14">
        <PlaceholderAction icon={Plus} label="Add new type" collapsed onClick={() => {}} />
      </div>
    </section>
  </div>
);

// ============================================================================
// Use Cases
// ============================================================================

export const UseCases: Story = () => (
  <div className="space-y-8 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Sidebar Type List
      </h2>
      <div className="w-56 rounded-md border border-border bg-background p-2">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Types</p>
        <div className="space-y-0.5">
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 rounded-sm bg-blue-400" />
            <span>Daily Notes</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 rounded-sm bg-stone-400" />
            <span>Pages</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 rounded-sm bg-amber-400" />
            <span>People</span>
          </div>
          <PlaceholderAction icon={Plus} label="Add new type" onClick={() => {}} />
        </div>
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Various Actions
      </h2>
      <div className="max-w-xs space-y-2">
        <PlaceholderAction icon={UserPlus} label="Add person" onClick={() => {}} />
        <PlaceholderAction icon={Tag} label="Add tag" onClick={() => {}} />
        <PlaceholderAction icon={Upload} label="Import file" onClick={() => {}} />
      </div>
    </section>
  </div>
);

// ============================================================================
// In Sidebar Context
// ============================================================================

export const InSidebarContext: Story = () => (
  <div className="p-6">
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Sidebar Layout Preview
    </h2>
    <div className="w-60 rounded-md border border-border bg-background">
      {/* Header area */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-2">
          <button className="rounded p-1 hover:bg-muted">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button className="flex-1 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
            New note
          </button>
        </div>
      </div>

      {/* Types section */}
      <div className="p-2">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Types</p>
        <div className="space-y-0.5">
          <div className="flex h-7 items-center gap-2 rounded-md bg-accent px-2 text-sm">
            <span className="h-3.5 w-3.5 rounded-sm bg-blue-400" />
            <span>Daily Notes</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 rounded-sm bg-stone-400" />
            <span>Pages</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 rounded-sm bg-amber-400" />
            <span>People</span>
          </div>
          <PlaceholderAction icon={Plus} label="Add new type" onClick={() => {}} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-2 border-t border-border" />

      {/* Favorites section */}
      <div className="p-2">
        <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">Favorites</p>
        <div className="space-y-0.5">
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 text-amber-400">&#9733;</span>
            <span>Getting Started</span>
          </div>
          <div className="flex h-7 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted">
            <span className="h-3.5 w-3.5 text-amber-400">&#9733;</span>
            <span>Project Ideas</span>
          </div>
        </div>
      </div>

      {/* Footer - temporary location note */}
      <div className="border-t border-border p-2">
        <p className="px-2 text-xs italic text-muted-foreground">
          Settings/theme will be relocated
        </p>
      </div>
    </div>
  </div>
);
