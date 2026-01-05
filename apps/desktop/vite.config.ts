import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
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
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true,
  },
});
