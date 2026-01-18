// Primitive Components
export * from './Button/index.js';
export * from './DailyNoteNav/index.js';
export * from './Separator/index.js';
export * from './Sheet/index.js';
export * from './Tooltip/index.js';
export * from './DailyNoteHeader/index.js';
export * from './DocumentHeader/index.js';
export * from './DropdownMenu/index.js';
export * from './IconPicker/index.js';
export * from './Input/index.js';
export * from './Badge/index.js';
export * from './BacklinkItem/index.js';
export * from './Card/index.js';
export * from './Checkbox/index.js';
export * from './ColorPicker/index.js';
export * from './Switch/index.js';
export * from './Select/index.js';
export * from './MultiselectDropdown/index.js';
export * from './EmptyState/index.js';
export * from './KeyboardKey/index.js';
export * from './MiniCalendar/index.js';
export * from './NotesCreatedList/index.js';
export * from './PropertyItem/index.js';
export * from './PropertyTags/index.js';
export * from './ScrollArea/index.js';
export * from './Skeleton/index.js';
export * from './Tag/index.js';
export * from './TagAddButton/index.js';
export * from './Text/index.js';
export * from './Toast/index.js';
export * from './Modal/index.js';
export * from './SettingsModal/index.js';
export * from './SaveStatus/index.js';
export * from './CommandPalette/index.js';

// Organism Components
export * from './AppShell/index.js';
export * from './RightSidebar/index.js';
export * from './CollapsibleSection/index.js';
// Legacy Sidebar (to be replaced)
export * from './Sidebar/index.js';
// New shadcn-based Sidebar primitives (use these for new code)
export {
  // Context & Provider
  SidebarProvider,
  useSidebar,
  SidebarContext,
  // Main Sidebar - renamed to avoid conflict with legacy
  Sidebar as ShadcnSidebar,
  // Layout Components
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  // Group Components
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  // Menu Components
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  sidebarMenuButtonVariants,
  // Submenu Components
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  // Controls
  SidebarRail,
  SidebarTrigger,
  // Misc
  SidebarSeparator,
} from './ShadcnSidebar/index.js';
export type {
  SidebarContextProps,
  SidebarProviderProps,
  SidebarProps as ShadcnSidebarProps,
  SidebarGroupLabelProps,
  SidebarGroupActionProps,
  SidebarMenuButtonProps,
  SidebarMenuActionProps,
  SidebarMenuSubButtonProps,
  SidebarTriggerProps,
} from './ShadcnSidebar/index.js';

// TypeNote-specific Sidebar components (built on shadcn primitives)
export * from './TypeNoteSidebar/index.js';

// Editor Preview Components
export * from './EditorPreview/index.js';

// Interactive Editor
export * from './InteractiveEditor/index.js';

// Data Display
export * from './TypeBrowser/index.js';
