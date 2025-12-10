# Beat Link Dashboard

### React Dashboard for Beat-Link-Trigger

A real-time monitoring dashboard for Pioneer CDJ equipment connected via Pro DJ Link. Built with React and Vite, this dashboard integrates with [Beat Link Trigger](https://github.com/Deep-Symmetry/beat-link-trigger) to display live player information, track metadata, waveforms, and performance analytics.

![BeatLinkDashboard-Preview-2](https://github.com/user-attachments/assets/d24ca394-cc0b-44ec-932d-1dbd758c125e)

## Features

### Real-Time Monitoring
- **Live Player Status** - Monitor up to 2 CDJ players with online/offline indicators
- **Track Metadata** - Display artist, title, BPM, key, and genre information
- **Waveform Visualization** - Real-time waveform preview for each player
- **Album Artwork** - Automatic album art display
- **Beat Indicators** - Circular beat visualizer showing current beat position
- **Progress Tracking** - Linear progress bar with time played and remaining

### Track History & Analytics
- **Automatic Logging** - Tracks are automatically logged when loaded on players
- **Smart Deduplication** - Prevents duplicate entries for consecutive plays
- **Persistent Storage** - History saved to browser localStorage
- **Performance Analytics** - View total tracks, unique artists, average BPM, and set duration
- **BPM Distribution** - Visual chart showing tempo patterns across your set
- **Set Timeline** - Interactive timeline visualization of your entire performance

### Data Export
Export your track history in multiple formats:
- **CSV** - For spreadsheet applications (Excel, Google Sheets)
- **JSON** - For developers and custom applications
- **TXT** - Human-readable format with timestamps

### Customization
- **Drag-and-Drop Layout** - Reorder dashboard sections to your preference
- **Theme Options** - Light, Dark, or System theme modes
- **Configurable Polling** - Adjust data refresh rate (100ms - 10000ms)
- **Customizable History Table** - Choose which columns to display
- **Toggle Analytics** - Show or hide analytics features

## Quick Start

### Prerequisites

Before using the dashboard, you need:

1. **Pioneer CDJ Equipment** - CDJs connected via Pro DJ Link network
2. **Beat Link Trigger** - Download from [https://github.com/Deep-Symmetry/beat-link-trigger](https://github.com/Deep-Symmetry/beat-link-trigger)
3. **OBS Overlay Server** - Enable in Beat Link Trigger settings (port 17081)
4. **Node.js** - Version 16 or higher (for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/thefacesblur/beat-link-dashboard.git
cd beat-link-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The dashboard will be available at [http://localhost:5173](http://localhost:5173)

### First Time Setup

1. **Start Beat Link Trigger**
   - Launch Beat Link Trigger application
   - Ensure CDJs are connected and detected
   - Enable "OBS Overlay Server" in preferences
   - Verify server is running on port 17081

2. **Open Dashboard**
   - Navigate to `http://localhost:5173` in your browser
   - Dashboard should connect automatically

3. **Verify Connection**
   - Player cards should show "Online" status (green indicator)
   - Load a track on a CDJ to test
   - Track information should appear immediately

## Documentation

Comprehensive documentation is available for different use cases:

### For Users
- **[User Guide](USER_GUIDE.md)** - Complete guide to using the dashboard
  - Dashboard overview and features
  - Track history and analytics
  - Settings and customization
  - Export functionality
  - Troubleshooting tips

- **[Getting Started](GETTING_STARTED.md)** - Quick start tutorial for beginners
  - Step-by-step setup instructions
  - First performance walkthrough
  - Common workflows

### For Developers
- **[Development Guide](DEVELOPMENT.md)** - Technical documentation
  - Project architecture and structure
  - Component documentation
  - State management patterns
  - API integration details
  - Build process and deployment
  - Contributing guidelines

- **[CLAUDE.md](CLAUDE.md)** - AI assistant context for code development

## Usage

### Basic Workflow

1. **Start Your Equipment**
   - Power on CDJs and connect to network
   - Launch Beat Link Trigger
   - Open the dashboard in browser

2. **Monitor Your Performance**
   - Watch real-time player status
   - View track metadata and waveforms
   - Track history builds automatically

3. **Review Your Set**
   - Check the Set Timeline for visual overview
   - Switch to Analytics tab for statistics
   - View BPM distribution and track counts

4. **Export Your Data**
   - Click "Export CSV" for spreadsheet format
   - Click "Export JSON" for structured data
   - Click "Export TXT" for readable format

### Customizing Settings

Click the gear icon (⚙️) in the top right to access:

- **Polling Interval** - How often to refresh data (default: 500ms)
- **Theme** - Choose Light, Dark, or System theme
- **Analytics** - Enable or disable analytics features
- **History Fields** - Select which columns appear in history table

## Integration

### Beat Link Trigger Setup

The dashboard requires Beat Link Trigger's OBS Overlay Server to be running:

1. Open Beat Link Trigger
2. Go to Preferences/Settings
3. Find "OBS Overlay Server" section
4. Enable the server
5. Set port to 17081 (default)
6. Click "Start Server"

### API Endpoints

The dashboard connects to these endpoints:

- `GET /params.json` - Player state and track data
- `GET /artwork/:player` - Album artwork images
- `GET /wave-preview/:player` - Waveform preview images
- `GET /wave-detail/:player` - Detailed waveform data

Default server URL: `http://localhost:17081`

### Development Proxy

During development, Vite automatically proxies API requests to the Beat Link Trigger backend. See `vite.config.js` for configuration.

## Docker Deployment

The application can be deployed as a single Docker container that includes both the frontend and backend services.

### Prerequisites

- Docker and Docker Compose installed
- The `beat-link-api-standalone.jar` file must be present in `api-server/` directory

### Quick Start with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The dashboard will be available at `http://localhost:8080` (or the port specified by the `PORT` environment variable).

### Building the Docker Image

```bash
# Build the image
docker build -t beat-link-dashboard .

# Run the container
docker run -p 8080:8080 beat-link-dashboard
```

### Environment Variables

The following environment variables can be configured:

- `PORT` - Frontend server port (default: `8080`)
- `BACKEND_PORT` - Backend API port (default: `17081`)
- `BACKEND_HOST` - Backend host (default: `localhost`)

### Docker Compose Configuration

You can customize the deployment by modifying `docker-compose.yml` or using environment variables:

```bash
# Run with custom port
PORT=3000 docker-compose up

# Or set in .env file
echo "PORT=3000" > .env
docker-compose up
```

### Container Architecture

The Docker container runs two services:
1. **Clojure Backend** - Runs the Beat Link API server (port 17081 inside container)
2. **Node.js Frontend Server** - Serves static files and proxies API requests (port 8080 by default)

Both services run in the same container and communicate via localhost.

### Network Configuration for Pro DJ Link

**Important:** By default, Docker containers cannot access Pro DJ Link's UDP multicast network. To run the backend in Docker and detect CDJs, you need special network configuration.

**Quick Start Options:**

1. **WSL2 with Host Network** (Recommended for Windows):
   ```bash
   # First, configure WSL2 mirrored networking (one-time setup)
   powershell -ExecutionPolicy Bypass -File setup-wsl2-networking.ps1
   wsl --shutdown
   wsl
   
   # Then run in WSL2:
   cd /mnt/c/Users/adam/development/beat-link-dashboard
   docker compose -f docker-compose.host-network.yml up --build
   
   # Or use the helper script:
   run-wsl2-docker.bat
   ```

2. **Docker Desktop Host Network** (Alternative - requires Docker Desktop 4.34+):
   ```bash
   # Enable host networking in Docker Desktop Settings first
   docker-compose -f docker-compose.host-network.yml up --build
   ```

3. **Backend on Host** (Always works):
   ```bash
   # Run backend on host, frontend in container
   start-backend-host.bat  # In separate terminal
   docker-compose -f docker-compose.frontend-only.yml up --build
   ```

For detailed network setup instructions, see:
- **[NETWORK_SETUP.md](NETWORK_SETUP.md)** - General networking guide
- **[WSL2_SETUP.md](WSL2_SETUP.md)** - WSL2-specific setup (recommended for Windows)
- **[WINDOWS_NETWORKING.md](WINDOWS_NETWORKING.md)** - Windows Docker Desktop limitations

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server (after build)
npm start
```

### Build Output

Production builds are output to `dist/` directory. The built files can be served by the Node.js production server (`npm start`) or deployed via Docker.

### Tech Stack

- **React 18.2** - UI library
- **Vite 4.4** - Build tool and dev server
- **Material-UI 7.1** - Component library and theming
- **@dnd-kit** - Drag-and-drop functionality
- **Recharts** - Data visualization charts
- **Emotion** - CSS-in-JS styling

### Project Structure

```
beat-link-dashboard/
├── src/
│   ├── main.jsx              # Entry point and theme setup
│   ├── App.jsx               # Root component
│   ├── Dashboard.jsx         # Main layout and history
│   ├── PlayerCard.jsx        # CDJ player display
│   ├── TrackHistory.jsx      # History table
│   ├── TrackAnalytics.jsx    # Analytics charts
│   ├── SetTimeline.jsx       # Timeline visualization
│   ├── SettingsPanel.jsx     # Settings modal
│   ├── SettingsContext.jsx   # Global settings state
│   └── useParamsData.js      # Data polling hook
├── DEVELOPMENT.md            # Developer documentation
├── USER_GUIDE.md             # User documentation
├── GETTING_STARTED.md        # Quick start guide
└── CLAUDE.md                 # AI assistant context
```

## Features in Detail

### Player Cards

Each player card displays:
- Online/offline status indicator
- Player status (Playing, Paused, Loaded, Idle)
- Album artwork
- Track metadata (Title, Artist, BPM, Key)
- Waveform preview
- Circular beat visualizer
- Progress bar with time played/remaining

### Track History

Automatically tracks:
- Timestamp when track was loaded
- Player number (1 or 2)
- Artist and title
- BPM and duration
- Track ID for deduplication
- Genre information

### Analytics

Provides insights including:
- Total tracks played
- Unique artists count
- Average BPM
- Set duration in minutes
- BPM distribution chart

### Set Timeline

Visual timeline showing:
- Proportional track lengths
- Color-coded segments
- Hover tooltips with track details
- Start and end times

## Browser Compatibility

Recommended browsers:
- Chrome/Edge (Chromium) - Best performance
- Firefox - Fully supported
- Safari - Fully supported

## Performance Tips

- **Polling Interval**: Use 300-500ms for live performances
- **Browser Tab**: Keep dashboard tab active for best performance
- **Export Regularly**: Export history every 30-60 minutes as backup
- **Full Screen**: Press F11 for distraction-free monitoring
- **Dual Monitors**: Use secondary display for dashboard

## Troubleshooting

### Dashboard Not Loading

- Verify Beat Link Trigger is running
- Check OBS Overlay Server is enabled
- Confirm server is on port 17081
- Try accessing `http://localhost:17081/params.json` directly

### Players Show Offline

- Check CDJ network connections
- Verify Pro DJ Link is active
- Restart Beat Link Trigger
- Power cycle CDJs if needed

### Track History Not Updating

- Verify tracks are actually changing
- Check polling interval isn't too high
- Look for deduplication (same track loaded twice)
- Clear history and start fresh session

### Export Not Working

- Check browser download permissions
- Verify history contains data
- Try different export format
- Check browser console for errors

See [USER_GUIDE.md](USER_GUIDE.md#troubleshooting) for comprehensive troubleshooting.

## Roadmap

Potential future features:

- Support for 4 CDJ players
- Custom theme colors
- Individual history entry editing
- Session comparison tools
- Cloud sync for history
- Mobile app version
- Enhanced waveform analysis
- Spotify/Apple Music integration
- BPM trend analysis over time

## Contributing

Contributions are welcome! Please see [DEVELOPMENT.md](DEVELOPMENT.md#contributing) for:

- Code style guidelines
- Development workflow
- Testing requirements
- Pull request process

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Beat Link Trigger** - For providing the backend API and Pro DJ Link integration
- **Deep Symmetry** - For the incredible work on Beat Link libraries
- **Pioneer DJ** - For Pro DJ Link technology

## Support

- **Documentation**: Check [USER_GUIDE.md](USER_GUIDE.md) and [DEVELOPMENT.md](DEVELOPMENT.md)
- **Beat Link Trigger**: [https://github.com/Deep-Symmetry/beat-link-trigger](https://github.com/Deep-Symmetry/beat-link-trigger)
- **Issues**: Report bugs and request features via GitHub Issues

## Related Projects

- [Beat Link Trigger](https://github.com/Deep-Symmetry/beat-link-trigger) - Backend application
- [Beat Link](https://github.com/Deep-Symmetry/beat-link) - Core library for Pro DJ Link communication
- [Crate Digger](https://github.com/Deep-Symmetry/crate-digger) - Rekordbox database analysis

---

Built with ❤️ for DJs
