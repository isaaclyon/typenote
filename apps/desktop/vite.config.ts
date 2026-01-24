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

export default defineConfig(async ({ mode }) => {
  const isWeb = mode === 'web';
  const enableElectron = !isWeb && mode !== 'renderer';

  const electronPlugins = enableElectron
    ? await electron({
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
      })
    : [];

  return {
    plugins: [react(), tailwindcss(), ...electronPlugins],
    root: path.resolve(__dirname, 'src/renderer'),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/renderer'),
      },
    },
    server: {
      port: 5173,
      strictPort: !isWeb, // Fail if port is in use in Electron mode only
      ...(isWeb && {
        // Proxy API requests to HTTP server in web mode
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      }),
    },
    // Use relative paths for Electron's file:// protocol, absolute for web
    base: isWeb ? '/' : './',
    build: {
      outDir: '../../dist/renderer',
      emptyOutDir: true,
    },
  };
});
