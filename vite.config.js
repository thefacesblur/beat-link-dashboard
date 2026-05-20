import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'srs-embed' ? '/blt/' : '/',
  build: mode === 'srs-embed'
    ? {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
          entry: resolve(__dirname, 'src/embed.jsx'),
          formats: ['iife'],
          name: 'BeatLinkDashboard',
          fileName: () => 'beat-link-dashboard.js',
        },
        cssCodeSplit: false,
      }
    : {
        outDir: '../resources/beat_link_trigger/public',
        emptyOutDir: true,
      },
  server: {
    host: true,
    port: 5173,
    open: true,
    allowedHosts: ['127.0.0.1', 'localhost'],
    proxy: {
      '/params.json': 'http://localhost:17081',
      '/artwork': 'http://localhost:17081',
      '/wave-preview': 'http://localhost:17081',
      '/wave-detail': 'http://localhost:17081',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}));
