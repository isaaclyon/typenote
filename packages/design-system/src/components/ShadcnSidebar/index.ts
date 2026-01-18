// Context & Provider
export { SidebarProvider, useSidebar, SidebarContext } from './SidebarContext.js';
export type { SidebarContextProps, SidebarProviderProps } from './SidebarContext.js';

// Main Sidebar
export { Sidebar } from './Sidebar.js';
export type { SidebarProps } from './Sidebar.js';

// Layout Components
export { SidebarContent } from './SidebarContent.js';
export { SidebarHeader } from './SidebarHeader.js';
export { SidebarFooter } from './SidebarFooter.js';
export { SidebarInset } from './SidebarInset.js';

// Group Components
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from './SidebarGroup.js';
export type { SidebarGroupLabelProps, SidebarGroupActionProps } from './SidebarGroup.js';

// Menu Components
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  sidebarMenuButtonVariants,
} from './SidebarMenu.js';
export type { SidebarMenuButtonProps, SidebarMenuActionProps } from './SidebarMenu.js';

// Submenu Components
export { SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from './SidebarMenuSub.js';
export type { SidebarMenuSubButtonProps } from './SidebarMenuSub.js';

// Controls
export { SidebarRail } from './SidebarRail.js';
export { SidebarTrigger } from './SidebarTrigger.js';
export type { SidebarTriggerProps } from './SidebarTrigger.js';

// Misc
export { SidebarSeparator } from './SidebarSeparator.js';
