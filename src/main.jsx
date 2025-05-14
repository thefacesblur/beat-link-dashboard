import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme, CssBaseline, Box, Typography, Button } from '@mui/material';
import { useSettings, SettingsProvider } from './SettingsContext';

// Development mode logging
console.log('Running in development mode');

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

// Global error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when app crashes
      return (
        <Box 
          sx={{ 
            p: 4, 
            m: 2, 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#141414',
            color: 'white'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Application Error
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#ff6b6b' }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </Button>
          <Box sx={{ mt: 4, p: 2, bgcolor: '#1e1e1e', borderRadius: 1, width: '100%', overflow: 'auto' }}>
            <pre>{this.state.error?.stack}</pre>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Error handler for development
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
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

// In development mode, we use StrictMode and wrap everything in an ErrorBoundary
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeWrapper />
      </SettingsProvider>
    </ErrorBoundary>
  </React.StrictMode>
); 