import React, { useState } from 'react';
import useParamsData from './useParamsData';
import Dashboard from './Dashboard';
import { Container, Typography, Box, Alert, CircularProgress, IconButton, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsPanel from './SettingsPanel';
import TrackHistory from './TrackHistory';

function App() {
  const { data, error } = useParamsData();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ pt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={-2}>
        <Typography variant="h3" gutterBottom sx={{ ml: 3.6 }}>
          Beat Link Dashboard
        </Typography>
        <IconButton onClick={() => setSettingsOpen(true)} size="large" aria-label="Settings" sx={{ mr: 3 }}>
          <SettingsIcon />
        </IconButton>
      </Box>
      {error && <Alert severity="error">{error.message}</Alert>}
      {!data && !error && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      )}
      {data && <Dashboard params={data} />}
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Container>
  );
}

export default App; 