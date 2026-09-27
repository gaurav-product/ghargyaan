import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Relative base so the build works from any static path (and file previews).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
} as Parameters<typeof defineConfig>[0]);
