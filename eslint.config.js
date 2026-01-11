import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.js',
      '**/*.mjs',
      '**/drizzle.config.ts', // Config file outside src, not in tsconfig
      '**/vite.config.ts', // Config file outside src, not in tsconfig
      'apps/desktop/src/renderer/components/ui/**', // Shadcn UI components (generated)
    ],
  },
  // Base TypeScript config for all TS files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        projectService: true,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Disable base rules that conflict with TS
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off', // Use @typescript-eslint/no-redeclare instead
      '@typescript-eslint/no-redeclare': 'error',
    },
  },
  // Architectural boundaries - only packages (not apps) have import restrictions
  {
    files: ['packages/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['electron'],
              message: 'Core/API/Storage packages must not import Electron.',
            },
          ],
        },
      ],
    },
  },
  prettier,
];
