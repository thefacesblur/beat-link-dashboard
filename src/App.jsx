import React, { useState, useCallback, memo } from 'react';
import useParamsData from './useParamsData';
import Dashboard from './Dashboard';
import { Container, Typography, Box, Alert, CircularProgress, IconButton, useTheme, Snackbar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsPanel from './SettingsPanel';

// Memoized components
const LoadingIndicator = memo(() => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
    <CircularProgress />
  </Box>
));

const ErrorMessage = memo(({ message }) => (
  <Alert severity="error">{message}</Alert>
));

const MockDataBanner = memo(() => (
  <Alert 
    severity="info" 
    sx={{ mb: 2 }}
  >
    Using mock data for development (API unavailable)
  </Alert>
));

const AppHeader = memo(({ onSettingsClick }) => {
  const theme = useTheme();
  
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={-2}>
      <Typography variant="h3" gutterBottom sx={{ ml: 3.6 }}>
        Beat Link Dashboard
      </Typography>
      <IconButton 
        onClick={onSettingsClick} 
        size="large" 
        aria-label="Settings" 
        sx={{ mr: 3 }}
      >
        <SettingsIcon />
      </IconButton>
    </Box>
  );
});

function App() {
  const { data, error, loading, isUsingMockData } = useParamsData();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [networkErrorOpen, setNetworkErrorOpen] = useState(false);
  
  // Show network error snackbar when error occurs but not when using mock data
  React.useEffect(() => {
    if (error && !isUsingMockData) {
      setNetworkErrorOpen(true);
    }
  }, [error, isUsingMockData]);
  
  // Memoized callback for settings panel
  const handleSettingsOpen = useCallback(() => {
    setSettingsOpen(true);
  }, []);
  
  const handleSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);
  
  const handleErrorClose = useCallback(() => {
    setNetworkErrorOpen(false);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 4 }}>
      <AppHeader onSettingsClick={handleSettingsOpen} />
      
      {/* Show network error in a dismissible snackbar */}
      <Snackbar
        open={networkErrorOpen}
        autoHideDuration={6000}
        onClose={handleErrorClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
          {error && !isUsingMockData ? error.message : 'Network error'}
        </Alert>
      </Snackbar>
      
      {/* Show mock data banner when using fallback data */}
      {isUsingMockData && <MockDataBanner />}
      
      {!data && !error && !isUsingMockData && <LoadingIndicator />}
      
      {data && <Dashboard params={data} />}
      
      <SettingsPanel 
        open={settingsOpen} 
        onClose={handleSettingsClose} 
      />
    </Container>
  );
}

export default memo(App); 