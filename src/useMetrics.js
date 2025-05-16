import { useEffect, useMemo } from 'react';

const useMetrics = ({ history, players }) => {
  // Determine the metrics API base URL based on environment
  const metricsApiUrl = useMemo(() => {
    // In development, metrics API is on a separate port
    if (import.meta.env.DEV) {
      // Use the dedicated metrics server port
      return 'http://localhost:3000/api/metrics';
    }
    // In production, metrics API is on the same origin
    return '/api/metrics';
  }, []);

  // Track number of items in history
  useEffect(() => {
    if (history && history.length >= 0) {
      fetch(`${metricsApiUrl}/track-history-size`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: history.length }),
        // Add mode: 'cors' to handle cross-origin requests in development
        mode: import.meta.env.DEV ? 'cors' : 'same-origin'
      }).catch(err => console.error('Failed to update track history metrics:', err));
    }
  }, [history, metricsApiUrl]);

  // Track number of active players
  useEffect(() => {
    if (players) {
      const activePlayers = Array.isArray(players) ? players.length : 0;
      fetch(`${metricsApiUrl}/active-players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: activePlayers }),
        mode: import.meta.env.DEV ? 'cors' : 'same-origin'
      }).catch(err => console.error('Failed to update active players metrics:', err));
    }
  }, [players, metricsApiUrl]);

  // Function to report track changes
  const reportTrackChange = (playerNumber) => {
    fetch(`${metricsApiUrl}/track-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerNumber }),
      mode: import.meta.env.DEV ? 'cors' : 'same-origin'
    }).catch(err => console.error('Failed to update track change metrics:', err));
  };

  return { reportTrackChange };
};

export default useMetrics; 