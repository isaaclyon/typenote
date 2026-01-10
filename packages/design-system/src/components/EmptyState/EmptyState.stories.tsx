import type { Story } from '@ladle/react';
import { EmptyState } from './EmptyState.js';
import { FileText, Inbox, Search } from 'lucide-react';

export default {
  title: 'Components/EmptyState',
};

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-lg font-semibold mb-4">With Icon</h2>
      <EmptyState
        icon={<FileText />}
        title="No documents yet"
        description="Get started by creating your first document"
        action={{ label: 'Create Document', onClick: () => alert('Create!') }}
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Without Action</h2>
      <EmptyState
        icon={<Inbox />}
        title="Inbox is empty"
        description="All caught up! Nothing to see here."
      />
    </section>

    <section>
      <h2 className="text-lg font-semibold mb-4">Search Results</h2>
      <EmptyState
        icon={<Search />}
        title="No results found"
        description="Try adjusting your search terms"
      />
    </section>
  </div>
);

export const WithAction: Story = () => (
  <EmptyState
    icon={<FileText />}
    title="No documents"
    description="Create your first document to get started"
    action={{ label: 'Create Document', onClick: () => alert('Create!') }}
  />
);

export const WithoutAction: Story = () => (
  <EmptyState
    icon={<Inbox />}
    title="All done!"
    description="Nothing to see here"
  />
);

export const Minimal: Story = () => <EmptyState title="No items" />;
