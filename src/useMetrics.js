import { useEffect } from 'react';

const useMetrics = ({ history, players }) => {
  // Track number of items in history
  useEffect(() => {
    if (history && history.length >= 0) {
      fetch('/api/metrics/track-history-size', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: history.length })
      }).catch(err => console.error('Failed to update track history metrics:', err));
    }
  }, [history]);

  // Track number of active players
  useEffect(() => {
    if (players) {
      const activePlayers = Array.isArray(players) ? players.length : 0;
      fetch('/api/metrics/active-players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: activePlayers })
      }).catch(err => console.error('Failed to update active players metrics:', err));
    }
  }, [players]);

  // Function to report track changes
  const reportTrackChange = (playerNumber) => {
    fetch('/api/metrics/track-change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: playerNumber })
    }).catch(err => console.error('Failed to update track change metrics:', err));
  };

  return { reportTrackChange };
};

export default useMetrics; 