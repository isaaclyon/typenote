import type { Story } from '@ladle/react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { FolderOpen } from '@phosphor-icons/react/dist/ssr/FolderOpen';
import { FileText } from '@phosphor-icons/react/dist/ssr/FileText';
import { Tray } from '@phosphor-icons/react/dist/ssr/Tray';
import { Users } from '@phosphor-icons/react/dist/ssr/Users';
import { Tag } from '@phosphor-icons/react/dist/ssr/Tag';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { WifiSlash } from '@phosphor-icons/react/dist/ssr/WifiSlash';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';

import { EmptyState } from './EmptyState.js';

export default {
  title: 'Patterns/EmptyState',
};

// ============================================================================
// Overview
// ============================================================================

export const Overview: Story = () => (
  <div className="space-y-8 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Full Example
      </h2>
      <div className="max-w-md">
        <EmptyState
          icon={FolderOpen}
          heading="No projects yet"
          description="Create your first project to start organizing your notes and documents."
          action={{
            label: 'Create Project',
            onClick: () => console.log('Create project'),
          }}
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Minimal (Heading Only)
      </h2>
      <div className="max-w-md">
        <EmptyState heading="No items" />
      </div>
    </section>
  </div>
);

// ============================================================================
// Search Results
// ============================================================================

export const SearchResults: Story = () => (
  <div className="space-y-8 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        No Search Results
      </h2>
      <div className="max-w-md">
        <EmptyState
          icon={MagnifyingGlass}
          heading="No results found"
          description="Try adjusting your search terms or filters to find what you're looking for."
        />
      </div>
    </section>
  </div>
);

// ============================================================================
// Empty Lists
// ============================================================================

export const EmptyLists: Story = () => (
  <div className="grid gap-6 p-6 md:grid-cols-2">
    <EmptyState
      icon={FileText}
      heading="No documents"
      description="Create your first document to get started."
      action={{
        label: 'New Document',
        onClick: () => console.log('New document'),
      }}
    />

    <EmptyState
      icon={Users}
      heading="No people"
      description="Add people to track your contacts and relationships."
      action={{
        label: 'Add Person',
        onClick: () => console.log('Add person'),
      }}
    />

    <EmptyState
      icon={Tag}
      heading="No tags"
      description="Create tags to organize your content."
      action={{
        label: 'Create Tag',
        onClick: () => console.log('Create tag'),
      }}
    />

    <EmptyState
      icon={Tray}
      heading="Tray empty"
      description="Items you receive will appear here."
    />
  </div>
);

// ============================================================================
// System States
// ============================================================================

export const SystemStates: Story = () => (
  <div className="space-y-6 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Trash Empty
      </h2>
      <div className="max-w-md">
        <EmptyState
          icon={Trash}
          heading="Trash is empty"
          description="Deleted items will appear here. Items in trash are permanently deleted after 30 days."
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Offline State
      </h2>
      <div className="max-w-md">
        <EmptyState
          icon={WifiSlash}
          heading="You're offline"
          description="Check your internet connection and try again."
          action={{
            label: 'Retry',
            onClick: () => console.log('Retry'),
          }}
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Error State
      </h2>
      <div className="max-w-md">
        <EmptyState
          icon={Warning}
          heading="Something went wrong"
          description="We couldn't load your data. Please try again."
          action={{
            label: 'Try Again',
            onClick: () => console.log('Try again'),
          }}
        />
      </div>
    </section>
  </div>
);

// ============================================================================
// Without Icon
// ============================================================================

export const WithoutIcon: Story = () => (
  <div className="space-y-6 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Text Only
      </h2>
      <div className="max-w-md">
        <EmptyState
          heading="No items to display"
          description="Items matching your criteria will appear here."
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        With Action
      </h2>
      <div className="max-w-md">
        <EmptyState
          heading="Get started"
          description="Create your first item to begin."
          action={{
            label: 'Create Item',
            onClick: () => console.log('Create'),
          }}
        />
      </div>
    </section>
  </div>
);

// ============================================================================
// Sizing
// ============================================================================

export const Sizing: Story = () => (
  <div className="space-y-6 p-6">
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Default Width (Fills Container)
      </h2>
      <EmptyState
        icon={FolderOpen}
        heading="No projects"
        description="Create a project to organize your work."
        action={{
          label: 'New Project',
          onClick: () => {},
        }}
      />
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Constrained Width
      </h2>
      <div className="max-w-sm">
        <EmptyState
          icon={FolderOpen}
          heading="No projects"
          description="Create a project to organize your work."
          action={{
            label: 'New Project',
            onClick: () => {},
          }}
        />
      </div>
    </section>

    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Custom Padding
      </h2>
      <div className="max-w-md">
        <EmptyState icon={Tray} heading="Tray empty" className="py-16" />
      </div>
    </section>
  </div>
);

// ============================================================================
// In Context
// ============================================================================

export const InContext: Story = () => (
  <div className="p-6">
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Inside a Card/Panel
    </h2>
    <div className="max-w-lg rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium">Recent Documents</h3>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>
      <EmptyState
        icon={FileText}
        heading="No recent documents"
        description="Documents you've recently viewed or edited will appear here."
      />
    </div>
  </div>
);
