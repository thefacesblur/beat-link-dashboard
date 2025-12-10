const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Get configuration from environment variables
const PORT = process.env.PORT || 8080;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.BACKEND_PORT || 17081;
const BACKEND_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Proxy API requests to the Clojure backend
const apiProxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logLevel: 'info',
});

// Proxy specific API endpoints
app.use('/params.json', apiProxy);
app.use('/artwork', apiProxy);
app.use('/wave-preview', apiProxy);
app.use('/wave-detail', apiProxy);

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/params.json') || 
      req.path.startsWith('/artwork') || 
      req.path.startsWith('/wave-preview') || 
      req.path.startsWith('/wave-detail')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`Proxying API requests to ${BACKEND_URL}`);
});

