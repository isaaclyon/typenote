import type { GlobalProvider } from '@ladle/react';
import '../src/lib/tokens.css';

/**
 * Global provider that wraps all Ladle stories.
 * Imports design tokens to ensure consistent styling.
 */
export const Provider: GlobalProvider = ({ children }) => {
  return <>{children}</>;
};
