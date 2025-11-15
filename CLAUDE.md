# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beat Link Dashboard is a React-based dashboard that integrates with Beat Link Trigger to display Pro DJ Link data in real-time. It shows live information from CDJ players including track metadata, waveforms, album art, and analytics.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
# Output goes to ../resources/beat_link_trigger/public
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### Data Flow

The application follows a unidirectional data flow pattern:

1. **Data Polling**: `useParamsData.js` custom hook polls `/params.json` from Beat Link Trigger backend (default: every 500ms, configurable in Settings)
2. **State Management**: React Context (`SettingsContext.jsx`) manages global settings (theme, polling interval, analytics, history fields)
3. **Local Persistence**: Settings and track history are persisted to localStorage
4. **Dashboard Rendering**: `Dashboard.jsx` receives params data and orchestrates component rendering

### Backend Integration

The app proxies API requests to Beat Link Trigger's OBS Overlay Webserver (default: `http://localhost:17081`):
- `/params.json` - Player state and track data
- `/artwork/:player` - Album artwork images
- `/wave-preview/:player` - Waveform preview images
- `/wave-detail/:player` - Detailed waveform data

Vite's dev server proxy configuration in `vite.config.js` handles this automatically during development.

### Key Components

**App.jsx**: Root component that orchestrates data fetching and renders Dashboard or loading/error states

**Dashboard.jsx**: Main orchestrator component that:
- Manages drag-and-drop reordering using @dnd-kit library
- Tracks player history with automatic deduplication
- Renders PlayerCards, SetTimeline, and TrackHistory in a grid layout
- Provides export functionality (CSV, JSON, TXT) for session history
- Persists track history to localStorage

**PlayerCard.jsx**: Displays individual CDJ player state including track metadata, waveform, album art, and analytics

**SettingsPanel.jsx**: Modal settings interface for theme, polling interval, and track history field configuration

**TrackHistory.jsx** & **SetTimeline.jsx**: Visualize track playback history in different formats

### State Management

- **Global Settings**: SettingsContext provides theme, pollingInterval, analyticsEnabled, trackHistoryFields
- **Track History**: Managed in Dashboard component state, persisted to localStorage as 'trackHistory'
- **Dashboard Order**: Component order (players, timeline, history) stored in local state for drag-and-drop

### Drag-and-Drop System

Dashboard uses @dnd-kit for reordering dashboard sections:
- Sections include: Player 1, Player 2, Timeline, History
- Uses `SortableContext` with `rectSortingStrategy` for 2-column grid layout
- Each section wrapped in `SortableSection` component
- Order persisted in component state (resets on refresh)

### History Tracking

The application automatically tracks when tracks change on players:
- Compares current track ID with last known track ID per player
- Creates history entries with timestamp, player, artist, title, BPM, duration, trackId, genre
- Deduplicates consecutive plays of same track on same player
- Persists to localStorage and provides export functionality

## Important Notes

- **Beat Link Trigger Required**: The dashboard requires Beat Link Trigger with OBS Overlay Server running at http://localhost:17081
- **Player Filtering**: Dashboard only shows players 1 and 2 from the params data
- **Build Output**: Production builds output to `../resources/beat_link_trigger/public` (parent directory)
- **No Tests**: Project currently has no test suite or linter configured
- **Mobile Support**: Responsive layout exists but needs further work per README
