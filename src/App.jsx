import React, { useState, useCallback, memo } from 'react';
import useParamsData from './useParamsData';
import Dashboard from './Dashboard';
import { Container, Typography, Box, Alert, CircularProgress, IconButton, useTheme } from '@mui/material';
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
  const { data, error, loading } = useParamsData();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Memoized callback for settings panel
  const handleSettingsOpen = useCallback(() => {
    setSettingsOpen(true);
  }, []);
  
  const handleSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 4 }}>
      <AppHeader onSettingsClick={handleSettingsOpen} />
      
      {error && <ErrorMessage message={error.message} />}
      
      {!data && !error && <LoadingIndicator />}
      
      {data && <Dashboard params={data} />}
      
      <SettingsPanel 
        open={settingsOpen} 
        onClose={handleSettingsClose} 
      />
    </Container>
  );
}

export default memo(App); 