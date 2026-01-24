import path from 'node:path';
import { builtinModules } from 'node:module';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

const external = [
  'electron',
  'better-sqlite3',
  /^@typenote\//,
  ...builtinModules,
  ...builtinModules.map((mod) => `node:${mod}`),
];

export default defineConfig(({ mode }) => {
  const enableElectron = mode !== 'renderer';

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(enableElectron
        ? [
            electron({
              main: {
                entry: path.resolve(__dirname, 'src/main/index.ts'),
                vite: {
                  build: {
                    outDir: path.resolve(__dirname, 'dist/main'),
                    emptyOutDir: false,
                    sourcemap: true,
                    rollupOptions: { external },
                  },
                },
              },
              preload: {
                input: path.resolve(__dirname, 'src/preload/index.ts'),
                vite: {
                  build: {
                    outDir: path.resolve(__dirname, 'dist/preload'),
                    emptyOutDir: false,
                    sourcemap: true,
                    rollupOptions: { external },
                  },
                },
              },
            }),
          ]
        : []),
    ],
    root: './src/renderer',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/renderer'),
      },
    },
    server: {
      port: 5173,
      strictPort: true, // Fail if port is in use (Electron expects this port)
    },
    // Use relative paths for Electron's file:// protocol
    base: './',
    build: {
      outDir: '../../dist/renderer',
      emptyOutDir: true,
    },
  };
});
