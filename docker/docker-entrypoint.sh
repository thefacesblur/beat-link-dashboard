#!/bin/bash
set -e

# Get configuration from environment variables
BACKEND_PORT=${BACKEND_PORT:-17081}
FRONTEND_PORT=${PORT:-8080}
BACKEND_HOST=${BACKEND_HOST:-localhost}

echo "Starting Beat Link Dashboard container..."
echo "Backend port: ${BACKEND_PORT}"
echo "Frontend port: ${FRONTEND_PORT}"

# Function to check if backend is ready
wait_for_backend() {
  echo "Waiting for backend to be ready..."
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if curl -s -f "http://localhost:${BACKEND_PORT}/params.json" > /dev/null 2>&1; then
      echo "Backend is ready!"
      return 0
    fi
    attempt=$((attempt + 1))
    echo "Waiting for backend... (attempt $attempt/$max_attempts)"
    sleep 1
  done
  
  echo "Warning: Backend did not become ready in time, continuing anyway..."
  return 0
}

# Function to handle shutdown
cleanup() {
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  wait $BACKEND_PID 2>/dev/null || true
  wait $FRONTEND_PID 2>/dev/null || true
  exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Start the Clojure backend in the background
echo "Starting Clojure backend on port ${BACKEND_PORT}..."
cd /app
java -jar api-server/beat-link-api-standalone.jar ${BACKEND_PORT} &
BACKEND_PID=$!

# Wait for backend to be ready
wait_for_backend

# Start the Node.js frontend server
echo "Starting Node.js frontend server on port ${FRONTEND_PORT}..."
PORT=${FRONTEND_PORT} BACKEND_PORT=${BACKEND_PORT} BACKEND_HOST=${BACKEND_HOST} node server.js &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

