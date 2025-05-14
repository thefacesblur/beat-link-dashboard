import React, { useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Tabs, Tab } from '@mui/material';
import TrackAnalytics from './TrackAnalytics';
import { useSettings } from './SettingsContext';

export default function TrackHistory({ history, players }) {
  const [tab, setTab] = useState(0);
  const { analyticsEnabled, trackHistoryFields } = useSettings ? useSettings() : { analyticsEnabled: true, trackHistoryFields: ['Time', 'Deck', 'Artist', 'Title', 'BPM', 'Genre'] };
  
  if (!history.length) return null;

  // Map field names to render logic
  const fieldMap = {
    'Time': entry => <TableCell sx={{ whiteSpace: 'nowrap', minWidth: '60px', overflow: 'hidden' }}>{new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>,
    'Deck': entry => <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.player}</TableCell>,
    'Artist': entry => <TableCell sx={{ wordBreak: 'break-word', maxWidth: '250px' }}>{entry.artist}</TableCell>,
    'Title': entry => <TableCell sx={{ wordBreak: 'break-word', maxWidth: '400px' }}>{entry.title}</TableCell>,
    'BPM': entry => <TableCell sx={{ whiteSpace: 'nowrap', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.bpm}</TableCell>,
    'Genre': entry => <TableCell sx={{ wordBreak: 'break-word', maxWidth: '200px' }}>{entry.genre}</TableCell>,
  };

  return (
    <Paper sx={{ mt: 3, p: 2, overflowX: 'auto', borderRadius: 3 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="History" />
        {analyticsEnabled && <Tab label="Analytics" />}
      </Tabs>
      {tab === 0 && (
        <Box sx={{ minWidth: 320, maxWidth: '100%', overflowX: 'auto' }}>
          <Typography variant="h6" gutterBottom>Track History</Typography>
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                {trackHistoryFields.map(field => (
                  <TableCell key={field}>{field}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {history.slice().reverse().map((entry, i) => (
                <TableRow key={i}>
                  {trackHistoryFields.map(field => fieldMap[field]?.(entry))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
      {tab === 1 && analyticsEnabled && <TrackAnalytics history={history} />}
    </Paper>
  );
}
