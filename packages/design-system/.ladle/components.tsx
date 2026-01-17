import type { GlobalProvider } from '@ladle/react';
import { useEffect } from 'react';
import '../src/tokens/index.css';

export const Provider: GlobalProvider = ({ children }) => {
  useEffect(() => {
    const root = document.documentElement;

    // Sync Ladle's theme selection with the dark class on html element
    // This is needed because our CSS uses .dark selector for dark mode
    const syncTheme = () => {
      // Ladle might set data-theme="dark" when theme mode is switched
      const dataTheme = root.getAttribute('data-theme');
      const currentClassState = root.classList.contains('dark');

      // If Ladle set data-theme="dark", ensure the dark class exists
      if (dataTheme === 'dark' && !currentClassState) {
        root.classList.add('dark');
      } else if (dataTheme !== 'dark' && currentClassState) {
        root.classList.remove('dark');
      }
    };

    // Initial sync
    syncTheme();

    // Watch for Ladle theme changes
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-8 min-h-screen bg-background text-foreground transition-colors duration-200">
      {children}
    </div>
  );
};
