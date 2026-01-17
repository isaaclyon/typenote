/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
    },
  },
  safelist: [
    // Option color palette - these are dynamically composed so need safelisting
    // Light variants
    'bg-blue-50',
    'text-blue-700',
    'bg-green-50',
    'text-green-700',
    'bg-amber-50',
    'text-amber-700',
    'bg-red-50',
    'text-red-700',
    'bg-violet-50',
    'text-violet-700',
    // Regular variants
    'bg-blue-100',
    'text-blue-800',
    'bg-green-100',
    'text-green-800',
    'bg-amber-100',
    'text-amber-800',
    'bg-red-100',
    'text-red-800',
    'bg-violet-100',
    'text-violet-800',
    // Gray (already works but include for completeness)
    'bg-gray-100',
    'text-gray-600',
    'bg-gray-200',
    'text-gray-700',
  ],
};
