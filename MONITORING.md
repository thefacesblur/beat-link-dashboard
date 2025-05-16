# Beat Link Dashboard Monitoring

This document describes how to set up and use the monitoring system for the Beat Link Dashboard application using Prometheus and Grafana.

## Overview

The monitoring system consists of:
- A Node.js metrics server that exposes application metrics
- Prometheus for collecting and storing metrics
- Grafana for visualizing the metrics

## Metrics Collected

### Application Metrics
- **Track History Size**: Number of tracks in the history
- **Active Players**: Number of active DJ players connected
- **Track Changes**: Count of track changes by player
- **API Request Duration**: Timing for API requests
- **API Request Count**: Total number of API requests

### System Performance Metrics
- **Memory Usage**: System and process memory usage statistics
- **CPU Usage**: Overall and per-core CPU utilization
- **Heap Statistics**: Node.js heap size and usage metrics
- **Event Loop**: Event loop lag measurements
- **Node.js Process**: Active handles and requests
- **Garbage Collection**: GC duration and frequency

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Prometheus

Copy the `prometheus.yml` file to your Prometheus configuration directory in `/home/adam/grafana`.

```bash
cp prometheus.yml /home/adam/grafana/prometheus/
```

### 3. Import Grafana Dashboards

1. Log in to your Grafana instance
2. Navigate to Dashboards > Import
3. Upload the dashboard JSON files or paste their contents:
   - `beat-link-dashboard.json` - Application metrics
   - `system-metrics-dashboard.json` - System performance metrics
4. Select the Prometheus data source
5. Click Import

### 4. Start the Application

#### Development Mode

For development with metrics monitoring:

```bash
npm run dev:all
```

This will start:
- The Vite dev server on port 5173 (for the React application)
- The metrics server on port 3000 (for API endpoints)
- The Prometheus metrics endpoint on port 9090

In development mode, the React application communicates with the metrics server using CORS requests to `http://localhost:3000/api/metrics/*`.

#### Production Mode

For production with metrics monitoring:

```bash
npm run build
npm run start
```

This will build the React app and start:
- The main application server on port 3000 (serves the built React app)
- The metrics endpoint on port 9090

## Architecture

The monitoring system is designed with a clear separation of concerns:

1. **Metrics Server** (server.js)
   - Runs on port 3000
   - Collects application metrics
   - Provides API endpoints for the React app to report metrics
   - Proxies API requests to the Clojure backend server

2. **Metrics Endpoint** (metrics-server.js)
   - Runs on port 9090
   - Exposes Prometheus-formatted metrics
   - Collects system performance metrics

3. **React Application**
   - Uses the `useMetrics` hook to report metrics
   - In development: Communicates with the metrics server via CORS
   - In production: Uses the same origin for metrics API calls

## Accessing Metrics and Dashboards

- Raw Prometheus metrics: http://localhost:9090/metrics
- Grafana dashboards: http://your-grafana-host/dashboards
  - "Beat Link Dashboard" - Application metrics
  - "Beat Link Dashboard - System Performance" - System performance metrics

## Monitoring Dashboard Features

### Application Dashboard
- Track history size over time
- Active players count
- Track change rate by player
- API request duration (95th percentile)
- Current track history size
- Current active players count
- Track changes distribution by player

### System Performance Dashboard
- System memory usage (total, used, free)
- CPU usage (overall and per-core)
- Node.js process memory (heap, RSS)
- Event loop lag
- Active handles and requests
- Heap usage percentage
- Memory usage percentage

## Troubleshooting

If metrics are not showing up in Grafana:

1. Check that the application is running with the appropriate command
2. Verify that metrics are available at http://localhost:9090/metrics
3. Ensure Prometheus is scraping the metrics endpoint (check Prometheus targets)
4. Check that Grafana can connect to your Prometheus data source
5. In development mode, check browser console for CORS errors

## Performance Optimization

The system performance metrics can help you identify:

1. **Memory Leaks**: Watch for continuously increasing memory usage without corresponding drops
2. **CPU Bottlenecks**: High CPU usage may indicate inefficient code or background processing
3. **Event Loop Issues**: High event loop lag suggests blocking operations affecting responsiveness
4. **Garbage Collection Problems**: Frequent or long-running GC operations can cause application pauses

## Customizing the Dashboard

You can customize the Grafana dashboards by:
1. Cloning the existing dashboards
2. Modifying panels or adding new ones
3. Adjusting time ranges or thresholds

## Adding New Metrics

To add new metrics:
1. Add the metric definition in `metrics-server.js`
2. Update the relevant code to track the metric
3. Add visualization to the Grafana dashboard 