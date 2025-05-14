import React, { useState, useMemo } from 'react';
import { Box, Typography, Tooltip, Paper, Fade, Chip } from '@mui/material';

// Helper function to format duration
const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SetTimeline = function SetTimeline({ history }) {
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  if (!history.length) return null;

  // Memoize derived values
  const start = useMemo(() => history[0].timestamp, [history]);
  const end = useMemo(() => history.length > 1 ? history[history.length - 1].timestamp : history[0].timestamp + 60000, [history]);
  const totalDuration = useMemo(() => end - start, [end, start]);
  const safeDuration = useMemo(() => totalDuration > 0 ? totalDuration : 60000, [totalDuration]);

  // Define getTrackStats as a function
  function getTrackStats(index) {
    if (index === null || index >= history.length) return null;
    const track = history[index];
    const next = history[index + 1];
    const trackEnd = next ? next.timestamp : end;
    const duration = trackEnd - track.timestamp;
    const percentOfSet = ((duration / safeDuration) * 100).toFixed(1);
    return {
      track,
      duration,
      percentOfSet,
      formattedDuration: formatDuration(duration),
      startTime: new Date(track.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(trackEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  }

  const selectedTrackStats = useMemo(() => getTrackStats(selectedTrack), [selectedTrack, history, end, safeDuration]);

  return (
    <Paper 
      sx={{ 
        mt: 3, 
        p: 2, 
        pb: selectedTrack !== null ? 4 : 2,
        borderRadius: 2, 
        bgcolor: '#1e1e1e',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Set Overview
        <Chip 
          label={`${history.length} Tracks • ${formatDuration(totalDuration)} Total`} 
          size="small"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)', 
            color: '#ccc',
            height: 24
          }} 
        />
      </Typography>

      {/* Timeline visualization */}
      <Box 
        display="flex" 
        alignItems="center" 
        height={40} 
        position="relative" 
        minWidth={200} 
        width="100%"
        sx={{ 
          borderRadius: 4, 
          overflow: 'hidden',
          mb: 1,
          cursor: 'pointer',
          '&:hover': { 
            '& .timeline-marker': { opacity: 1 } 
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {history.map((entry, i) => {
          const next = history[i + 1];
          // If only one track, make it fill the bar
          const entryEnd = next ? next.timestamp : end;
          let widthPercent = ((entryEnd - entry.timestamp) / safeDuration) * 100;
          if (history.length === 1) widthPercent = 100;
          // Minimum width for visibility
          const minWidth = 3;
          if (widthPercent < minWidth) widthPercent = minWidth;
          
          // Track duration for tooltip
          const duration = entryEnd - entry.timestamp;
          const durationText = formatDuration(duration);
          
          return (
            <Tooltip
              key={i}
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {entry.artist} - {entry.title}
                  </Typography>
                  <Typography variant="body2">Deck {entry.player}</Typography>
                  <Typography variant="body2">
                    {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(entryEnd).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="body2">Duration: {durationText}</Typography>
                </Box>
              }
              arrow
              placement="top"
              enterDelay={100}
              leaveDelay={200}
            >
              <Box
                onClick={() => setSelectedTrack(selectedTrack === i ? null : i)}
                sx={{
                  height: 24,
                  width: `${widthPercent}%`,
                  bgcolor: entry.player === 1 ? 'primary.main' : 'secondary.main', // Different color per deck
                  opacity: selectedTrack === i ? 1 : 0.8,
                  cursor: 'pointer',
                  borderRadius: i === 0 ? '8px 0 0 8px' : i === history.length - 1 ? '0 8px 8px 0' : 0,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scaleY(1.1)',
                    zIndex: 2
                  },
                  border: selectedTrack === i ? '2px solid #fff' : 'none',
                  boxSizing: 'border-box'
                }}
              >
              </Box>
            </Tooltip>
          );
        })}

        {/* Interactive time marker that follows mouse - only visible when hovering */}
        {isHovering && (
          <Box 
            className="timeline-marker"
            sx={{
              position: 'absolute',
              height: '100%',
              width: '1px',
              bgcolor: '#fff',
              opacity: 0,
              transition: 'opacity 0.2s',
              pointerEvents: 'none',
              zIndex: 3,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -5,
                left: -4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#fff'
              }
            }}
            style={{ 
              left: `${(Date.now() - start) / (end - start) * 100}%` 
            }}
          />
        )}
      </Box>

      {/* Current position and end time */}
      <Box display="flex" justifyContent="space-between" mt={1}>
        <Typography variant="caption" sx={{ color: '#aaa' }}> 
          Start: {new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
        <Typography variant="caption" sx={{ color: '#aaa' }}> 
          End: {new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      {/* Track details panel that appears when a track is selected */}
      {selectedTrackStats && (
        <Fade in={selectedTrack !== null}>
          <Box 
            sx={{ 
              mt: 2,
              pt: 1,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              color: '#fff'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#29D9B9' }}>
              Selected Track
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {selectedTrackStats.track.artist} - {selectedTrackStats.track.title}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Duration</Typography>
                <Typography variant="body2">{selectedTrackStats.formattedDuration}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>BPM</Typography>
                <Typography variant="body2">{selectedTrackStats.track.bpm || 'Unknown'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Key</Typography>
                <Typography variant="body2">{selectedTrackStats.track.key || 'Unknown'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Genre</Typography>
                <Typography variant="body2">{selectedTrackStats.track.genre || 'Unknown'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Deck</Typography>
                <Typography variant="body2">{selectedTrackStats.track.player}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>Time Played</Typography>
                <Typography variant="body2">
                  {selectedTrackStats.startTime} - {selectedTrackStats.endTime}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#aaa' }}>% of Set</Typography>
                <Typography variant="body2">{selectedTrackStats.percentOfSet}%</Typography>
              </Box>
            </Box>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default React.memo(SetTimeline);