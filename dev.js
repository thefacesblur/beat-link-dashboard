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

console.log('\nDevelopment servers started:');
console.log('- Vite dev server: http://localhost:5173');
console.log('- Metrics server: http://localhost:3000');
console.log('- Metrics endpoint: http://localhost:9090/metrics\n');
console.log('Press Ctrl+C to stop all servers.\n'); 