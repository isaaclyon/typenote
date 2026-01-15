# TypeBrowser Integration Design

**Date:** 2026-01-15
**Status:** Ready for Implementation

## Overview

When a user clicks a type in the sidebar (e.g., "Task" with 15 items), the main content area shows a TypeBrowser table displaying all objects of that type.

### Features

1. **Dynamic columns** — Built from the object type's schema (title + properties)
2. **Inline editing** — Most cells are editable (text, number, date, select, etc.)
3. **Title cell with Open button** — Hovering the title shows an "Open" button to navigate to editor
4. **Row selection** — Checkboxes for batch operations (future)

### UI Flow

```
User clicks "Task" in sidebar
         ↓
viewMode changes to 'typeBrowser'
selectedTypeKey = 'Task'
         ↓
TypeBrowserView renders with Task objects
         ↓
User clicks "Open" on a row
         ↓
viewMode changes to 'notes'
selectedObjectId = clicked object ID
         ↓
NoteEditor renders
```

## Architecture

### Component Hierarchy

```
App.tsx
├── LeftSidebar (onTypeClick → setViewMode + setSelectedTypeKey)
│   └── SidebarTypeItem (onClick handler)
├── Main Content Area
│   ├── CalendarView (viewMode === 'calendar')
│   ├── TypeBrowserView (viewMode === 'typeBrowser') ← NEW
│   │   └── TypeBrowser (from @typenote/design-system)
│   │       └── TitleCell (new cell type)
│   └── NoteEditor (viewMode === 'notes')
└── PropertiesPanel (only shown for 'notes' mode)
```

## Implementation Plan

### Phase 1: Backend API Extensions

**1.1 Extend `listObjects` with filtering**

```typescript
// packages/storage/src/objectService.ts

interface ListObjectsOptions {
  typeKey?: string; // Filter by object type key
  includeProperties?: boolean; // Include properties in response
}

interface ObjectSummaryWithProperties extends ObjectSummary {
  properties: Record<string, unknown>;
}

function listObjects(
  db: TypenoteDb,
  options?: ListObjectsOptions
): ObjectSummary[] | ObjectSummaryWithProperties[];
```

**1.2 Add IPC endpoint for `getObjectTypeByKey`**

```typescript
// apps/desktop/src/main/ipc.ts
ipcMain.handle('typenote:getObjectTypeByKey', async (_, typeKey: string) => {
  // Returns ObjectType with schema for building columns
});

// apps/desktop/src/preload/index.ts
getObjectTypeByKey: (typeKey: string) =>
  ipcRenderer.invoke('typenote:getObjectTypeByKey', typeKey),
```

**1.3 Extend `listObjects` IPC with options**

```typescript
// Current: listObjects() → ObjectSummary[]
// New: listObjects(options?) → ObjectSummary[] | ObjectSummaryWithProperties[]

listObjects: (options?: { typeKey?: string; includeProperties?: boolean }) =>
  ipcRenderer.invoke('typenote:listObjects', options),
```

### Phase 2: Design System — TitleCell Component

**2.1 Create `TitleCell` in design-system**

Location: `packages/design-system/src/components/TypeBrowser/cells/TitleCell.tsx`

```typescript
interface TitleCellProps {
  value: string;
  onSave: (value: string) => void;
  onOpen: () => void;
}

// Features:
// - Text display with truncation
// - "Open" button (arrow icon) appears on hover, anchored right
// - Click text to edit inline (like TextCell)
// - Click "Open" button to navigate
```

**2.2 Extend TypeBrowser types**

```typescript
// packages/design-system/src/components/TypeBrowser/types.ts

type CellType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'title'; // NEW

interface TypeBrowserProps<TData> {
  // ... existing props ...
  onTitleOpen?: (row: TData) => void; // NEW
}
```

**2.3 Update TypeBrowser to handle 'title' type**

In `createColumnDefs`, add case for 'title' that renders `TitleCell` with `onTitleOpen` wired up.

**2.4 Create Ladle stories for TitleCell**

- Default state
- Hover state (Open button visible)
- Edit state
- In TypeBrowser context

### Phase 3: Desktop App — TypeBrowserView Component

**3.1 Create hooks**

```typescript
// hooks/useObjectType.ts
function useObjectType(typeKey: string) {
  // Calls getObjectTypeByKey IPC
  // Returns { objectType, isLoading, error }
}

// hooks/useObjectsOfType.ts
function useObjectsOfType(typeKey: string) {
  // Calls listObjects({ typeKey, includeProperties: true })
  // Returns { objects, isLoading, error, refetch }
}
```

**3.2 Create `TypeBrowserView` component**

Location: `apps/desktop/src/renderer/components/TypeBrowserView.tsx`

```typescript
interface TypeBrowserViewProps {
  typeKey: string;
  onOpen: (objectId: string) => void;
}

function TypeBrowserView({ typeKey, onOpen }: TypeBrowserViewProps) {
  const { objectType } = useObjectType(typeKey);
  const { objects, refetch } = useObjectsOfType(typeKey);

  const columns = useMemo(() =>
    buildColumnsFromSchema(objectType?.schema),
    [objectType?.schema]
  );

  const handleCellEdit = async (rowId, columnId, value) => {
    await window.typenoteAPI.updateObject(rowId, {
      properties: { [columnId]: value }
    });
    refetch();
  };

  return (
    <TypeBrowser
      data={objects}
      columns={columns}
      getRowId={(row) => row.id}
      onCellEdit={handleCellEdit}
      onTitleOpen={(row) => onOpen(row.id)}
    />
  );
}
```

**3.3 Create `buildColumnsFromSchema` utility**

```typescript
// utils/buildColumnsFromSchema.ts

function buildColumnsFromSchema(schema: TypeSchema | null | undefined): TypeBrowserColumn[] {
  const columns: TypeBrowserColumn[] = [
    // Title column is always first, pinned left
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      type: 'title',
      pinned: 'left',
      width: 250,
    },
  ];

  // Add columns for each property in schema
  if (schema?.properties) {
    for (const prop of schema.properties) {
      columns.push({
        id: prop.key,
        header: prop.name,
        accessorKey: `properties.${prop.key}`,
        type: mapPropertyTypeToCell(prop.type),
        options: prop.options, // for select/multiselect
      });
    }
  }

  // Always add updatedAt column
  columns.push({
    id: 'updatedAt',
    header: 'Modified',
    accessorKey: 'updatedAt',
    type: 'datetime',
    width: 150,
  });

  return columns;
}

function mapPropertyTypeToCell(propType: PropertyType): CellType {
  const mapping: Record<PropertyType, CellType> = {
    text: 'text',
    richtext: 'text', // Simplified for table view
    number: 'number',
    boolean: 'boolean',
    date: 'date',
    datetime: 'datetime',
    select: 'select',
    multiselect: 'multiselect',
    ref: 'text', // Show as text in table (future: link)
    refs: 'text', // Show as text in table (future: pills)
  };
  return mapping[propType];
}
```

### Phase 4: App.tsx Integration

**4.1 Extend ViewMode type**

```typescript
type ViewMode = 'notes' | 'calendar' | 'typeBrowser';
```

**4.2 Add selectedTypeKey state**

```typescript
const [selectedTypeKey, setSelectedTypeKey] = useState<string | null>(null);
```

**4.3 Add handlers**

```typescript
const handleTypeClick = (typeKey: string) => {
  setSelectedTypeKey(typeKey);
  setViewMode('typeBrowser');
  setSelectedObjectId(null);
};

const handleOpenObject = (objectId: string) => {
  setSelectedObjectId(objectId);
  setViewMode('notes');
};
```

**4.4 Update main content rendering**

```typescript
{viewMode === 'calendar' ? (
  <CalendarView onNavigate={handleOpenObject} />
) : viewMode === 'typeBrowser' && selectedTypeKey ? (
  <TypeBrowserView
    typeKey={selectedTypeKey}
    onOpen={handleOpenObject}
  />
) : selectedObjectId ? (
  <NoteEditor objectId={selectedObjectId} onNavigate={setSelectedObjectId} />
) : (
  <EmptyState message="Select an object to view" />
)}
```

**4.5 Wire LeftSidebar**

```typescript
<LeftSidebar
  // ... existing props ...
  onTypeClick={handleTypeClick}
/>
```

### Phase 5: Testing

**5.1 Unit tests for hooks**

- `useObjectType` — Fetches type, handles loading/error
- `useObjectsOfType` — Fetches objects, supports refetch

**5.2 Unit tests for `buildColumnsFromSchema`**

- Empty schema → title + updatedAt only
- Full schema → all property columns
- Property type mapping

**5.3 Integration tests**

- Click type → TypeBrowserView renders
- Click Open → navigates to NoteEditor
- Edit cell → updateObject called, data refreshes

## Property Type to Cell Type Mapping

| Property Type | Cell Type   | Notes                                      |
| ------------- | ----------- | ------------------------------------------ |
| text          | text        | Inline editable text                       |
| richtext      | text        | Simplified to single-line for table        |
| number        | number      | Inline editable number                     |
| boolean       | boolean     | Checkbox toggle                            |
| date          | date        | Date picker                                |
| datetime      | datetime    | Date+time picker                           |
| select        | select      | Dropdown with options                      |
| multiselect   | multiselect | Multi-select dropdown                      |
| ref           | text        | Display as text (future: clickable link)   |
| refs          | text        | Display as comma-separated (future: pills) |

## Files to Create/Modify

### New Files

- `packages/design-system/src/components/TypeBrowser/cells/TitleCell.tsx`
- `packages/design-system/src/components/TypeBrowser/cells/TitleCell.stories.tsx`
- `apps/desktop/src/renderer/components/TypeBrowserView.tsx`
- `apps/desktop/src/renderer/hooks/useObjectType.ts`
- `apps/desktop/src/renderer/hooks/useObjectsOfType.ts`
- `apps/desktop/src/renderer/utils/buildColumnsFromSchema.ts`

### Modified Files

- `packages/storage/src/objectService.ts` — Add options to listObjects
- `packages/storage/src/objectService.test.ts` — Tests for new options
- `packages/design-system/src/components/TypeBrowser/types.ts` — Add 'title' type
- `packages/design-system/src/components/TypeBrowser/TypeBrowser.tsx` — Handle 'title' type
- `packages/design-system/src/components/TypeBrowser/cells/index.ts` — Export TitleCell
- `apps/desktop/src/main/ipc.ts` — Add getObjectTypeByKey, extend listObjects
- `apps/desktop/src/preload/index.ts` — Expose new IPC
- `apps/desktop/src/preload/api.d.ts` — Type definitions
- `apps/desktop/src/renderer/global.d.ts` — Type definitions
- `apps/desktop/src/renderer/App.tsx` — ViewMode, state, handlers
- `apps/desktop/src/renderer/components/LeftSidebar.tsx` — onTypeClick prop

## Success Criteria

1. Clicking a type in sidebar shows TypeBrowser with that type's objects
2. Columns are dynamically generated from the type's schema
3. Title column shows "Open" button on hover
4. Clicking "Open" navigates to NoteEditor
5. Cells are editable (except title click opens; title edit via double-click or edit mode)
6. Edits persist via updateObject IPC
7. All 368+ existing tests still pass
8. New tests for hooks and utility functions
