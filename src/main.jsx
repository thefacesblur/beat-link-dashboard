import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { useSettings, SettingsProvider } from './SettingsContext';

// Create themes only once, outside component tree to avoid recreation
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#29D9B9' },
    secondary: { main: '#dbdbdb' },
    background: { 
      default: mode === 'dark' ? '#141414' : '#f5f5f5', 
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff'
    },
    text: { 
      primary: mode === 'dark' ? undefined : '#333333'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: mode === 'dark' ? '#444444' : '#bbbbbb',
            borderRadius: '4px',
          },
        },
      },
    },
  },
});

// Memoized theme wrapper component
const ThemeWrapper = React.memo(() => {
  const { theme: themeSetting } = useSettings();
  
  // Determine theme based on system preference if needed
  const effectiveTheme = useMemo(() => {
    if (themeSetting !== 'system') return themeSetting;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }, [themeSetting]);
  
  // Memoize theme creation
  const muiTheme = useMemo(() => 
    createAppTheme(effectiveTheme)
  , [effectiveTheme]);
  
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
});

// Add system theme detection listener
if (window.matchMedia) {
  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  try {
    // Modern browsers
    colorSchemeQuery.addEventListener('change', () => {
      // This will trigger a re-render in components using system theme
      window.dispatchEvent(new Event('system-theme-change'));
    });
  } catch (e) {
    console.warn('Browser does not support mediaQuery listeners');
  }
}

// Only create the root once
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <ThemeWrapper />
    </SettingsProvider>
  </React.StrictMode>
); 