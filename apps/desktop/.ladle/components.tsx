import type { GlobalProvider } from '@ladle/react';

// Import your global styles so they apply to all stories
import '../src/renderer/index.css';

export const Provider: GlobalProvider = ({ children }) => {
  return <>{children}</>;
};
