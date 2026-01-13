import type { Story } from '@ladle/react';
import { useState } from 'react';
import { PropertyTags } from './PropertyTags.js';
import { Tag } from '../Tag/Tag.js';
import { TagAddButton } from '../TagAddButton/TagAddButton.js';

export default {
  title: 'Components/PropertyTags',
};

export const Default: Story = () => (
  <div className="w-[600px]">
    <PropertyTags label="Tags">
      <Tag onRemove={() => alert('Remove project')}>project</Tag>
      <Tag onRemove={() => alert('Remove backend')}>backend</Tag>
      <Tag onRemove={() => alert('Remove typescript')}>typescript</Tag>
      <TagAddButton onClick={() => alert('Add tag')} />
    </PropertyTags>
  </div>
);

export const EmptyState: Story = () => (
  <div className="w-[600px]">
    <PropertyTags label="Tags">
      <TagAddButton onClick={() => alert('Add first tag')} />
    </PropertyTags>
  </div>
);

export const ManyTags: Story = () => (
  <div className="w-[600px]">
    <section>
      <h2 className="text-lg font-semibold mb-4">Tag Wrapping</h2>
      <PropertyTags label="Tags">
        <Tag onRemove={() => {}}>project</Tag>
        <Tag onRemove={() => {}}>backend</Tag>
        <Tag onRemove={() => {}}>typescript</Tag>
        <Tag onRemove={() => {}}>electron</Tag>
        <Tag onRemove={() => {}}>sqlite</Tag>
        <Tag onRemove={() => {}}>react</Tag>
        <Tag onRemove={() => {}}>design-system</Tag>
        <Tag onRemove={() => {}}>tdd</Tag>
        <Tag onRemove={() => {}}>vitest</Tag>
        <Tag onRemove={() => {}}>monorepo</Tag>
        <Tag onRemove={() => {}}>pnpm</Tag>
        <Tag onRemove={() => {}}>drizzle</Tag>
        <TagAddButton onClick={() => {}} />
      </PropertyTags>
      <p className="text-xs text-gray-500 mt-4">
        Tags wrap to multiple lines when they exceed container width
      </p>
    </section>
  </div>
);

export const DifferentVariants: Story = () => (
  <div className="w-[600px] space-y-4">
    <PropertyTags label="Default">
      <Tag variant="default">design</Tag>
      <Tag variant="default">architecture</Tag>
      <Tag variant="default">planning</Tag>
      <TagAddButton />
    </PropertyTags>

    <PropertyTags label="Primary">
      <Tag variant="primary">featured</Tag>
      <Tag variant="primary">important</Tag>
      <Tag variant="primary">highlight</Tag>
      <TagAddButton />
    </PropertyTags>

    <PropertyTags label="Mixed">
      <Tag variant="default">regular</Tag>
      <Tag variant="primary">special</Tag>
      <Tag variant="default">regular</Tag>
      <TagAddButton />
    </PropertyTags>
  </div>
);

export const Interactive: Story = () => {
  const [tags, setTags] = useState(['project', 'backend', 'typescript']);
  const [isAdding, setIsAdding] = useState(false);

  const handleRemove = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAdd = () => {
    setIsAdding(true);
    // Simulate showing an input dialog
    const tag = prompt('Enter tag name:');
    if (tag && tag.trim()) {
      setTags([...tags, tag.trim()]);
    }
    setIsAdding(false);
  };

  return (
    <div className="w-[600px]">
      <PropertyTags label="Tags">
        {tags.map((tag) => (
          <Tag key={tag} onRemove={() => handleRemove(tag)}>
            {tag}
          </Tag>
        ))}
        <TagAddButton onClick={handleAdd} disabled={isAdding} />
      </PropertyTags>
      <p className="text-xs text-gray-500 mt-4">
        Current tags: {tags.length > 0 ? tags.join(', ') : 'none'}
      </p>
    </div>
  );
};

export const BookGenresExample: Story = () => {
  const [genres, setGenres] = useState(['Science Fiction', 'Space Opera', 'Classic']);

  const handleRemove = (genre: string) => {
    setGenres(genres.filter((g) => g !== genre));
  };

  const handleAdd = () => {
    const genre = prompt('Add genre:');
    if (genre && genre.trim()) {
      setGenres([...genres, genre.trim()]);
    }
  };

  return (
    <div className="w-[600px] p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Foundation by Isaac Asimov</h3>
      <PropertyTags label="Genres">
        {genres.map((genre) => (
          <Tag key={genre} variant="primary" onRemove={() => handleRemove(genre)}>
            {genre}
          </Tag>
        ))}
        <TagAddButton onClick={handleAdd} />
      </PropertyTags>
    </div>
  );
};

export const MultiplePropertyRows: Story = () => {
  const [bookTags, setBookTags] = useState(['fiction', 'classic']);
  const [authorTags, setAuthorTags] = useState(['american', 'novelist']);
  const [topicTags, setTopicTags] = useState(['dystopian', 'censorship', 'technology']);

  return (
    <div className="w-[600px] p-4 border border-gray-200 rounded-md">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Fahrenheit 451</h3>
      <div className="space-y-3">
        <PropertyTags label="Book">
          {bookTags.map((tag) => (
            <Tag key={tag} onRemove={() => setBookTags(bookTags.filter((t) => t !== tag))}>
              {tag}
            </Tag>
          ))}
          <TagAddButton onClick={() => {}} />
        </PropertyTags>

        <PropertyTags label="Author">
          {authorTags.map((tag) => (
            <Tag key={tag} onRemove={() => setAuthorTags(authorTags.filter((t) => t !== tag))}>
              {tag}
            </Tag>
          ))}
          <TagAddButton onClick={() => {}} />
        </PropertyTags>

        <PropertyTags label="Topics">
          {topicTags.map((tag) => (
            <Tag key={tag} onRemove={() => setTopicTags(topicTags.filter((t) => t !== tag))}>
              {tag}
            </Tag>
          ))}
          <TagAddButton onClick={() => {}} />
        </PropertyTags>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        PropertyTags creates consistent two-column layout for tag collections
      </p>
    </div>
  );
};

export const ClickableTags: Story = () => (
  <div className="w-[600px]">
    <PropertyTags label="Related">
      <Tag onClick={() => alert('Navigate to #project')}>project</Tag>
      <Tag onClick={() => alert('Navigate to #backend')}>backend</Tag>
      <Tag onClick={() => alert('Navigate to #architecture')}>architecture</Tag>
      <TagAddButton onClick={() => alert('Add tag')} />
    </PropertyTags>
    <p className="text-xs text-gray-500 mt-4">Click tags to navigate (no remove buttons)</p>
  </div>
);
