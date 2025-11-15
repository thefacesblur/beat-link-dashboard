# Beat Link Dashboard - User Guide

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [Dashboard Overview](#dashboard-overview)
- [Player Cards](#player-cards)
- [Track History](#track-history)
- [Set Timeline](#set-timeline)
- [Analytics](#analytics)
- [Settings](#settings)
- [Exporting Data](#exporting-data)
- [Customizing Your Layout](#customizing-your-layout)
- [Tips and Best Practices](#tips-and-best-practices)
- [Troubleshooting](#troubleshooting)

## Introduction

Beat Link Dashboard is a real-time monitoring tool for DJs using Pioneer CDJ equipment connected via Pro DJ Link. It displays live information from your CDJ players, tracks your set history, provides performance analytics, and allows you to export your track history in multiple formats.

### What You Can Do

- Monitor up to 2 CDJ players in real-time
- View track metadata, waveforms, and album artwork
- Track your complete set history automatically
- Analyze your performance with statistics and charts
- Export your track history as CSV, JSON, or TXT
- Customize the dashboard layout by dragging and dropping
- Switch between light and dark themes
- Adjust data refresh rates

### Requirements

- Pioneer CDJ players connected via Pro DJ Link network
- Beat Link Trigger application running on your computer
- OBS Overlay Server enabled in Beat Link Trigger (default port: 17081)

## Getting Started

### First Time Setup

1. **Start Beat Link Trigger**
   - Launch the Beat Link Trigger application
   - Enable the OBS Overlay Server feature
   - Ensure it's running on port 17081 (default)

2. **Open the Dashboard**
   - Navigate to `http://localhost:5173` in your web browser
   - The dashboard should automatically connect and display your CDJ data

3. **Verify Connection**
   - Look for the green status indicator on player cards
   - You should see "Online" status when CDJs are detected
   - Track information should appear when tracks are loaded

### Quick Tour

When you first open the dashboard, you'll see:

- **Header** - Application title and settings icon (top right)
- **Player Cards** - One card for each connected CDJ (Players 1 & 2)
- **Set Timeline** - Visual timeline showing when tracks were played
- **Track History** - Table listing all played tracks
- **Export Buttons** - Options to export your session data

## Dashboard Overview

The dashboard is organized into four main sections:

### Layout

```
┌─────────────────────────────────────────────┐
│  Beat Link Dashboard          [⚙️ Settings] │
├──────────────────┬──────────────────────────┤
│   Player 1       │      Player 2            │
│   (Deck 1)       │      (Deck 2)            │
├──────────────────┴──────────────────────────┤
│              Set Timeline                    │
├──────────────────────────────────────────────┤
│            Track History                     │
│         [Export CSV] [Export JSON] [Export TXT] │
└──────────────────────────────────────────────┘
```

### Real-Time Updates

The dashboard automatically refreshes data from your CDJ players:
- Default: Every 500 milliseconds (0.5 seconds)
- Configurable from 100ms to 10000ms in Settings
- Lower values = more responsive, higher CPU usage
- Higher values = less responsive, lower CPU usage

## Player Cards

Each player card displays comprehensive information about a CDJ:

### Status Information

**Online Indicator**
- **Green dot** = CDJ is connected and online
- **Red dot** = CDJ is offline or not detected

**Player Status**
- **Playing** - Track is currently playing
- **Paused** - Track is loaded but paused
- **Loaded** - Track is loaded but not playing
- **Idle** - No track loaded

### Track Information

**Metadata Display**
- **Track** - Song title
- **Artist** - Artist name
- **BPM** - Tempo in beats per minute
- **Key** - Musical key (e.g., Am, C#, F)

### Album Artwork

- Displays album art from the loaded track
- Updates automatically when tracks change
- Placeholder shown if artwork unavailable

### Waveform Preview

- Visual representation of the track's audio
- Shows overall track structure
- Updates in real-time with playback position

### Progress Bar

**Linear Progress**
- Shows current playback position
- Displays time played on the left
- Displays time remaining on the right (with minus sign)

**Beat Visualizer**
- Circular indicator showing current beat position
- Pulses on each beat (1-4 for 4/4 time)
- Color highlights the active beat

## Track History

The Track History section automatically logs every track you play during your session.

### How It Works

1. When you load a new track on a CDJ, it's automatically detected
2. Track information is captured (timestamp, player, artist, title, BPM, etc.)
3. Entry is added to the history table
4. History is saved to your browser's local storage
5. History persists even if you refresh the page

### Viewing History

**History Tab** (default view)
- Shows all played tracks in reverse chronological order (newest first)
- Customizable columns (configure in Settings)

**Available Columns**:
- **Time** - When the track was loaded (HH:MM format)
- **Deck** - Which player (1 or 2)
- **Artist** - Artist name
- **Title** - Track title
- **BPM** - Tempo

### Analytics Tab

When analytics are enabled (see Settings), you can switch to the Analytics tab to view:

**Summary Statistics**
- Total tracks played
- Unique artists count
- Average BPM across all tracks
- Total set duration in minutes

**BPM Distribution Chart**
- Bar chart showing how many tracks at each BPM
- Helps visualize the energy flow of your set
- Identifies your most common tempo ranges

### Managing History

**Clearing History**
- Click "Restart History Session" button
- Confirms before deleting (cannot be undone)
- Completely clears all tracked history
- Useful when starting a new performance session

**Automatic Deduplication**
- If you play the same track twice in a row on the same deck, only one entry is logged
- Prevents accidental duplicates from skipping back in tracks

## Set Timeline

The Set Timeline provides a visual overview of your entire DJ set.

### Visual Representation

- Horizontal bar showing all played tracks
- Each track is a colored segment
- Segment width represents how long between track loads
- Colors alternate (teal and gray) for visual distinction

### Interactive Features

**Hover Information**
- Hover over any segment to see details
- Shows: Artist - Title, Deck number, Time loaded

**Timeline Labels**
- Start time displayed on the left
- End time displayed on the right
- Times shown in 12-hour format (HH:MM AM/PM)

### Use Cases

- Visualize the flow of your set
- Identify quick transitions vs. long tracks
- Review set structure after performance
- Share timeline screenshot with collaborators

## Analytics

Analytics provide insights into your DJ performance and track selection.

### Available Metrics

**Total Tracks**
- Count of unique tracks played
- Excludes duplicates

**Unique Artists**
- Number of different artists played
- Indicates diversity of track selection

**Average BPM**
- Mean tempo across all tracks
- Useful for understanding set energy

**Set Duration**
- Total time from first to last track
- Displayed in minutes

### BPM Distribution

**Chart Features**
- X-axis: BPM values
- Y-axis: Number of tracks at that BPM
- Hover for exact counts
- Identifies tempo patterns and transitions

### Enabling/Disabling Analytics

- Open Settings (gear icon)
- Toggle "Enable Analytics"
- Analytics tab will appear/disappear in Track History

## Settings

Access settings by clicking the gear icon (⚙️) in the top right corner.

### Polling Interval

**What It Does**: Controls how often the dashboard fetches new data from Beat Link Trigger

**How to Adjust**:
- Enter value in milliseconds (ms)
- Minimum: 100ms (very responsive, higher CPU usage)
- Default: 500ms (balanced)
- Maximum: 10000ms (10 seconds, lower CPU usage)

**Recommendations**:
- **Live Performance**: 300-500ms for responsive updates
- **Recording Review**: 1000-2000ms for reduced overhead
- **Low-Power Devices**: 1000ms+ to conserve resources

### Theme

Choose your preferred visual theme:

**Light Mode**
- Bright background with dark text
- Better for well-lit environments
- Easier on the eyes in daylight

**Dark Mode** (default)
- Dark background with light text
- Reduces eye strain in low light
- Popular choice for club/stage environments

**System**
- Automatically matches your operating system preference
- Changes with OS dark/light mode setting

### Enable Analytics

**Toggle Analytics**
- Turn on: Shows Analytics tab in Track History
- Turn off: Hides analytics to simplify interface

**When to Enable**:
- Post-performance review
- Analyzing set patterns
- Preparing setlist reports

**When to Disable**:
- During live performance (reduce distractions)
- If you only need basic history tracking

### Track History Fields

**Customize Columns**
- Check/uncheck which fields appear in history table
- Available fields: Time, Deck, Artist, Title, BPM
- At least one field should be selected

**Common Configurations**:
- **Minimal**: Time, Title
- **Standard**: Time, Deck, Artist, Title
- **Detailed**: All fields (Time, Deck, Artist, Title, BPM)

### Saving Settings

- Settings are automatically saved to your browser
- Persist across browser sessions
- Stored locally (not sent to any server)

## Exporting Data

Export your track history to share, archive, or analyze in other tools.

### Export Formats

#### CSV (Comma-Separated Values)
- Opens in Excel, Google Sheets, Numbers
- Includes header row with column names
- All fields exported (timestamp, player, artist, title, BPM, duration, trackId, genre)

**Best For**:
- Spreadsheet analysis
- Creating setlist reports
- Importing into music software

#### JSON (JavaScript Object Notation)
- Structured data format
- Includes all track metadata
- Pretty-printed for readability

**Best For**:
- Developers and programmers
- Importing into custom applications
- Data backup

#### TXT (Plain Text)
- Human-readable format
- One track per line
- Format: `{time} | Deck {number} | {artist} - {title} | BPM: {bpm}`
- Filename includes current date

**Best For**:
- Quick review
- Posting to social media
- Simple archiving

### How to Export

1. Click the desired export button (CSV, JSON, or TXT)
2. File downloads automatically to your default Downloads folder
3. Filename: `track_history.{format}` or `track_history_{date}.txt`

### When to Export

**During Performance**:
- Export periodically as backup
- In case of browser crash or connection loss

**After Performance**:
- Export for archiving
- Share with promoters or collaborators
- Import into music management software

## Customizing Your Layout

The dashboard supports drag-and-drop reordering of sections.

### How to Reorder

1. **Click and hold** on any dashboard section
2. **Drag** the section to your desired position
3. **Release** to drop in new location
4. Other sections automatically rearrange

### Draggable Sections

- Player 1 card
- Player 2 card
- Set Timeline
- Track History

### Layout Examples

**Default Layout**:
```
Player 1 | Player 2
Timeline (full width)
History (full width)
```

**Timeline First**:
```
Timeline (full width)
Player 1 | Player 2
History (full width)
```

**Custom**:
```
Player 2 | Player 1
History (full width)
Timeline (full width)
```

### Notes

- Layout resets when you refresh the page
- Timeline and History always span full width
- Player cards can be swapped left/right

## Tips and Best Practices

### For Live Performances

1. **Test Before You Perform**
   - Verify connection 15 minutes before set time
   - Check that all CDJs appear online
   - Load a test track to confirm tracking

2. **Choose Appropriate Polling**
   - Use 300-500ms for responsive updates
   - Don't go below 300ms unless necessary

3. **Keep Browser Tab Active**
   - Some browsers throttle inactive tabs
   - Use a dedicated display if possible

4. **Export Periodically**
   - Export history every 30-60 minutes as backup
   - Protects against unexpected browser crashes

### For Post-Performance Analysis

1. **Enable Analytics**
   - Review BPM distribution
   - Check unique artist count
   - Analyze set duration

2. **Export in Multiple Formats**
   - CSV for spreadsheet analysis
   - JSON for backup
   - TXT for quick sharing

3. **Use Timeline for Visual Review**
   - Identify pacing and energy flow
   - Screenshot and share on social media

### For Recording Sessions

1. **Use Higher Polling Interval**
   - 1000-2000ms reduces overhead
   - Less distraction during creative process

2. **Disable Analytics During Recording**
   - Keep interface clean and focused
   - Enable later for review

### Browser Recommendations

**Best Performance**:
- Chrome or Edge (Chromium-based)
- Firefox
- Safari on macOS

**Full-Screen Mode**:
- Press F11 (Windows/Linux) or Cmd+Ctrl+F (Mac)
- Removes browser UI for clean display

**Dual Monitor Setup**:
- Put dashboard on secondary display
- Keep DJ software on primary display

## Troubleshooting

### Dashboard Shows "Loading" Forever

**Possible Causes**:
- Beat Link Trigger not running
- OBS Overlay Server not enabled
- Server on wrong port

**Solutions**:
1. Verify Beat Link Trigger is running
2. Check OBS Overlay Server is enabled
3. Confirm server is on port 17081
4. Try accessing `http://localhost:17081/params.json` directly
5. Check browser console for error messages (F12)

### Player Cards Show "Offline"

**Possible Causes**:
- CDJ not connected to network
- Pro DJ Link not active
- Network cable disconnected

**Solutions**:
1. Check CDJ network cable connections
2. Verify CDJs show link status on screen
3. Restart Beat Link Trigger
4. Power cycle CDJs if necessary

### Track Changes Not Being Logged

**Possible Causes**:
- Playing same track repeatedly
- Deduplication preventing logging
- Refresh rate too high

**Solutions**:
1. Verify you're loading different tracks
2. Check trackId is changing (export JSON to verify)
3. Reduce polling interval in settings
4. Clear history and start fresh session

### Waveforms or Artwork Not Displaying

**Possible Causes**:
- Images not available from Beat Link Trigger
- Proxy configuration issue
- Network connectivity problem

**Solutions**:
1. Verify images load at `http://localhost:17081/artwork/1`
2. Check browser console for 404 errors
3. Ensure tracks have embedded artwork
4. Try different tracks

### History Lost After Browser Refresh

**Possible Causes**:
- Browser privacy mode (Incognito)
- localStorage disabled
- Browser security settings

**Solutions**:
1. Don't use private/incognito browsing
2. Check browser allows localStorage
3. Export history regularly as backup
4. Use standard browser window

### Settings Not Saving

**Possible Causes**:
- localStorage quota exceeded
- Browser privacy settings
- Incognito/private mode

**Solutions**:
1. Clear browser cache and cookies
2. Exit private/incognito mode
3. Check browser storage settings
4. Try different browser

### High CPU Usage

**Possible Causes**:
- Polling interval too low
- Multiple browser tabs open
- Resource-intensive browser extensions

**Solutions**:
1. Increase polling interval (Settings)
2. Close unnecessary browser tabs
3. Disable browser extensions temporarily
4. Use lighter browser (Chrome/Edge)

### Timeline or Analytics Not Showing

**Possible Causes**:
- No tracks have been played yet
- History is empty

**Solutions**:
1. Load and play some tracks
2. Wait for automatic tracking to occur
3. Verify history table has entries
4. Check analytics is enabled in Settings

## Keyboard Shortcuts

Currently, the dashboard does not have keyboard shortcuts, but you can use standard browser shortcuts:

- **F11** - Toggle full-screen mode
- **Ctrl/Cmd + R** - Refresh page
- **Ctrl/Cmd + +/-** - Zoom in/out
- **F12** - Open developer console (for troubleshooting)

## Data Privacy

### What Data is Stored

**Locally Stored** (in your browser):
- Track history
- Settings preferences
- Dashboard layout preferences

**Not Stored or Transmitted**:
- No data is sent to external servers
- No analytics or tracking
- No user accounts or login data

### Clearing Data

**Clear History**:
- Click "Restart History Session" button

**Clear All Data**:
- Use browser's "Clear browsing data" feature
- Select "Cookies and site data" and "Cached images and files"
- Choose time range: "All time"

## Support and Feedback

### Getting Help

1. Check this User Guide for solutions
2. Review the Troubleshooting section
3. Check Beat Link Trigger documentation
4. Verify Pro DJ Link network is functioning

### Reporting Issues

If you encounter bugs or issues, please report them with:
- Description of the problem
- Steps to reproduce
- Browser and version
- Beat Link Trigger version
- Screenshots if applicable

## Frequently Asked Questions

**Q: Can I use this with more than 2 CDJs?**
A: Currently, the dashboard only displays Players 1 and 2. Support for 4 players may be added in future versions.

**Q: Does this work with Rekordbox DJ software?**
A: The dashboard requires Beat Link Trigger, which works with Pioneer hardware CDJs connected via Pro DJ Link.

**Q: Can I customize the theme colors?**
A: Currently, only Light and Dark themes are available. Custom color themes may be added in the future.

**Q: Will my history be available on other devices?**
A: No, history is stored locally in your browser. Export your history to transfer it between devices.

**Q: Can I edit or delete individual history entries?**
A: Currently, you can only clear the entire history. Individual entry editing is not supported.

**Q: Does this replace Beat Link Trigger?**
A: No, this dashboard requires Beat Link Trigger to function. It's a complementary visualization tool.

**Q: Can I run this on a tablet or phone?**
A: The dashboard is responsive and works on mobile devices, but the full experience is optimized for desktop/laptop screens.

**Q: Is there a limit to how many tracks can be stored in history?**
A: The limit depends on your browser's localStorage quota (typically 5-10 MB). This can store thousands of track entries.
