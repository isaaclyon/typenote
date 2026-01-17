/**
 * ThemeProvider - Dynamic dark/light theme management
 *
 * Provides theme context to the entire app with:
 * - Real-time theme switching (light/dark/system)
 * - System theme detection with live updates
 * - localStorage persistence
 * - Smooth transitions with FOUC prevention
 */

import * as React from 'react';
import type { JSX } from 'react';
import { useSettings } from '../hooks/useSettings.js';

export type ColorMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** User's color mode preference (light/dark/system) */
  colorMode: ColorMode;
  /** Resolved theme after applying system preference if needed */
  resolvedTheme: ResolvedTheme;
  /** Update the color mode preference */
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * ThemeProvider - Wraps app with theme context and management
 *
 * Responsibilities:
 * 1. Load colorMode from settings via useSettings hook
 * 2. Detect system theme changes via matchMedia listener
 * 3. Apply resolved theme to DOM (class="dark" on html)
 * 4. Cache colorMode in localStorage for FOUC prevention inline script
 * 5. Handle transitions via CSS (defined in index.css)
 */
export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const { settings, updateSettings } = useSettings();
  const colorMode = settings.colorMode ?? 'system';

  // Track system theme (light/dark) - updates when OS preference changes
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  // Resolve which theme to actually use
  const resolvedTheme: ResolvedTheme = colorMode === 'system' ? systemTheme : colorMode;

  // Listen to OS theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply theme to DOM and update localStorage
  React.useEffect(() => {
    const html = document.documentElement;

    // Apply class to html element
    if (resolvedTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // Cache colorMode in localStorage for FOUC prevention script
    try {
      localStorage.setItem('typenote:colorMode', JSON.stringify(colorMode));
    } catch (e) {
      console.error('Failed to cache colorMode in localStorage:', e);
    }
  }, [colorMode, resolvedTheme]);

  // Remove theme-transitioning class after mount to enable CSS transitions
  React.useEffect(() => {
    const html = document.documentElement;
    html.classList.add('theme-transitioning');

    // Use rAF to ensure class removal happens after paint
    const timer = requestAnimationFrame(() => {
      html.classList.remove('theme-transitioning');
    });

    return () => cancelAnimationFrame(timer);
  }, []);

  const setColorMode = React.useCallback(
    (mode: ColorMode) => {
      void updateSettings({ colorMode: mode });
    },
    [updateSettings]
  );

  const value = React.useMemo(
    () => ({ colorMode, resolvedTheme, setColorMode }),
    [colorMode, resolvedTheme, setColorMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme - Hook to access theme context
 *
 * @throws {Error} If used outside of ThemeProvider
 * @returns Theme context with colorMode, resolvedTheme, and setColorMode
 *
 * @example
 * const { resolvedTheme, setColorMode } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
