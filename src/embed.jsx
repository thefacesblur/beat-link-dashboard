import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import App from './App';
import { useSettings, SettingsProvider } from './SettingsContext';

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
    text: { primary: '#333333' },
  },
});

function ThemedApp({ themeName, apiBase }) {
  let mode = themeName;
  if (themeName === 'system') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      mode = 'light';
    } else {
      mode = 'dark';
    }
  }
  const muiTheme = mode === 'light' ? lightTheme : darkTheme;
  return (
    <ThemeProvider theme={muiTheme} key={mode}>
      <CssBaseline />
      <App apiBase={apiBase} />
    </ThemeProvider>
  );
}

function ThemeWrapper({ apiBase }) {
  const { theme } = useSettings();
  return <ThemedApp themeName={theme} apiBase={apiBase} key={theme} />;
}

export function mountBeatLinkDashboard(selector, options = {}) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) throw new Error(`mountBeatLinkDashboard: no element matches ${selector}`);
  const apiBase = options.apiBase ?? '';
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <SettingsProvider>
        <ThemeWrapper apiBase={apiBase} />
      </SettingsProvider>
    </React.StrictMode>
  );
  return { unmount: () => root.unmount() };
}

if (typeof window !== 'undefined') {
  window.mountBeatLinkDashboard = mountBeatLinkDashboard;
}
