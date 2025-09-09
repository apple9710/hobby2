import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/hobby2/', // GitHub Pages repository name
  build: {
    outDir: 'dist',
  },
});
