import type { Story } from '@ladle/react';
import { useState } from 'react';
import { RightSidebar } from './RightSidebar.js';
import { CollapsibleSection } from '../CollapsibleSection/index.js';
import { PropertyItem } from '../PropertyItem/PropertyItem.js';
import { PropertyTags } from '../PropertyTags/PropertyTags.js';
import { Tag } from '../Tag/Tag.js';
import { TagAddButton } from '../TagAddButton/TagAddButton.js';
import { ListBulletsIcon } from '@phosphor-icons/react/dist/csr/ListBullets';

export default {
  title: 'Components/RightSidebar',
};

export const Default: Story = () => (
  <RightSidebar>
    <CollapsibleSection title="Properties" icon={ListBulletsIcon}>
      <div className="space-y-2">
        <PropertyItem label="Author" value="Isaac Asimov" type="text" />
        <PropertyItem label="Pages" value={255} type="number" />
      </div>
    </CollapsibleSection>
  </RightSidebar>
);

export const Complete: Story = () => {
  const [author, setAuthor] = useState('Isaac Asimov');
  const [pages, setPages] = useState(255);
  const [published, setPublished] = useState('1951-05-01');
  const [status, setStatus] = useState('Read');

  return (
    <RightSidebar>
      <CollapsibleSection
        title="Properties"
        icon={ListBulletsIcon}
        storageKey="rightSidebar.section.properties"
      >
        <div className="space-y-2">
          <PropertyItem
            label="Author"
            value={author}
            type="text"
            onSave={(val) => setAuthor(val as string)}
          />
          <PropertyItem
            label="Pages"
            value={pages}
            type="number"
            onSave={(val) => setPages(val as number)}
          />
          <PropertyItem
            label="Published"
            value={published}
            type="date"
            onSave={(val) => setPublished(val as string)}
          />
          <PropertyItem
            label="Status"
            value={status}
            type="select"
            options={['Want to Read', 'Reading', 'Read', 'Abandoned']}
            onSave={(val) => setStatus(val as string)}
          />
          <PropertyTags label="Tags">
            <Tag
              onClick={() => alert('Navigate to #project')}
              onRemove={() => alert('Remove #project')}
            >
              project
            </Tag>
            <Tag
              onClick={() => alert('Navigate to #backend')}
              onRemove={() => alert('Remove #backend')}
            >
              backend
            </Tag>
            <Tag
              onClick={() => alert('Navigate to #architecture')}
              onRemove={() => alert('Remove #architecture')}
            >
              architecture
            </Tag>
            <TagAddButton onClick={() => alert('Add tag')} />
          </PropertyTags>
        </div>
      </CollapsibleSection>
    </RightSidebar>
  );
};

export const EmptyProperties: Story = () => (
  <RightSidebar>
    <CollapsibleSection title="Properties" icon={ListBulletsIcon}>
      <div className="space-y-2">
        <PropertyItem label="Author" type="text" placeholder="Add author" />
        <PropertyItem label="Pages" type="number" placeholder="Not set" />
        <PropertyItem label="Status" type="text" placeholder="Not set" />
        <PropertyTags label="Tags">
          <TagAddButton onClick={() => alert('Add tag')} />
        </PropertyTags>
      </div>
    </CollapsibleSection>
  </RightSidebar>
);
