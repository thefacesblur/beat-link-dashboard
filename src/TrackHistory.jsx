import React from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';

export default function TrackHistory({ history }) {
  if (!history.length) return null;
  return (
    <Paper sx={{ mt: 4, p: 2, overflowX: 'auto' }}>
      <Typography variant="h6" gutterBottom>Track History</Typography>
      <Box sx={{ minWidth: 320, maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Deck</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>BPM</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.slice().reverse().map((entry, i) => (
              <TableRow key={i}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(entry.timestamp).toLocaleTimeString()}</TableCell>
                <TableCell>{entry.player}</TableCell>
                <TableCell
                  sx={{
                    wordBreak: 'break-word',
                    maxWidth: 120,
                    fontSize: { xs: '0.8rem', sm: '1rem' }
                  }}
                >
                  {entry.artist}
                </TableCell>
                <TableCell sx={{ wordBreak: 'break-word', maxWidth: 160 }}>{entry.title}</TableCell>
                <TableCell>{entry.bpm}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
