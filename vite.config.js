import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Server-side, shared track history for all users
let trackHistory = [];

// Better deduplication directly in the core logic
function cleanHistory() {
  // Use a Map to ensure only one entry per player+trackId
  const uniqueTracks = new Map();
  
  // Process all tracks chronologically (oldest first)
  [...trackHistory].sort((a, b) => a.timestamp - b.timestamp).forEach(entry => {
    const key = `${entry.player}-${entry.trackId}`;
    // Only keep the first occurrence (oldest)
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, entry);
    }
  });
  
  // Replace history with deduplicated array
  trackHistory = Array.from(uniqueTracks.values());
  console.log(`Cleaned history now has ${trackHistory.length} entries`);
  return trackHistory;
}

// Ensure we clean the history immediately when the server starts
trackHistory = cleanHistory();

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
      // Clean history at server start
      cleanHistory();
      
      server.middlewares.use('/api/track-history', (req, res, next) => {
        // For all track history routes, parse URL for additional actions
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        if (req.method === 'GET') {
          // Always clean history before returning it
          const cleanedHistory = cleanHistory();
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(cleanedHistory));
        } 
        else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const track = JSON.parse(body);
              if (track && track.trackId && track.player) {
                // Check if this track already exists
                const exists = trackHistory.some(
                  entry => entry.trackId === track.trackId && entry.player === track.player
                );
                
                if (!exists) {
                  trackHistory.push(track);
                  // Always clean after adding a new track
                  cleanHistory();
                  res.writeHead(201, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, added: true }));
                } else {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: true, added: false, reason: 'duplicate' }));
                }
              } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid track data' }));
              }
            } catch (e) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid JSON', details: e.message }));
            }
          });
        }
        else if (req.method === 'PATCH' && url.pathname.includes('/clean')) {
          // Explicitly clean the history
          cleanHistory();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, historySize: trackHistory.length }));
        }
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
