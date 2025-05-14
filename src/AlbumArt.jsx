import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export default function AlbumArt({ playerNumber, player }) {
  // Use track ID or time-played as cache buster
  const trackId = player?.track?.id;
  const [cacheBuster, setCacheBuster] = useState(trackId || Date.now());

  useEffect(() => {
    // If track ID changes, update cache buster
    setCacheBuster(trackId || Date.now());
  }, [trackId]);

  const src = `/artwork/${playerNumber}?cb=${cacheBuster}`;

  return (
    <Box>
      <img
        src={src}
        alt={`Album art for player ${playerNumber}`}
        style={{
          width: 100,
          height: 100,
          objectFit: 'cover',
          borderRadius: 8,
          border: '1px solid #333',
          background: '#222'
        }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    </Box>
  );
}
