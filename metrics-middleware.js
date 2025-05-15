const { metrics } = require('./metrics-server');

// Middleware to track API requests
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();
  const endpoint = req.path;
  
  // Add a listener for the response finish event
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const status = res.statusCode;
    
    // Increment total requests counter
    metrics.apiRequestsTotal.inc({ endpoint, status });
    
    // Record request duration
    metrics.apiRequestDuration.observe({ endpoint, status }, duration);
  });
  
  next();
}

// Helper functions for updating application metrics
function updateTrackHistorySize(size) {
  metrics.trackHistorySize.set(size);
}

function updateActivePlayers(count) {
  metrics.activePlayers.set(count);
}

function incrementTrackChanges(playerNumber) {
  metrics.trackChanges.inc({ player: playerNumber.toString() });
}

module.exports = {
  metricsMiddleware,
  updateTrackHistorySize,
  updateActivePlayers,
  incrementTrackChanges
}; 