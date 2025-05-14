import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Simplified configuration focused on development mode only
export default defineConfig({
  plugins: [
    react(),
  ],
  
  // Development-focused build settings
  build: {
    sourcemap: true,
    minify: false,
    // Disable code splitting for development
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  
  // Source maps for development
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: []
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
  
  // CSS settings
  css: {
    devSourcemap: true,
  },
  
  // esbuild configuration
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}); 