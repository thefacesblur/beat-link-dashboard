# Beat Link Dashboard - React Dashboard for Beat-Link-Trigger

This is a React-based dashboard that integrates with Beat Link Trigger to display Pro DJ Link data in realtime, built with [Vite](https://vitejs.dev/).

Beat Link Trigger application can be found here: [https://github.com/Deep-Symmetry/beat-link-trigger](https://github.com/Deep-Symmetry/beat-link-trigger)

## Installation & Running

1. Install dependencies:

   ```sh
   cd beat-link-dashboard
   npm install
   ```
2. Start the development server:

   ```sh
   npm run dev
   ```
   
The app will be available at http://localhost:5173

**Important:** Beat Link Trigger / OBS Overlay Server must be running and be recieving Pro DJ Link data for this dashboard to function.


## Integration

- The React app fetches data from the Beat Link Trigger - OBS Overlay Webserver backend (e.g., `/params.json`, `/artwork/:player`, `/wave-preview/:player`).
- By default, the OBS Overlay Webserver API will be available at [http://localhost:17081/params.json](http://localhost:17081/params.json)


## Next Steps

- Work on fully responsive mobile layout.
- Further feature development.
