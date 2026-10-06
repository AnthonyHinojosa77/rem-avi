import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';

// Separate build: retain the Sites Worker and its historical D1 data for rollback.
export default defineConfig({
  root: resolve(import.meta.dirname, 'static'),
  publicDir: resolve(import.meta.dirname, 'public'),
  base: process.env.PAGES_BASE_PATH || '/rem-avi.m/',
  plugins: [react()],
  build: {outDir: resolve(import.meta.dirname, 'dist-pages'), emptyOutDir: true},
});
