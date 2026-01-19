declare module '@phosphor-icons/react/ssr' {
  import * as React from 'react';

  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
    color?: string;
    mirrored?: boolean;
  }

  export const MagnifyingGlass: React.ComponentType<IconProps>;
  export const Plus: React.ComponentType<IconProps>;
  export const Star: React.ComponentType<IconProps>;
  export const X: React.ComponentType<IconProps>;
}
