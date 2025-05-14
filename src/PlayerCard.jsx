import React, { useMemo } from 'react';
import TrackMetadata from './TrackMetadata';
import AlbumArt from './AlbumArt';
import WaveformPreview from './WaveformPreview';
import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

// Memoized helper functions
const getPlayerStatus = (player) => {
  if (player['is-playing']) return 'Playing';
  if (player['is-paused']) return 'Paused';
  if (player['is-track-loaded']) return 'Loaded';
  return 'Idle';
};

const msToTime = (ms) => {
  if (!ms || ms < 0) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Memoized beat visualizer component
const CircularBeatVisualizer = React.memo(({ beatWithinBar, beatsPerBar = 4 }) => {
  // Pre-compute arcs for better performance
  const arcs = useMemo(() => {
    const size = 40;
    const radius = 14;
    const center = size / 2;
    
    const polarToCartesian = (cx, cy, r, angle) => {
      const rad = ((angle - 90) * Math.PI) / 180.0;
      return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad)
      };
    };
    
    return Array.from({ length: beatsPerBar }, (_, i) => {
      const startAngle = (i * 360) / beatsPerBar;
      const endAngle = ((i + 1) * 360) / beatsPerBar;
      const start = polarToCartesian(center, center, radius, startAngle);
      const end = polarToCartesian(center, center, radius, endAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return [
        'M', start.x, start.y,
        'A', radius, radius, 0, largeArcFlag, 1, end.x, end.y
      ].join(' ');
    });
  }, [beatsPerBar]);
  
  return (
    <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: -3 }}>
      <svg width={40} height={40}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc}
            fill="none"
            stroke={i + 1 === beatWithinBar ? '#29D9B9' : ''}
            strokeWidth={8}
            opacity={i + 1 === beatWithinBar ? 1 : 0.0}
            style={{
              transition: 'stroke 0.1s, opacity 0.1s'
            }}
          />
        ))}
      </svg>
    </Box>
  );
});

// Memoized track progress component
const TrackProgressBar = React.memo(({ timePlayedMs, durationSec, beatWithinBar }) => {
  const progress = useMemo(() => 
    durationSec ? Math.min(100, (timePlayedMs / (durationSec * 1000)) * 100) : 0
  , [timePlayedMs, durationSec]);
  
  const timePlayed = msToTime(timePlayedMs);
  const timeRemaining = msToTime(durationSec * 1000 - timePlayedMs);

  return (
    <Box mt={3.5} display="flex" alignItems="center" gap={1.5} mb={-0.5}>
      <CircularBeatVisualizer beatWithinBar={beatWithinBar} />
      <Box flex={1}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 3, backgroundColor: 'grey.800' }}
        />
        <Box display="flex" justifyContent="space-between" mt={0.5}>
          <Typography variant="caption" color="text.secondary">
            {timePlayed}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            -{timeRemaining}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});

// Memoized status indicator
const PlayerStatusIndicator = React.memo(({ online }) => (
  <FiberManualRecordIcon
    fontSize="small"
    sx={{ color: online ? '#00e676' : '#f44336', verticalAlign: 'middle', mr: 1 }}
    titleAccess={online ? 'Online' : 'Offline'}
  />
));

// Main player card component
const PlayerCard = React.memo(({ player }) => {
  const playerStatus = useMemo(() => getPlayerStatus(player), [player]);
  
  return (
    <Card sx={{ width: '100%', maxWidth: 600, minWidth: 300, backgroundColor: 'background.paper', margin: '0 auto', borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <PlayerStatusIndicator online={true /* or false if offline */} />
          Deck {player.number}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {playerStatus}
        </Typography>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <AlbumArt playerNumber={player.number} player={player} />
          <TrackMetadata track={player.track} player={player} />
        </Box>
        <Box width="100%" mt={2} mb={1}>
          <WaveformPreview playerNumber={player.number} player={player} />
        </Box>
        <TrackProgressBar
          timePlayedMs={player['time-played']?.['raw-milliseconds']}
          durationSec={player.track?.duration}
          beatWithinBar={player['beat-within-bar']}
        />
      </CardContent>
    </Card>
  );
});

export default PlayerCard;
