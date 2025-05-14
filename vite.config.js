import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Simplified configuration focused on development mode only
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // Completely disable source maps
  build: {
    sourcemap: false,
    minify: false,
  },
  
  // Disable source maps for dependencies as well
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: [],
    esbuildOptions: {
      sourcemap: false
    }
  },
  
  // Development server configuration
  server: {
    host: true,
    port: 5173,
    open: true,
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
    },
    allowedHosts: ['localhost', 'app.thefacesblur.com'],
    proxy: {
      '/params.json': 'http://localhost:17081',
      '/artwork': 'http://localhost:17081',
      '/wave-preview': 'http://localhost:17081',
      '/wave-detail': 'http://localhost:17081',
    },
  },
  
  // Path aliases for imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
  
  // CSS settings - disable source maps here too
  css: {
    devSourcemap: false,
  },
  
  // esbuild configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    sourcemap: false
  },
}); 