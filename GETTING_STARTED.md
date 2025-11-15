# Getting Started with Beat Link Dashboard

This guide will walk you through setting up and using Beat Link Dashboard for the first time. Whether you're preparing for a live performance or just exploring the features, follow these steps to get up and running quickly.

## Table of Contents

- [What You'll Need](#what-youll-need)
- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Your First Session](#your-first-session)
- [Understanding the Dashboard](#understanding-the-dashboard)
- [Common Workflows](#common-workflows)
- [Next Steps](#next-steps)

## What You'll Need

Before you begin, make sure you have:

### Hardware
- **Pioneer CDJ Players** (at least one, supports up to 2)
- **Network Switch or Router** (for Pro DJ Link connection)
- **Ethernet Cables** (to connect CDJs to network)
- **Computer** (Windows, macOS, or Linux)

### Software
- **Beat Link Trigger** - [Download here](https://github.com/Deep-Symmetry/beat-link-trigger/releases)
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Web Browser** - Chrome, Firefox, Edge, or Safari

### Knowledge
- Basic familiarity with DJ equipment
- Understanding of how CDJs connect via Pro DJ Link
- Basic web browser usage

## Installation

### Step 1: Install Beat Link Trigger

1. Download the latest release from the [Beat Link Trigger releases page](https://github.com/Deep-Symmetry/beat-link-trigger/releases)
2. Install following the instructions for your operating system:
   - **macOS**: Open the `.dmg` file and drag to Applications
   - **Windows**: Run the `.exe` installer
   - **Linux**: Extract and run the `.jar` file with Java

3. Launch Beat Link Trigger
4. The application should automatically detect CDJs on your network

### Step 2: Install Node.js

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the prompts
4. Verify installation by opening a terminal/command prompt and running:
   ```bash
   node --version
   npm --version
   ```

### Step 3: Install Beat Link Dashboard

1. **Clone or Download the Repository**

   Option A - Using Git:
   ```bash
   git clone https://github.com/thefacesblur/beat-link-dashboard.git
   cd beat-link-dashboard
   ```

   Option B - Download ZIP:
   - Visit the GitHub repository
   - Click "Code" → "Download ZIP"
   - Extract the ZIP file
   - Navigate to the folder in terminal/command prompt

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will download and install all required packages (may take a few minutes)

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   You should see output similar to:
   ```
   VITE v4.4.0  ready in 500 ms

   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

4. **Open Your Browser**
   - The dashboard should open automatically
   - If not, navigate to `http://localhost:5173`

## Initial Setup

### Step 1: Configure Beat Link Trigger

1. **Enable OBS Overlay Server**
   - In Beat Link Trigger, go to File → Preferences (or Beat Link Trigger → Preferences on macOS)
   - Look for the "OBS Overlay Server" section
   - Check "Enable Server"
   - Set Port to `17081` (this is the default)
   - Click "Start Server"

2. **Verify Server is Running**
   - You should see a status indicator showing the server is active
   - Note: Keep Beat Link Trigger running while using the dashboard

### Step 2: Connect Your CDJs

1. **Physical Setup**
   - Connect CDJs to your network switch/router with Ethernet cables
   - Connect your computer to the same network
   - Power on the CDJs

2. **Verify Pro DJ Link**
   - On each CDJ, press the "LINK" button
   - You should see other players listed
   - Beat Link Trigger should show detected players in its interface

3. **Test Connection**
   - In your browser, visit: `http://localhost:17081/params.json`
   - You should see JSON data displaying player information
   - If you see an error, check that OBS Overlay Server is running

### Step 3: Verify Dashboard Connection

1. **Open Dashboard**
   - Navigate to `http://localhost:5173`
   - You should see the Beat Link Dashboard interface

2. **Check Player Status**
   - Look for Player 1 and Player 2 cards
   - Green dot = Connected and online
   - Red dot = Offline or not detected

3. **Load a Test Track**
   - Load a track on one of your CDJs
   - The dashboard should immediately display:
     - Track title and artist
     - Album artwork (if available)
     - BPM and key
     - Waveform preview

4. **Verify Real-Time Updates**
   - Press play on the CDJ
   - Watch the progress bar move
   - Beat visualizer should pulse with each beat
   - Status should change to "Playing"

## Your First Session

Now that everything is set up, let's walk through using the dashboard during a typical DJ session.

### Pre-Session Checklist

- [ ] Beat Link Trigger is running
- [ ] OBS Overlay Server is enabled
- [ ] CDJs are connected and detected
- [ ] Dashboard is open in browser
- [ ] All players show "Online" status

### Starting Your Session

1. **Load Your First Track**
   - Load a track on Player 1
   - Watch it appear in the dashboard
   - Track details should display immediately

2. **Start Playing**
   - Press play on the CDJ
   - Observe:
     - Status changes to "Playing"
     - Progress bar moves
     - Beat visualizer pulses
     - Time played/remaining updates

3. **Load Next Track**
   - Load a track on Player 2
   - Notice it appears in the second player card
   - Track is automatically logged in Track History

4. **Check Track History**
   - Scroll down to the Track History section
   - See your first track listed with:
     - Time it was loaded
     - Deck number
     - Artist and title
     - BPM

### During Your Session

**Monitoring**
- Keep an eye on both player cards
- Track information updates in real-time
- History builds automatically as you play

**Transitions**
- As you transition between tracks, both players display simultaneously
- New tracks are automatically logged
- Timeline updates to show set progression

**Analytics** (Optional)
- Click the Analytics tab in Track History
- View statistics about your set:
  - Total tracks played
  - Unique artists
  - Average BPM
  - Set duration

### Ending Your Session

1. **Review Your Set**
   - Check the Set Timeline for visual overview
   - Review Track History for complete list
   - Check Analytics for performance insights

2. **Export Your Data**
   - Decide which format you need:
     - **CSV** - For spreadsheet analysis
     - **JSON** - For backup or programming
     - **TXT** - For readable format

3. **Click Export Button**
   - Click "Export CSV", "Export JSON", or "Export TXT"
   - File downloads automatically
   - Default location: Your browser's Downloads folder

4. **Save or Clear History**
   - To keep history for next session: Do nothing (it's auto-saved)
   - To start fresh: Click "Restart History Session"
   - Confirm when prompted

## Understanding the Dashboard

### Dashboard Sections

The dashboard has four main sections:

#### 1. Player Cards (Top)

```
┌─────────────────┐  ┌─────────────────┐
│   🟢 Deck 1     │  │   🟢 Deck 2     │
│   Playing       │  │   Paused        │
│   ┌──────┐      │  │   ┌──────┐      │
│   │Album │      │  │   │Album │      │
│   │ Art  │  Metadata│   │ Art  │  Metadata│
│   └──────┘      │  │   └──────┘      │
│   [Waveform]    │  │   [Waveform]    │
│   ●━━━━━━━━━━━  │  │   ━━━━●━━━━━━  │
│   2:45    -1:15 │  │   1:30    -2:30 │
└─────────────────┘  └─────────────────┘
```

#### 2. Set Timeline (Middle)

```
┌──────────────────────────────────────┐
│ Set Overview                         │
│ ████████▓▓▓▓▓▓███████▓▓▓▓            │
│ Start: 9:00 PM        End: 10:30 PM  │
└──────────────────────────────────────┘
```

#### 3. Track History (Bottom)

```
┌──────────────────────────────────────┐
│ [History] [Analytics]                │
│ Time  Deck  Artist      Title    BPM │
│ 10:15   2   Artist 1    Track 1  128 │
│ 10:05   1   Artist 2    Track 2  125 │
│  9:45   2   Artist 3    Track 3  130 │
└──────────────────────────────────────┘
```

#### 4. Export Controls (Bottom Right)

```
[Export CSV] [Export JSON] [Export TXT]
[Restart History Session]
```

### Real-Time Elements

**What Updates Automatically:**
- Player status (Playing, Paused, Loaded, Idle)
- Track metadata (artist, title, BPM, key)
- Album artwork
- Waveform preview
- Playback position and time
- Beat visualization
- Track history (when tracks change)
- Timeline visualization
- Analytics calculations

**What Updates on User Action:**
- Theme changes
- Layout reordering (drag and drop)
- Settings modifications
- History exports
- History reset

## Common Workflows

### Workflow 1: Live Performance

**Before Performance:**
1. Set polling interval to 300-500ms (Settings)
2. Enable Analytics (Settings)
3. Choose desired history fields (Settings)
4. Test with a track to verify connection
5. Export test data to confirm export works

**During Performance:**
1. Monitor player status in real-time
2. Let history build automatically
3. Export every 30-60 minutes as backup

**After Performance:**
1. Review Set Timeline
2. Check Analytics tab
3. Export final history in preferred format
4. Share exported data or keep for records

### Workflow 2: Practice Session

**Setup:**
1. Set polling interval to 500-1000ms
2. Disable Analytics if not needed
3. Minimal history fields (Time, Title)

**During Practice:**
1. Focus on mixing
2. Use dashboard for basic monitoring
3. Don't worry about exporting

**After Practice:**
1. Review track sequence if desired
2. Clear history before next session

### Workflow 3: Recording Review

**Setup:**
1. Set polling interval to 1000-2000ms
2. Enable Analytics
3. Full history fields

**During Recording:**
1. Let dashboard track automatically
2. Minimal interaction with UI

**After Recording:**
1. Export full history as CSV
2. Analyze BPM distribution
3. Review set structure via timeline
4. Create setlist document from export

### Workflow 4: Collaborative Setup

**Sharing Your Setup:**
1. Export history as TXT or CSV
2. Screenshot the Set Timeline
3. Share files with collaborators

**Reviewing Others' Sets:**
1. Ask for exported data
2. Review BPM patterns
3. Analyze track selection
4. Provide feedback

## Next Steps

### Learn More

Now that you're up and running, explore these resources:

- **[User Guide](USER_GUIDE.md)** - Comprehensive feature documentation
- **[Development Guide](DEVELOPMENT.md)** - For developers wanting to contribute
- **Settings Panel** - Experiment with different configurations
- **Drag and Drop** - Customize your dashboard layout

### Customize Your Experience

**Try Different Themes:**
- Click Settings icon (⚙️)
- Try Light, Dark, and System themes
- Choose what works best for your environment

**Adjust Polling Rate:**
- Experiment with different intervals
- Find the balance between responsiveness and performance
- Recommended: 300-500ms for live use

**Configure History Columns:**
- Choose which fields matter most to you
- Minimize clutter by hiding unused columns
- Remember you can change this anytime

### Optimize Your Setup

**For Best Performance:**
- Use Chrome or Edge browser
- Keep dashboard tab active (don't minimize)
- Close unnecessary browser tabs
- Use full-screen mode (F11)

**For Dual Monitor Setup:**
- Put dashboard on secondary display
- Keep DJ software on primary
- Set dashboard to full-screen
- Use dark theme to reduce eye strain

### Troubleshooting

If you encounter issues:

1. **Check the Basics**
   - Beat Link Trigger running?
   - OBS Overlay Server enabled?
   - CDJs connected to network?
   - Browser on same network?

2. **Test the API**
   - Visit `http://localhost:17081/params.json`
   - Should see JSON data
   - If not, check Beat Link Trigger

3. **Check Browser Console**
   - Press F12 to open developer tools
   - Look for error messages in Console tab
   - Red errors indicate problems

4. **Consult Documentation**
   - See [Troubleshooting section in User Guide](USER_GUIDE.md#troubleshooting)
   - Check Beat Link Trigger documentation
   - Review common issues and solutions

### Get Help

If you're still stuck:

- Review the comprehensive [User Guide](USER_GUIDE.md)
- Check [Beat Link Trigger documentation](https://github.com/Deep-Symmetry/beat-link-trigger)
- Create an issue on GitHub with details about your problem

### Share Your Experience

We'd love to hear how you're using Beat Link Dashboard:

- Share screenshots of your setup
- Report bugs or request features
- Contribute to the project
- Help other DJs get started

## Quick Reference

### Essential Commands

```bash
# Start dashboard
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Essential URLs

- **Dashboard**: `http://localhost:5173`
- **API Test**: `http://localhost:17081/params.json`
- **Beat Link Trigger**: [GitHub Repository](https://github.com/Deep-Symmetry/beat-link-trigger)

### Keyboard Shortcuts

- **F11** - Full-screen mode
- **Ctrl/Cmd + R** - Refresh page
- **F12** - Developer console (for troubleshooting)

### Default Settings

- **Polling Interval**: 500ms
- **Theme**: Dark
- **Analytics**: Enabled
- **History Fields**: Time, Deck, Artist, Title, BPM

### File Locations

- **Exported Files**: Browser's Downloads folder
- **History Storage**: Browser localStorage (automatic)
- **Settings Storage**: Browser localStorage (automatic)

## Congratulations!

You're now ready to use Beat Link Dashboard for your DJ sessions. Start with simple monitoring, then explore advanced features as you become more comfortable.

Remember:
- History is automatically saved
- Export regularly during long sessions
- Experiment with settings to find your preference
- The dashboard complements your DJ workflow, not replaces it

Happy mixing! 🎵🎧
