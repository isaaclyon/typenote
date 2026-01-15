import * as React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FileText, Calendar, CheckSquare, User, type LucideIcon } from 'lucide-react';
import type { SidebarPinnedSectionProps } from './types.js';
import { SidebarPinnedItem } from './SidebarPinnedItem.js';

// Icon mapping for typeKey → icon
const TYPE_ICONS: Record<string, LucideIcon> = {
  Page: FileText,
  DailyNote: Calendar,
  Task: CheckSquare,
  Person: User,
};

const SidebarPinnedSection = React.forwardRef<HTMLDivElement, SidebarPinnedSectionProps>(
  ({ items, onReorder, onSelect, selectedId }, ref) => {
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          onReorder(reorderedItems.map((item) => item.id));
        }
      }
    };

    // Return nothing if items array is empty
    if (items.length === 0) {
      return null;
    }

    return (
      <div ref={ref}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => {
              const icon = TYPE_ICONS[item.typeKey] ?? FileText;
              return (
                <SidebarPinnedItem
                  key={item.id}
                  id={item.id}
                  icon={icon}
                  label={item.title}
                  {...(item.color ? { color: item.color } : {})}
                  selected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    );
  }
);

SidebarPinnedSection.displayName = 'SidebarPinnedSection';

export { SidebarPinnedSection };
