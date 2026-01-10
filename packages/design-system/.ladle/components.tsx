import type { GlobalProvider } from '@ladle/react';
import '../src/tokens/index.css';

export const Provider: GlobalProvider = ({ children }) => (
  <div className="p-8 bg-white min-h-screen">{children}</div>
);
