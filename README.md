# Beat Link Trigger React UI

This is a React.js dashboard for Beat Link Trigger, built with [Vite](https://vitejs.dev/).

## Development

1. Install dependencies:
   ```sh
   cd react-ui
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```
   The app will be available at http://localhost:5173

## Building for Production

To build the static site and output it to the backend's public directory:

```sh
npm run build
```

The build output will be placed in `../resources/beat_link_trigger/public/`, where the Clojure backend can serve it.

## Integration

- The React app fetches data from the Beat Link Trigger backend (e.g., `/params.json`, `/artwork/:player`, `/wave-preview/:player`).
- By default, the dashboard will be available at `http://localhost:17081/public/` (or whatever port the overlay server uses).

## Next Steps

- Implement dashboard components to display player status, track metadata, artwork, and waveforms.
- Style the UI for clarity and usability. 