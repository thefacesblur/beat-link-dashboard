const express = require('express');
const client = require('prom-client');
const http = require('http');
const os = require('os');

// Create Express server
const app = express();
const server = http.createServer(app);

// Create a Registry to register the metrics
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ 
  register,
  prefix: 'app_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
  eventLoopMonitoringPrecision: 10 // How often to check event loop in ms
});

// Create custom metrics
const apiRequestDuration = new client.Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['endpoint', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const trackHistorySize = new client.Gauge({
  name: 'track_history_size',
  help: 'Number of tracks in the history'
});

const activePlayers = new client.Gauge({
  name: 'active_players',
  help: 'Number of active players connected'
});

const apiRequestsTotal = new client.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests',
  labelNames: ['endpoint', 'status']
});

const trackChanges = new client.Counter({
  name: 'track_changes_total',
  help: 'Total number of track changes',
  labelNames: ['player']
});

// Add system metrics
const systemMemoryUsage = new client.Gauge({
  name: 'system_memory_usage_bytes',
  help: 'System memory usage in bytes',
  labelNames: ['type']
});

const systemCpuUsage = new client.Gauge({
  name: 'system_cpu_usage_percent',
  help: 'System CPU usage percentage',
  labelNames: ['core']
});

const processMemoryUsage = new client.Gauge({
  name: 'process_memory_usage_bytes',
  help: 'Process memory usage in bytes',
  labelNames: ['type']
});

const gcStats = new client.Gauge({
  name: 'nodejs_gc_duration_seconds',
  help: 'Garbage collection duration by type',
  labelNames: ['type']
});

const eventLoopLag = new client.Gauge({
  name: 'nodejs_eventloop_lag_seconds',
  help: 'Event loop lag in seconds'
});

const activeHandles = new client.Gauge({
  name: 'nodejs_active_handles',
  help: 'Number of active handles'
});

const activeRequests = new client.Gauge({
  name: 'nodejs_active_requests',
  help: 'Number of active requests'
});

// Register the metrics
register.registerMetric(apiRequestDuration);
register.registerMetric(trackHistorySize);
register.registerMetric(activePlayers);
register.registerMetric(apiRequestsTotal);
register.registerMetric(trackChanges);
register.registerMetric(systemMemoryUsage);
register.registerMetric(systemCpuUsage);
register.registerMetric(processMemoryUsage);
register.registerMetric(gcStats);
register.registerMetric(eventLoopLag);
register.registerMetric(activeHandles);
register.registerMetric(activeRequests);

// Function to update system metrics
function updateSystemMetrics() {
  // System memory metrics
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  systemMemoryUsage.set({ type: 'total' }, totalMem);
  systemMemoryUsage.set({ type: 'free' }, freeMem);
  systemMemoryUsage.set({ type: 'used' }, usedMem);
  
  // CPU usage metrics
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;
  
  cpus.forEach((cpu, i) => {
    const idle = cpu.times.idle;
    const total = Object.values(cpu.times).reduce((acc, time) => acc + time, 0);
    
    // Store CPU metrics by core
    systemCpuUsage.set({ core: `core${i}` }, 100 - (idle / total * 100));
    
    totalIdle += idle;
    totalTick += total;
  });
  
  // Overall CPU usage
  systemCpuUsage.set({ core: 'average' }, 100 - (totalIdle / totalTick * 100));
  
  // Process memory metrics
  const memory = process.memoryUsage();
  
  processMemoryUsage.set({ type: 'rss' }, memory.rss); // Resident Set Size
  processMemoryUsage.set({ type: 'heapTotal' }, memory.heapTotal);
  processMemoryUsage.set({ type: 'heapUsed' }, memory.heapUsed);
  processMemoryUsage.set({ type: 'external' }, memory.external);
  if (memory.arrayBuffers) {
    processMemoryUsage.set({ type: 'arrayBuffers' }, memory.arrayBuffers);
  }
  
  // V8 metrics
  try {
    const v8 = require('v8');
    const heapStats = v8.getHeapStatistics();
    
    processMemoryUsage.set({ type: 'v8HeapSizeLimit' }, heapStats.heap_size_limit);
    processMemoryUsage.set({ type: 'v8TotalAvailableSize' }, heapStats.total_available_size);
    processMemoryUsage.set({ type: 'v8TotalHeapSize' }, heapStats.total_heap_size);
    processMemoryUsage.set({ type: 'v8TotalPhysicalSize' }, heapStats.total_physical_size);
    processMemoryUsage.set({ type: 'v8UsedHeapSize' }, heapStats.used_heap_size);
  } catch (err) {
    console.error('Error collecting V8 metrics:', err);
  }
  
  // Node.js process metrics
  activeHandles.set(process._getActiveHandles().length);
  activeRequests.set(process._getActiveRequests().length);
  
  // Event loop lag
  const start = process.hrtime();
  setImmediate(() => {
    const delta = process.hrtime(start);
    const lagSeconds = (delta[0] + delta[1] / 1e9);
    eventLoopLag.set(lagSeconds);
  });
}

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  // Update system metrics before serving
  updateSystemMetrics();
  
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Update system metrics periodically (every 5 seconds)
setInterval(updateSystemMetrics, 5000);

// Export metrics for other modules to use
module.exports = {
  register,
  metrics: {
    apiRequestDuration,
    trackHistorySize,
    activePlayers,
    apiRequestsTotal,
    trackChanges,
    systemMemoryUsage,
    systemCpuUsage,
    processMemoryUsage,
    gcStats,
    eventLoopLag,
    activeHandles,
    activeRequests
  },
  startMetricsServer: (port = 9090) => {
    server.listen(port, () => {
      console.log(`Metrics server listening on port ${port}`);
      // Initialize metrics on startup
      updateSystemMetrics();
    });
    return server;
  }
}; 