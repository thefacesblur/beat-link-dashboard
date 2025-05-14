import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import eslint from 'vite-plugin-eslint';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';
  const isAnalyze = mode === 'analyze';
  
  return {
    plugins: [
      react(),
      eslint(),
      // Apply compression in production
      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Apply brotli compression in production
      isProduction && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
      // Add bundle visualizer in analyze mode
      isAnalyze && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'bundle-analysis.html',
      }),
    ].filter(Boolean),
    
    build: {
      // Optimize bundle size
      target: 'es2018',
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      
      // Implement code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Group major dependencies 
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@emotion/react',
              '@emotion/styled',
            ],
            'vendor-charts': ['recharts'],
            'vendor-dnd': [
              '@dnd-kit/core',
              '@dnd-kit/sortable',
              '@dnd-kit/modifiers',
            ],
            'vendor-react': ['react', 'react-dom'],
            'vendor-virtualized': ['react-window', 'react-virtualized-auto-sizer'],
          },
          // Dynamically name chunks for better caching
          chunkFileNames: isProduction 
            ? 'assets/[name].[hash].js'
            : 'assets/[name].js',
          entryFileNames: isProduction 
            ? 'assets/[name].[hash].js'
            : 'assets/[name].js',
        },
      },
    },
    
    // Optimize development server
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
      },
    },
    
    // Add path aliases
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@utils': resolve(__dirname, 'src/utils'),
      },
    },
    
    // Optimize CSS
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        // Add any CSS preprocessor options here
      },
    },
    
    // Configure esbuild for better optimization
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      legalComments: 'none',
    },
  };
}); 
