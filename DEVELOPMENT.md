# Developer Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Component Documentation](#component-documentation)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)
- [Styling and Theming](#styling-and-theming)
- [Build Process](#build-process)
- [Contributing](#contributing)

## Project Overview

Beat Link Dashboard is a React-based real-time dashboard for monitoring Pro DJ Link data via Beat Link Trigger. It provides live visualization of CDJ player states, track information, waveforms, and performance analytics.

### Key Features

- Real-time player monitoring (CDJ status, track metadata, waveforms)
- Automatic track history logging with deduplication
- Interactive drag-and-drop dashboard layout
- Performance analytics (BPM distribution, track counts, set duration)
- Multiple data export formats (CSV, JSON, TXT)
- Configurable polling intervals and UI themes
- Beat visualization with circular beat indicators
- Timeline visualization of DJ sets

## Tech Stack

### Core
- **React 18.2** - UI library
- **Vite 4.4** - Build tool and dev server
- **Material-UI (MUI) 7.1** - Component library

### Key Dependencies
- **@dnd-kit** - Drag-and-drop functionality for dashboard reordering
- **Recharts** - Data visualization for analytics
- **@emotion** - CSS-in-JS styling

## Project Structure

```
beat-link-dashboard/
├── src/
│   ├── main.jsx              # App entry point, theme setup
│   ├── App.jsx               # Root component, data orchestration
│   ├── Dashboard.jsx         # Main dashboard layout, DnD, history
│   ├── PlayerCard.jsx        # Individual player display
│   ├── TrackMetadata.jsx     # Track info (title, artist, BPM, key)
│   ├── AlbumArt.jsx          # Album artwork display
│   ├── WaveformPreview.jsx   # Waveform visualization
│   ├── TrackHistory.jsx      # History table with tabs
│   ├── TrackAnalytics.jsx    # Analytics charts and stats
│   ├── SetTimeline.jsx       # Visual timeline of tracks
│   ├── SettingsPanel.jsx     # Settings modal
│   ├── SettingsContext.jsx   # Global settings state
│   └── useParamsData.js      # Custom hook for data polling
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies and scripts
└── CLAUDE.md                 # AI assistant context
```

## Architecture

### Component Hierarchy

```
main.jsx (ThemeProvider + SettingsProvider)
└── App.jsx (Data fetching orchestrator)
    └── Dashboard.jsx (Layout + History + DnD)
        ├── PlayerCard.jsx (Player 1)
        │   ├── TrackMetadata.jsx
        │   ├── AlbumArt.jsx
        │   └── WaveformPreview.jsx
        ├── PlayerCard.jsx (Player 2)
        │   ├── TrackMetadata.jsx
        │   ├── AlbumArt.jsx
        │   └── WaveformPreview.jsx
        ├── SetTimeline.jsx
        └── TrackHistory.jsx
            └── TrackAnalytics.jsx (when analytics enabled)
```

### Data Flow

1. **Polling** → `useParamsData.js` polls `/params.json` every N ms (default 500ms)
2. **Props** → Data flows from `App.jsx` → `Dashboard.jsx` → child components
3. **Context** → Settings flow from `SettingsContext` to all consumers
4. **Local State** → Track history maintained in `Dashboard.jsx` state
5. **Persistence** → Settings and history saved to localStorage

### State Management Strategy

The app uses a hybrid state management approach:

- **React Context** - Global settings (theme, polling, analytics)
- **Component State** - UI state, history, dashboard order
- **localStorage** - Persistence for settings and track history
- **Props** - Data propagation down component tree

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- Beat Link Trigger running with OBS Overlay Server enabled
- OBS Overlay Server listening on `http://localhost:17081`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd beat-link-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Development Workflow

1. Make changes to source files in `src/`
2. Vite provides hot module replacement (HMR) for instant updates
3. Vite proxies API requests to `localhost:17081` automatically
4. Test changes in browser with live Pro DJ Link data

### Build for Production

```bash
npm run build
```

Output directory: `../resources/beat_link_trigger/public`

**Important**: The build output goes to a parent directory path. This is designed for integration with the Beat Link Trigger Java application.

## Component Documentation

### Core Components

#### App.jsx

**Purpose**: Root component that manages data fetching and orchestrates the main UI

**Key Responsibilities**:
- Uses `useParamsData` hook to fetch player data
- Handles loading and error states
- Renders settings button and panel
- Passes data to Dashboard component

**State**:
- `settingsOpen` - Controls settings modal visibility

#### Dashboard.jsx

**Purpose**: Main dashboard that manages layout, track history, and drag-and-drop

**Key Responsibilities**:
- Filters players (only shows players 1 and 2)
- Tracks played tracks and creates history entries
- Deduplicates consecutive plays of same track
- Manages drag-and-drop reordering of dashboard sections
- Provides export functionality (CSV, JSON, TXT)
- Persists history to localStorage

**State**:
- `history` - Array of track history entries
- `dashboardOrder` - Order of dashboard sections for DnD
- `activeId` - Currently dragged item ID

**Data Structures**:
```javascript
// History entry
{
  timestamp: 1234567890,
  player: 1,
  artist: "Artist Name",
  title: "Track Title",
  bpm: 128,
  duration: 240,
  trackId: "abc123",
  genre: "House"
}
```

#### PlayerCard.jsx

**Purpose**: Displays complete state of a single CDJ player

**Features**:
- Online/offline status indicator
- Player status (Playing, Paused, Loaded, Idle)
- Album artwork
- Track metadata (title, artist, BPM, key)
- Waveform preview
- Circular beat visualizer
- Linear progress bar with time remaining

**Props**:
- `player` - Player object from params.json

#### useParamsData.js

**Purpose**: Custom hook for polling Beat Link Trigger data

**Features**:
- Configurable polling interval from settings
- Automatic cleanup on unmount
- Error handling
- Lifecycle management

**Returns**:
```javascript
{
  data: {...},  // Latest params.json data
  error: null   // Error object if fetch fails
}
```

### UI Components

#### TrackHistory.jsx

**Purpose**: Tabbed interface showing track history table and analytics

**Features**:
- Table with configurable columns (Time, Deck, Artist, Title, BPM)
- Analytics tab (when enabled in settings)
- Reverse chronological order (newest first)
- Responsive design with text wrapping

#### TrackAnalytics.jsx

**Purpose**: Statistical analysis and visualization of track history

**Metrics**:
- Total tracks played
- Unique artists count
- Average BPM
- Set duration in minutes
- BPM distribution chart

**Charts**:
- Bar chart showing BPM distribution using Recharts

#### SetTimeline.jsx

**Purpose**: Visual timeline representation of the DJ set

**Features**:
- Horizontal timeline with proportional track lengths
- Color coding alternates between primary/secondary colors
- Hover tooltips with track details
- Start and end time labels

#### SettingsPanel.jsx

**Purpose**: Modal dialog for configuring application settings

**Settings**:
- **Polling Interval** - How often to fetch data (ms)
- **Theme** - Light, Dark, or System
- **Analytics** - Enable/disable analytics tab
- **Track History Fields** - Which columns to show in history table

### Utility Components

#### SettingsContext.jsx

**Purpose**: React Context provider for global settings

**Provided Values**:
- `pollingInterval` / `setPollingInterval`
- `theme` / `setTheme`
- `analyticsEnabled` / `setAnalyticsEnabled`
- `trackHistoryFields` / `setTrackHistoryFields`
- `defaultFields` - Default history fields array

**Persistence**: Automatically saves to localStorage on every change

## State Management

### Settings State (Context)

Managed by `SettingsContext.jsx`:

```javascript
{
  pollingInterval: 500,              // ms
  theme: 'dark',                     // 'light' | 'dark' | 'system'
  analyticsEnabled: true,            // boolean
  trackHistoryFields: ['Time', 'Deck', 'Artist', 'Title', 'BPM']
}
```

**Storage Key**: `dj-dashboard-settings`

### Track History State

Managed by `Dashboard.jsx`:

```javascript
// Stored as array of track entries
[
  {
    timestamp: 1699999999999,
    player: 1,
    artist: "Artist Name",
    title: "Track Title",
    bpm: 128,
    duration: 240,
    trackId: "unique-id",
    genre: "Techno"
  },
  // ...more entries
]
```

**Storage Key**: `trackHistory`

**Deduplication**: The app prevents consecutive duplicate entries by comparing `trackId` and `player` with the most recent entry for that player.

### Dashboard Order State

Stored in `Dashboard.jsx` component state only (not persisted):

```javascript
[1, 2, 'dj-set-timeline', 'track-history']
```

Resets to default on page refresh.

## Data Flow

### Polling Mechanism

1. `main.jsx` renders `App.jsx` wrapped in `SettingsProvider`
2. `App.jsx` calls `useParamsData()` hook
3. Hook reads `pollingInterval` from SettingsContext
4. Hook starts polling `/params.json` every N milliseconds
5. On successful fetch, updates `data` state
6. Data flows to `Dashboard.jsx` via props
7. Dashboard filters and passes player data to `PlayerCard` components

### Track History Creation

1. `Dashboard.jsx` receives new `params` via props
2. `useEffect` hook monitors `params.players` for changes
3. For each player, compares current `track.id` with last known ID
4. If different, creates new history entry
5. Checks last history entry for same player to prevent duplicates
6. Adds entry to history state
7. Second `useEffect` saves history to localStorage

### Settings Updates

1. User opens SettingsPanel and changes a setting
2. SettingsPanel calls setter from `useSettings()` hook
3. SettingsContext updates state
4. `useEffect` in SettingsContext saves to localStorage
5. All consumers of context receive updated values
6. Components re-render with new settings

## API Integration

### Backend Requirements

Beat Link Trigger must be running with OBS Overlay Server enabled.

Default server: `http://localhost:17081`

### API Endpoints

#### GET /params.json

Returns current state of all CDJ players on the network.

**Response Structure**:
```json
{
  "players": {
    "1": {
      "number": 1,
      "is-playing": true,
      "is-paused": false,
      "is-track-loaded": true,
      "time-played": { "raw-milliseconds": 45000 },
      "beat-within-bar": 2,
      "track-bpm": 128,
      "track": {
        "id": "abc123",
        "title": "Track Title",
        "artist": "Artist Name",
        "bpm": 128,
        "duration": 240,
        "key": "Am",
        "genre": "House"
      }
    },
    "2": { /* ... */ }
  }
}
```

#### GET /artwork/:player

Returns album artwork image for specified player.

**Example**: `/artwork/1`

#### GET /wave-preview/:player

Returns waveform preview image.

**Example**: `/wave-preview/1`

#### GET /wave-detail/:player

Returns detailed waveform data.

**Example**: `/wave-detail/1`

### Vite Proxy Configuration

During development, Vite proxies these endpoints to the backend:

```javascript
// vite.config.js
proxy: {
  '/params.json': 'http://localhost:17081',
  '/artwork': 'http://localhost:17081',
  '/wave-preview': 'http://localhost:17081',
  '/wave-detail': 'http://localhost:17081',
}
```

In production, the app is served by Beat Link Trigger itself, so no proxy is needed.

## Styling and Theming

### Material-UI Theme

The app uses MUI's theme system with custom colors:

**Dark Theme**:
```javascript
{
  mode: 'dark',
  primary: { main: '#29D9B9' },      // Teal accent
  secondary: { main: '#dbdbdb' },     // Light gray
  background: {
    default: '#141414',               // Near black
    paper: '#1e1e1e'                  // Dark gray
  }
}
```

**Light Theme**:
```javascript
{
  mode: 'light',
  primary: { main: '#29D9B9' },
  secondary: { main: '#dbdbdb' },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff'
  },
  text: { primary: '#333333' }
}
```

### System Theme Detection

When theme is set to "system", the app detects OS preference:

```javascript
window.matchMedia('(prefers-color-scheme: light)').matches
```

### Emotion CSS-in-JS

MUI uses Emotion for styling. Use the `sx` prop for component-specific styles:

```jsx
<Box sx={{ mt: 2, p: 3, borderRadius: 3 }}>
  {/* content */}
</Box>
```

### Responsive Design

The app uses MUI's breakpoint system:

```javascript
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

// In JSX
<Box display="grid" gridTemplateColumns={isMobile ? '1fr' : 'repeat(2, 1fr)'}>
```

**Breakpoints**:
- `xs`: 0px+
- `sm`: 600px+
- `md`: 900px+
- `lg`: 1200px+
- `xl`: 1536px+

## Build Process

### Development Build

```bash
npm run dev
```

- Starts Vite dev server on port 5173
- Enables HMR (Hot Module Replacement)
- Proxies API requests to localhost:17081
- Opens browser automatically

### Production Build

```bash
npm run build
```

**Process**:
1. Vite bundles and minifies all code
2. Optimizes assets (images, fonts, etc.)
3. Generates static files in `../resources/beat_link_trigger/public`
4. Creates production-ready JavaScript and CSS bundles

**Output Structure**:
```
../resources/beat_link_trigger/public/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-assets]
```

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

## Drag and Drop System

The dashboard uses `@dnd-kit` for reordering sections.

### Implementation

```javascript
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';

// Setup sensors with activation distance
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
);

// Wrap dashboard in DndContext
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={dashboardOrder} strategy={rectSortingStrategy}>
    {/* Sortable items */}
  </SortableContext>
</DndContext>
```

### Sortable Items

Each dashboard section (player card, timeline, history) is wrapped in `SortableSection`:

```javascript
function SortableSection({ id, children, gridColumn }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  // ...renders with drag handlers
}
```

## Export Functionality

Dashboard provides three export formats for track history:

### CSV Export
- Header row with column names
- Quoted values for strings containing commas
- All history fields included

### JSON Export
- Pretty-printed JSON (2-space indent)
- Complete array of history objects

### TXT Export
- Human-readable format
- Format: `{time} | Deck {number} | {artist} - {title} | BPM: {bpm}`
- Filename includes current date

## Testing

**Current Status**: No test suite is currently implemented.

**Recommended Testing Strategy**:
- **Unit Tests**: Vitest for utility functions, hooks
- **Component Tests**: React Testing Library
- **E2E Tests**: Playwright or Cypress
- **Integration Tests**: Mock Beat Link Trigger API responses

## Contributing

### Code Style

- Use functional components and hooks (no class components)
- Prefer const over let where possible
- Use arrow functions for inline callbacks
- Keep components focused and single-responsibility

### File Organization

- One component per file
- Component filename matches component name
- Place related utilities in same file if not reusable

### Naming Conventions

- **Components**: PascalCase (e.g., `PlayerCard.jsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useParamsData.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `TIMELINE_ID`)
- **Functions**: camelCase (e.g., `getPlayerStatus`)

### Git Workflow

1. Create feature branch from main
2. Make changes and test locally
3. Commit with descriptive messages
4. Push and create pull request
5. Request code review

### Debugging Tips

**Polling Issues**:
- Check Beat Link Trigger is running
- Verify OBS Overlay Server is enabled on port 17081
- Check browser console for fetch errors
- Verify proxy configuration in vite.config.js

**Data Not Updating**:
- Check polling interval setting
- Verify useEffect dependencies
- Check for React StrictMode double-rendering issues

**History Duplicates**:
- Verify deduplication logic in Dashboard.jsx
- Check trackId consistency
- Inspect localStorage data

**Theme Not Applying**:
- Verify SettingsProvider wraps entire app
- Check localStorage for saved theme
- Test system theme detection

## Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Material-UI Documentation](https://mui.com/)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [Beat Link Trigger](https://github.com/Deep-Symmetry/beat-link-trigger)
