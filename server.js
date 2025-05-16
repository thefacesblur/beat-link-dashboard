const express = require('express');
const path = require('path');
const proxy = require('express-http-proxy');

// Create the main Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Add CORS support for development
app.use((req, res, next) => {
  // Allow requests from the Vite dev server
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Proxy API requests to the Clojure API server
app.use('/params.json', proxy('http://localhost:17081', {
  proxyReqPathResolver: () => '/params.json'
}));

app.use('/artwork/:player', proxy('http://localhost:17081', {
  proxyReqPathResolver: (req) => `/artwork/${req.params.player}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
}));

app.use('/wave-preview/:player', proxy('http://localhost:17081', {
  proxyReqPathResolver: (req) => `/wave-preview/${req.params.player}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
}));

app.use('/wave-detail/:player', proxy('http://localhost:17081', {
  proxyReqPathResolver: (req) => `/wave-detail/${req.params.player}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`
}));

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 