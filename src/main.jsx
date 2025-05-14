import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSettings, SettingsProvider } from './SettingsContext';

// Theme definitions
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#29D9B9' },
    secondary: { main: '#dbdbdb' },
    background: { default: '#141414', paper: '#1e1e1e' },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#29D9B9' },
    secondary: { main: '#dbdbdb' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#333333' }
  },
});

function ThemedApp({ themeName }) {
  // Determine if we should use light, dark, or system
  let mode = themeName;
  if (themeName === 'system') {
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light';
    } else {
      mode = 'dark';
    }
  }

  // Choose the appropriate theme object
  const muiTheme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={muiTheme} key={mode}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

function ThemeWrapper() {
  const { theme } = useSettings();
  return <ThemedApp themeName={theme} key={theme} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeWrapper />
    </SettingsProvider>
  </React.StrictMode>
); 