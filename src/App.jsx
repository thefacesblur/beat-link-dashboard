import React from 'react';
import useParamsData from './useParamsData';
import Dashboard from './Dashboard';
import { Container, Typography, Box, Alert, CircularProgress } from '@mui/material';

function App() {
  const { data, error } = useParamsData();

  return (
    <Container width="100%" maxWidth="lg" sx={{ pt: 4 }}>
      <Typography variant="h4" sx={{ textAlign: 'left', marginLeft: '30px' }}>
        Beat Link Dashboard
      </Typography>
      {error && <Alert severity="error">{error.message}</Alert>}
      {!data && !error && ( 
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      )}
      {data && <Dashboard params={data} />}
    </Container>
  );
}

export default App; 