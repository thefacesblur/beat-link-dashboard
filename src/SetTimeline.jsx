import React from 'react';
import { Box, Typography, Tooltip, Paper } from '@mui/material';

export default function SetTimeline({ history }) {
  if (!history.length) return null;

  // Calculate total set duration
  const start = history[0].timestamp;
  // Fudge end time if only one track
  const end = history.length > 1 ? history[history.length - 1].timestamp : start + 60000;
  const totalDuration = end - start;
  const safeDuration = totalDuration > 0 ? totalDuration : 60000;

  return (
    <Paper sx={{ mt: 3, p: 2, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>Set Overview</Typography>
      <Box display="flex" alignItems="center" height={32} position="relative" minWidth={200} width="100%">
        {history.map((entry, i) => {
          const next = history[i + 1];
          // If only one track, make it fill the bar
          const entryEnd = next ? next.timestamp : end;
          let widthPercent = ((entryEnd - entry.timestamp) / safeDuration) * 100;
          if (history.length === 1) widthPercent = 100;
          // Minimum width for visibility
          if (widthPercent < 5) widthPercent = 5;
          return (
            <Tooltip
              key={i}
              title={
                <span>
                  <b>{entry.artist} - {entry.title}</b><br />
                  Deck {entry.player}<br />
                  {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              }
              arrow
            >
              <Box
                sx={{
                  height: 18,
                  width: `${widthPercent}%`,
                  bgcolor: i % 2 === 0 ? 'primary.main' : 'secondary.main',
                  opacity: 0.8,
                  cursor: 'pointer',
                  borderRadius: i === 0 ? '12px 0 0 12px' : i === history.length - 1 ? '0 12px 12px 0' : 0,
                  transition: 'background 0.2s'
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
      <Box display="flex" justifyContent="space-between" mt={1}>
        <Typography variant="caption"> Start: {new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Typography>
        <Typography variant="caption"> End: {new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' } )}</Typography>
      </Box>
    </Paper>
  );
}
