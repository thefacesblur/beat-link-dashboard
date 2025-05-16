const { spawn } = require('child_process');

// Start the Vite dev server
console.log('Starting Vite dev server...');
const viteServer = spawn('npx', ['vite'], {
  stdio: 'inherit'
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down Vite dev server...');
  viteServer.kill();
  process.exit(0);
});

viteServer.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  if (code !== 0 && code !== null) {
    process.exit(code);
  }
});

console.log('\n=== Development Environment Started ===');
console.log('\nVite Dev Server:');
console.log('   URL: http://localhost:5173');
console.log('   Purpose: Serves the React application');
console.log('   Proxies: Forwards API requests to the Clojure server on port 17081');
console.log('\nPress Ctrl+C to stop the server.\n'); 