import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Server-side, shared track history for all users
let trackHistory = [];

// Server-side deduplication function
function isDuplicate(newTrack) {
  // Don't add if we already have this exact track from this player
  return trackHistory.some(entry => 
    entry.player === newTrack.player && 
    entry.trackId === newTrack.trackId &&
    // If the timestamps are very close (within 5 seconds), consider it a duplicate
    Math.abs(entry.timestamp - newTrack.timestamp) < 5000
  );
}

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
    // These proxies are only used during development with Vite's dev server
    // In production, the Express server in server.js handles these proxies
    proxy: {
      // Proxy API requests to the backend overlay server
      '/params.json': 'http://localhost:17081',
      '/artwork': 'http://localhost:17081',
      '/wave-preview': 'http://localhost:17081',
      '/wave-detail': 'http://localhost:17081'
    },
    // Add track history API
    configureServer(server) {
      // GET /api/track-history - Get all track history
      server.middlewares.use('/api/track-history', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(trackHistory));
        } 
        // POST /api/track-history - Add a track to history
        else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const track = JSON.parse(body);
              if (track) {
                // Check for duplicates before adding
                if (!isDuplicate(track)) {
                  trackHistory.push(track);
                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, added: true }));
                } else {
                  // We found a duplicate, don't add it
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, added: false, reason: 'duplicate' }));
                }
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid track data' }));
              }
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
          });
        }
        // DELETE /api/track-history - Clear track history
        else if (req.method === 'DELETE') {
          trackHistory = [];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } 
        else {
          next();
        }
      });
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
}); 
