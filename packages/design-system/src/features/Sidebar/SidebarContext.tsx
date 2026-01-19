import * as React from 'react';
import type { SidebarContextValue } from './types.js';

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebarContext(): SidebarContextValue {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('Sidebar components must be used within a Sidebar');
  }
  return context;
}

export { SidebarContext };
