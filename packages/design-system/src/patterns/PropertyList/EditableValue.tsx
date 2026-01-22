import * as React from 'react';
import { cn } from '../../lib/utils.js';
import type { PropertyListItem } from './PropertyList.js';
import { TextEditor } from './editors/TextEditor.js';
import { BooleanEditor } from './editors/BooleanEditor.js';
import { SelectEditor } from './editors/SelectEditor.js';
import { MultiselectEditor } from './editors/MultiselectEditor.js';
import { DateEditor } from './editors/DateEditor.js';

export interface EditableValueProps {
  item: PropertyListItem;
  onSave: (value: unknown) => void;
}

const EditableValue: React.FC<EditableValueProps> = ({ item, onSave }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = (value: unknown) => {
    onSave(value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleClick = () => {
    if (!item.disabled && item.type !== 'boolean') {
      setIsEditing(true);
    }
  };

  // Boolean is always "editable" - just a toggle
  if (item.type === 'boolean') {
    return (
      <BooleanEditor
        value={Boolean(item.rawValue)}
        onSave={handleSave}
        disabled={item.disabled === true}
      />
    );
  }

  // Editing mode
  if (isEditing && item.type) {
    switch (item.type) {
      case 'text':
        return (
          <TextEditor
            value={String(item.rawValue ?? '')}
            onSave={handleSave}
            onCancel={handleCancel}
            type="text"
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
          />
        );

      case 'number':
        return (
          <TextEditor
            value={String(item.rawValue ?? '')}
            onSave={(v) => handleSave(v === '' ? null : Number(v))}
            onCancel={handleCancel}
            type="number"
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
          />
        );

      case 'select':
        return (
          <SelectEditor
            value={String(item.rawValue ?? '')}
            options={item.options ?? []}
            onSave={handleSave}
            onCancel={handleCancel}
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
            disabled={item.disabled === true}
          />
        );

      case 'multiselect':
        return (
          <MultiselectEditor
            value={Array.isArray(item.rawValue) ? item.rawValue : []}
            options={item.options ?? []}
            onSave={handleSave}
            onCancel={handleCancel}
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
            disabled={item.disabled === true}
          />
        );

      case 'date':
        return (
          <DateEditor
            value={item.rawValue instanceof Date ? item.rawValue : null}
            onSave={handleSave}
            onCancel={handleCancel}
            includeTime={false}
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
            disabled={item.disabled === true}
          />
        );

      case 'datetime':
        return (
          <DateEditor
            value={item.rawValue instanceof Date ? item.rawValue : null}
            onSave={handleSave}
            onCancel={handleCancel}
            includeTime={true}
            {...(item.placeholder !== undefined && { placeholder: item.placeholder })}
            disabled={item.disabled === true}
          />
        );
    }
  }

  // View mode - render the display value
  const isEmpty = item.rawValue === null || item.rawValue === undefined || item.rawValue === '';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'rounded px-1 -mx-1 min-h-[1.5rem]',
        !item.disabled && 'cursor-pointer hover:bg-surface-hover',
        item.disabled && 'cursor-not-allowed text-fg-tertiary'
      )}
      role={!item.disabled ? 'button' : undefined}
      tabIndex={!item.disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (!item.disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isEmpty ? (
        <span className="text-fg-tertiary italic">{item.placeholder ?? 'Empty'}</span>
      ) : (
        item.value
      )}
    </div>
  );
};

EditableValue.displayName = 'EditableValue';

export { EditableValue };
