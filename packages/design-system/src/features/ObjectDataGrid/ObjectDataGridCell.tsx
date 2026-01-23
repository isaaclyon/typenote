import * as React from 'react';
import { format } from 'date-fns';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';

import { cn } from '../../lib/utils.js';
import { Button } from '../../primitives/Button/Button.js';
import { TableCell } from '../../primitives/Table/Table.js';
import { Badge } from '../../primitives/Badge/Badge.js';
import { TextEditor } from '../../patterns/PropertyList/editors/TextEditor.js';
import { BooleanEditor } from '../../patterns/PropertyList/editors/BooleanEditor.js';
import { SelectEditor } from '../../patterns/PropertyList/editors/SelectEditor.js';
import { MultiselectEditor } from '../../patterns/PropertyList/editors/MultiselectEditor.js';
import { DatePicker } from '../../patterns/DatePicker/DatePicker.js';
import { DismissibleTag } from '../../patterns/DismissibleTag/DismissibleTag.js';
import {
  RelationPicker,
  type RelationOption,
} from '../../patterns/RelationPicker/RelationPicker.js';
import type { DataGridColumn } from './types.js';

interface ObjectDataGridCellProps<T> {
  column: DataGridColumn<T>;
  row: T;
  value: unknown;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (value: unknown) => void;
  onCancel: () => void;
}

function ObjectDataGridCell<T extends { id: string }>({
  column,
  row,
  value,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: ObjectDataGridCellProps<T>) {
  // Relation picker state
  const [relationPickerOpen, setRelationPickerOpen] = React.useState(false);
  const [relationSearchQuery, setRelationSearchQuery] = React.useState('');
  const [relationOptions, setRelationOptions] = React.useState<RelationOption[]>([]);
  const [relationLoading, setRelationLoading] = React.useState(false);

  // Handle relation search
  React.useEffect(() => {
    if (!relationPickerOpen || !column.onSearch) return;

    const searchFn = column.onSearch;
    const searchRelations = async () => {
      setRelationLoading(true);
      try {
        const results = await searchFn(relationSearchQuery);
        setRelationOptions(results);
      } finally {
        setRelationLoading(false);
      }
    };

    const timer = setTimeout(searchRelations, 200);
    return () => clearTimeout(timer);
  }, [relationSearchQuery, relationPickerOpen, column.onSearch]);

  // Custom render
  if (column.render) {
    return (
      <TableCell align={column.align} pinned={column.pinned}>
        {column.render(value, row)}
      </TableCell>
    );
  }

  // Edit mode rendering
  if (isEditing && column.editable !== false) {
    return (
      <TableCell align={column.align} pinned={column.pinned} className="p-1">
        {renderEditor()}
      </TableCell>
    );
  }

  // Read-only rendering
  return (
    <TableCell
      align={column.align}
      pinned={column.pinned}
      onClick={column.editable !== false ? onStartEdit : undefined}
      className={cn(column.editable !== false && 'cursor-pointer hover:bg-muted/30')}
    >
      {renderReadOnly()}
    </TableCell>
  );

  function renderEditor() {
    switch (column.type) {
      case 'title':
      case 'text':
        return (
          <TextEditor
            value={String(value ?? '')}
            onSave={(v) => onSave(v)}
            onCancel={onCancel}
            type="text"
          />
        );

      case 'number':
        return (
          <TextEditor
            value={String(value ?? '')}
            onSave={(v) => onSave(Number(v) || 0)}
            onCancel={onCancel}
            type="number"
          />
        );

      case 'boolean':
        return <BooleanEditor value={Boolean(value)} onSave={(v) => onSave(v)} disabled={false} />;

      case 'date':
      case 'datetime':
        return (
          <DatePicker
            value={value instanceof Date ? value : null}
            onChange={(d) => {
              onSave(d);
              onCancel();
            }}
          />
        );

      case 'select':
        return (
          <SelectEditor
            value={String(value ?? '')}
            options={column.options ?? []}
            onSave={(v) => onSave(v)}
            onCancel={onCancel}
          />
        );

      case 'multiselect':
        return (
          <MultiselectEditor
            value={Array.isArray(value) ? value : []}
            options={column.options ?? []}
            onSave={(v) => onSave(v)}
            onCancel={onCancel}
          />
        );

      case 'ref':
        return renderRelationPicker(false);

      case 'refs':
        return renderRelationPicker(true);

      default:
        return <span className="text-muted-foreground">Unsupported editor</span>;
    }
  }

  function renderRelationPicker(multiple: boolean) {
    const currentValue = multiple
      ? Array.isArray(value)
        ? value
        : []
      : typeof value === 'string'
        ? value
        : '';

    const handleCreate = column.onCreate
      ? async (title: string) => {
          const createFn = column.onCreate;
          if (!createFn) return;
          const newId = await createFn(title);
          if (multiple) {
            onSave([...(Array.isArray(value) ? value : []), newId]);
          } else {
            onSave(newId);
            onCancel();
          }
        }
      : undefined;

    return (
      <RelationPicker
        open={relationPickerOpen || isEditing}
        onOpenChange={(open) => {
          setRelationPickerOpen(open);
          if (!open) onCancel();
        }}
        value={currentValue}
        onChange={(v) => {
          onSave(v);
          if (!multiple) onCancel();
        }}
        multiple={multiple}
        options={relationOptions}
        loading={relationLoading}
        searchQuery={relationSearchQuery}
        onSearchChange={setRelationSearchQuery}
        onCreate={handleCreate}
      >
        <Button variant="ghost" size="sm" className="h-6 text-xs">
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </RelationPicker>
    );
  }

  function renderReadOnly() {
    switch (column.type) {
      case 'title':
        return (
          <span className={cn('font-medium', column.isTitle && 'text-accent-600')}>
            {String(value ?? '')}
          </span>
        );

      case 'text':
        return <span className="truncate">{String(value ?? '')}</span>;

      case 'number':
        return <span className="tabular-nums">{value != null ? String(value) : ''}</span>;

      case 'boolean':
        return value ? (
          <Check className="h-4 w-4 text-green-600" weight="bold" />
        ) : (
          <XIcon className="h-4 w-4 text-muted-foreground" weight="bold" />
        );

      case 'date':
        return value instanceof Date ? (
          <span>{format(value, 'MMM d, yyyy')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );

      case 'datetime':
        return value instanceof Date ? (
          <span>{format(value, 'MMM d, yyyy h:mm a')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );

      case 'select':
        return value ? (
          <Badge variant="solid" size="sm">
            {String(value)}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );

      case 'multiselect': {
        const items = Array.isArray(value) ? value : [];
        return items.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {items.slice(0, 3).map((item, i) => (
              <Badge key={i} variant="solid" size="sm">
                {String(item)}
              </Badge>
            ))}
            {items.length > 3 && (
              <Badge variant="outline" size="sm">
                +{items.length - 3}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      }

      case 'ref':
        // This would need resolving the reference title from external data
        return value ? (
          <span className="text-sm">{String(value)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );

      case 'refs': {
        const refs = Array.isArray(value) ? value : [];
        return refs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {refs.slice(0, 2).map((refId, i) => (
              <DismissibleTag key={i} label={String(refId)} />
            ))}
            {refs.length > 2 && (
              <Badge variant="outline" size="sm">
                +{refs.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      }

      default:
        return <span>{String(value ?? '')}</span>;
    }
  }
}

ObjectDataGridCell.displayName = 'ObjectDataGridCell';

export { ObjectDataGridCell };
export type { ObjectDataGridCellProps };
