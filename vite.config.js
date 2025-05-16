import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
    open: true,
    allowedHosts: ['localhost', 'app.thefacesblur.com'],
    proxy: {
      // Proxy API requests to the backend overlay server
      '/params.json': 'http://localhost:17081',
      '/artwork': 'http://localhost:17081',
      '/wave-preview': 'http://localhost:17081',
      '/wave-detail': 'http://localhost:17081',
      // Proxy metrics API requests to the Express server
      '/api/metrics': 'http://localhost:3000'
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 
