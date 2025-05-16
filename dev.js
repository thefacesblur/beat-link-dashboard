const { spawn } = require('child_process');
const path = require('path');

// Start the metrics server
console.log('Starting metrics server...');
const metricsServer = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

// Start the Vite dev server
console.log('Starting Vite dev server...');
const viteServer = spawn('npx', ['vite'], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  metricsServer.kill();
  viteServer.kill();
  process.exit(0);
});

// Handle child process exits
metricsServer.on('close', (code) => {
  console.log(`Metrics server exited with code ${code}`);
  if (code !== 0 && code !== null) {
    process.exit(code);
  }
});

viteServer.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  if (code !== 0 && code !== null) {
    process.exit(code);
  }
});

console.log('\n=== Development Environment Started ===');
console.log('\n1. Vite Dev Server:');
console.log('   URL: http://localhost:5173');
console.log('   Purpose: Serves the React application');
console.log('   Proxies: Forwards API requests to the Clojure server on port 17081');
console.log('\n2. Metrics Server:');
console.log('   Express Server: http://localhost:3000');
console.log('   Metrics Endpoint: http://localhost:9090/metrics');
console.log('   Purpose: Collects and exposes application metrics for Prometheus');
console.log('\nIMPORTANT: In development mode, the React app communicates with the metrics');
console.log('server using CORS requests to http://localhost:3000/api/metrics/*');
console.log('\nPress Ctrl+C to stop all servers.\n'); 