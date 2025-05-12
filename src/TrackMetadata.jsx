import React from 'react';
import { Typography } from '@mui/material';

export default function TrackMetadata({ track, player }) {
  // Try all possible fields for BPM
  const bpm =
    (track && (track.starting_tempo || track.bpm)) ||
    player['track-bpm'] ||
    player.tempo ||
    'Unknown';

  if (!track || (!track.title && !track.artist)) {
    return <Typography color="text.secondary">No track loaded.</Typography>;
  }
  return (
    <div>
      <Typography><strong>Track:</strong> {track.title || 'Unknown'}</Typography>
      <Typography><strong>Artist:</strong> {track.artist || 'Unknown'}</Typography>
      <Typography><strong>BPM:</strong> {bpm}</Typography>
      <Typography><strong>Key:</strong> {track.key || 'Unknown'}</Typography>
      {/* Add more fields as available */}
    </div>
  );
}
