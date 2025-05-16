const express = require('express');
const path = require('path');
const { metricsMiddleware, updateTrackHistorySize, updateActivePlayers, incrementTrackChanges } = require('./metrics-middleware');
const { startMetricsServer } = require('./metrics-server');
const proxy = require('express-http-proxy');

// Start the metrics server
startMetricsServer(9090);

// Create the main Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Apply metrics middleware to all routes
app.use(metricsMiddleware);

// // Proxy api requests to the Clojure API server
// app.use('/params.json', proxy('http://localhost:17081', {
//   proxyReqPathResolver: () => '/params.json'
// }));

// app.use('/artwork', proxy('http://localhost:17081', {
//   proxyReqPathResolver: (req) => `/artwork`
// }));

// app.use('/wave-preview', proxy('http://localhost:17081', {
//   proxyReqPathResolver: (req) => `/wave-preview`
// }));

// app.use('/wave-detail', proxy('http://localhost:17081', {
//   proxyReqPathResolver: (req) => `/wave-detail`
// }));

// // API endpoints for metrics collection
// app.post('/api/metrics/track-history-size', (req, res) => {
//   const { size } = req.body;
//   updateTrackHistorySize(size);
//   res.sendStatus(200);
// });

// app.post('/api/metrics/active-players', (req, res) => {
//   const { count } = req.body;
//   updateActivePlayers(count);
//   res.sendStatus(200);
// });

// app.post('/api/metrics/track-change', (req, res) => {
//   const { player } = req.body;
//   incrementTrackChanges(player);
//   res.sendStatus(200);
// });

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Metrics available at http://localhost:9090/metrics`);
}); 