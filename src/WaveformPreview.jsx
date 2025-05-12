import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function WaveformPreview({ playerNumber, player }) {
  const [cacheBuster, setCacheBuster] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      if (player && player['time-played'] && player['time-played']['raw-milliseconds'] !== undefined) {
        setCacheBuster(player['time-played']['raw-milliseconds']);
      } else {
        setCacheBuster(Date.now());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [player]);

  const src = `/wave-preview/${playerNumber}?width=400&height=80&cb=${cacheBuster}`;

  return (
    <Box mt={2}>
      <img
        src={src}
        alt={`Waveform preview for player ${playerNumber}`}
        style={{
          width: '100%',
          height: '85px',
          objectFit: 'fill',
          borderRadius: '8px',
          border: '1px solid #333',
          background: '#222'
        }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    </Box>
  );
}
