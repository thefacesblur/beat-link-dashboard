import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';
  
  return {
    plugins: [react()],
    build: {
      outDir: '../resources/beat_link_trigger/public',
      emptyOutDir: true,
      // Improve source maps in production
      sourcemap: isProd ? 'hidden' : true,
      // Minify options
      minify: isProd ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd
        }
      }
    },
    server: {
      host: true,
      port: 5173,
      open: true,
      allowedHosts: ['localhost', 'app.thefacesblur.com'],
      proxy: {
        // Proxy API requests to the backend overlay server
        '/params.json': {
          target: 'http://localhost:17081',
          changeOrigin: true,
          configure: (proxy, options) => {
            // Handle connection errors gracefully
            proxy.on('error', (err, req, res) => {
              console.warn('Proxy error:', err);
              // Return empty JSON instead of error
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end('{}');
            });
          }
        },
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
    // Handle source map errors
    optimizeDeps: {
      // Skip source map generation for these problematic dependencies
      exclude: [],
      esbuildOptions: {
        sourcemap: 'external'
      }
    },
    // Disable source map warnings in console
    css: {
      devSourcemap: true
    },
    // Control console output
    logLevel: isProd ? 'info' : 'warn',
    clearScreen: false
  };
}); 
