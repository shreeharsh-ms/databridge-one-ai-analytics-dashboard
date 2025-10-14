import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ensures build works when served from any path (important for Docker/Nginx)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // optional, for cleaner imports
    },
  },
  build: {
    outDir: 'dist',       // default build output folder
    emptyOutDir: true,    // cleans the folder before build
    sourcemap: false,     // set to true if you want source maps
  },
  server: {
    port: 5173,
    open: true,
    strictPort: true,
  },
});
