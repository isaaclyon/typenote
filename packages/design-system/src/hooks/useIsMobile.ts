import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook that returns true if the viewport is below the mobile breakpoint.
 *
 * For desktop Electron apps, this typically returns false, but it's used
 * by the shadcn Sidebar to support responsive behavior in case the window
 * is resized to a narrow width.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Default to false during SSR/initial render
  return isMobile ?? false;
}
